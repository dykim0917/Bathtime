package expo.modules.bathtimepocket

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.security.KeyStore
import java.util.UUID
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/** One process owns both the native share activity and Expo module. */
class PocketStore(private val context: Context) {
  private val prefs = context.getSharedPreferences("bathtime-pocket", Context.MODE_PRIVATE)
  private val secure = context.getSharedPreferences("bathtime-pocket-auth", Context.MODE_PRIVATE)
  companion object {
    private val entriesLock = Any()
    private val authLock = Any()
    private const val alias = "bathtime-pocket-auth-v1"
    @Volatile var onChange: (() -> Unit)? = null
  }

  private fun key(): SecretKey {
    val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    (store.getKey(alias, null) as? SecretKey)?.let { return it }
    return KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore").apply {
      init(KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build())
    }.generateKey()
  }

  private fun secureRead(name: String): String? {
    val stored = secure.getString(name, null) ?: return null
    val parts = stored.split(":", limit = 2)
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, Base64.decode(parts[0], Base64.NO_WRAP)))
    return String(cipher.doFinal(Base64.decode(parts[1], Base64.NO_WRAP)), Charsets.UTF_8)
  }

  private fun secureWrite(name: String, value: String) {
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.ENCRYPT_MODE, key())
    val encoded = Base64.encodeToString(cipher.iv, Base64.NO_WRAP) + ":" +
      Base64.encodeToString(cipher.doFinal(value.toByteArray(Charsets.UTF_8)), Base64.NO_WRAP)
    check(secure.edit().putString(name, encoded).commit()) { "로그인 정보를 저장하지 못했어요." }
  }

  fun configure(url: String, apiKey: String) {
    require(url.startsWith("https://"))
    check(prefs.edit().putString("url", url.trimEnd('/')).putString("apiKey", apiKey).commit())
    PocketSyncWorker.schedule(context)
  }

  fun owner(): String = prefs.getString("owner", "") ?: ""
  fun authGet(name: String): String? = synchronized(authLock) {
    if (name == prefs.getString("sessionKey", null)) try { refreshSession() } catch (_: java.io.IOException) { /* Keep offline session. */ }
    secureRead(name)
  }

  fun authSet(name: String, value: String) = synchronized(authLock) {
    secureWrite(name, value)
    if (name.endsWith("-auth-token")) {
      val session = JSONObject(value)
      val user = session.optJSONObject("user")?.optString("id", "") ?: ""
      check(prefs.edit().putString("sessionKey", name).putString("owner", user).commit())
      if (user.isNotEmpty()) synchronized(entriesLock) {
        val entries = all()
        for (i in 0 until entries.length()) {
          val row = entries.getJSONObject(i)
          if (row.optString("ownerId", "").isEmpty()) row.put("ownerId", user)
        }
        write(entries)
      }
      PocketSyncWorker.schedule(context)
    }
  }

  fun authRemove(name: String) = synchronized(authLock) {
    check(secure.edit().remove(name).commit())
    if (name == prefs.getString("sessionKey", null)) {
      check(prefs.edit().remove("sessionKey").remove("owner").commit())
    }
  }

  private fun all(): JSONArray = JSONArray(prefs.getString("entries", "[]"))
  private fun write(entries: JSONArray) {
    check(prefs.edit().putString("entries", entries.toString()).commit()) { "링크를 저장하지 못했어요." }
    onChange?.invoke()
  }
  fun entries(user: String): String = synchronized(entriesLock) {
    val result = JSONArray()
    val entries = all()
    for (i in 0 until entries.length()) {
      val row = entries.getJSONObject(i)
      if (row.optString("ownerId", "") == user || row.optString("ownerId", "").isEmpty()) result.put(row)
    }
    result.toString()
  }

  fun enqueue(raw: String, title: String): String = synchronized(entriesLock) {
    require(raw.length <= 16000) { "링크만 공유해 주세요." }
    val url = Regex("https?://[^\\s<>\"]+", RegexOption.IGNORE_CASE).find(raw)?.value
      ?: throw IllegalArgumentException("저장할 링크를 찾지 못했어요.")
    val uri = android.net.Uri.parse(url)
    require(uri.host?.contains('.') == true && uri.userInfo == null && uri.port == -1) { "공개 웹페이지 링크를 넣어 주세요." }
    val entries = all()
    val user = owner()
    for (i in 0 until entries.length()) {
      val row = entries.getJSONObject(i)
      if (row.optString("url") == url && row.optString("ownerId", "") == user) {
        require(row.optString("state") != "deleting") { "삭제 중이에요. 잠시 후 다시 저장해 주세요." }
        return@synchronized row.toString()
      }
    }
    val row = JSONObject().put("id", UUID.randomUUID().toString()).put("url", url)
      .put("title", title.take(200)).put("ownerId", user).put("state", "pending")
      .put("createdAt", java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).apply {
        timeZone = java.util.TimeZone.getTimeZone("UTC")
      }.format(java.util.Date()))
    entries.put(row)
    write(entries)
    PocketSyncWorker.schedule(context)
    row.toString()
  }

  fun update(id: String, state: String, sourceId: String = "", error: String = "") = synchronized(entriesLock) {
    val entries = all()
    for (i in 0 until entries.length()) {
      val row = entries.getJSONObject(i)
      if (row.optString("id") == id) {
        if (row.optString("state") != "deleting") row.put("state", state)
        row.put("sourceId", sourceId).put("error", error)
      }
    }
    write(entries)
  }

  fun remove(id: String) = synchronized(entriesLock) {
    val entries = all()
    for (i in 0 until entries.length()) {
      val row = entries.getJSONObject(i)
      if (row.optString("id") == id) {
        if (row.optString("ownerId", "").isEmpty() || row.optString("state") == "error") { purge(id); return@synchronized }
        row.put("state", "deleting")
      }
    }
    write(entries)
    PocketSyncWorker.schedule(context)
  }

  fun purge(id: String) = synchronized(entriesLock) {
    val entries = all()
    val remaining = JSONArray()
    for (i in 0 until entries.length()) if (entries.getJSONObject(i).optString("id") != id) remaining.put(entries.getJSONObject(i))
    write(remaining)
  }

  private fun refreshSession(): JSONObject? {
    val sessionKey = prefs.getString("sessionKey", null) ?: return null
    val session = JSONObject(secureRead(sessionKey) ?: return null)
    if (session.optLong("expires_at") > System.currentTimeMillis() / 1000 + 120) return session
    val baseUrl = prefs.getString("url", null) ?: return session
    val token = session.optString("refresh_token")
    if (token.isEmpty()) return session
    val (status, body) = request("$baseUrl/auth/v1/token?grant_type=refresh_token", JSONObject().put("refresh_token", token), null)
    if (status == 200) {
      val updated = JSONObject(body)
      if (updated.optJSONObject("user")?.optString("id") != owner()) return null
      if (!updated.has("expires_at")) updated.put("expires_at", System.currentTimeMillis() / 1000 + updated.optLong("expires_in", 3600))
      secureWrite(sessionKey, updated.toString())
      return updated
    }
    return session
  }

  fun session(): JSONObject? = synchronized(authLock) { refreshSession() }

  fun request(url: String, body: JSONObject, token: String?, method: String = "POST"): Pair<Int, String> {
    val connection = URL(url).openConnection() as HttpURLConnection
    try {
      connection.requestMethod = method
      connection.connectTimeout = 15000
      connection.readTimeout = 20000
      connection.instanceFollowRedirects = false
      connection.setRequestProperty("Content-Type", "application/json")
      connection.setRequestProperty("apikey", prefs.getString("apiKey", ""))
      if (token != null) connection.setRequestProperty("Authorization", "Bearer $token")
      if (method == "POST") {
        connection.doOutput = true
        connection.outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
      }
      val status = connection.responseCode
      val stream = if (status in 200..299) connection.inputStream else connection.errorStream
      return status to (stream?.bufferedReader()?.use { it.readText() } ?: "")
    } finally { connection.disconnect() }
  }

  fun endpoint(): String? = prefs.getString("url", null)?.let { "$it/functions/v1/archive-save" }
}
