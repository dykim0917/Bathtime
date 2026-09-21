package expo.modules.bathtimepocket

import android.content.Context
import androidx.work.*
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class PocketSyncWorker(context: Context, params: WorkerParameters) : Worker(context, params) {
  override fun doWork(): Result {
    val store = PocketStore(applicationContext)
    try {
      val endpoint = store.endpoint() ?: return Result.success()
      val session = store.session() ?: return Result.success()
      val owner = session.optJSONObject("user")?.optString("id", "") ?: return Result.success()
      if (owner.isEmpty() || store.owner() != owner) return Result.success()
      val entries = JSONArray(store.entries(owner))
      var retry = false
      for (i in 0 until entries.length()) {
        if (isStopped || store.owner() != owner) break
        val row = entries.getJSONObject(i)
        if (row.optString("state") == "deleting" && row.optString("ownerId") == owner) {
          val (status, body) = store.request(endpoint, JSONObject().put("requestId", row.getString("id"))
            .put("operation", "cancel").put("url", row.getString("url")), session.getString("access_token"))
          if (status == 200 && JSONObject(body).optBoolean("cancelled")) store.purge(row.getString("id")) else retry = true
          continue
        }
        if (row.optString("state") != "pending" || row.optString("ownerId") != owner) continue
        val (status, body) = store.request(endpoint, JSONObject().put("requestId", row.getString("id"))
          .put("operation", "save").put("url", row.getString("url")).put("title", row.optString("title")), session.getString("access_token"))
        when {
          status == 200 -> {
            val receipt = JSONObject(body)
            if (receipt.optBoolean("cancelled")) store.purge(row.getString("id"))
            else store.update(row.getString("id"), "synced", receipt.getString("sourceId"))
          }
          status == 400 || status == 413 -> store.update(row.getString("id"), "error", error = "이 링크는 정리할 수 없어요. 원문은 폰에 보관했어요.")
          status == 401 -> { store.update(row.getString("id"), "pending", error = "앱을 열어 로그인 상태를 확인해 주세요."); return Result.success() }
          status == 429 -> { store.update(row.getString("id"), "pending", error = "오늘 정리 요청이 많아요. 나중에 다시 보낼게요."); retry = true }
          else -> retry = true
        }
      }
      return if (retry) Result.retry() else Result.success()
    } catch (_: Exception) { return Result.retry() }
  }

  companion object {
    fun schedule(context: Context) {
      val request = OneTimeWorkRequestBuilder<PocketSyncWorker>()
        .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
        .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS).build()
      WorkManager.getInstance(context).enqueueUniqueWork("bathtime-pocket-sync", ExistingWorkPolicy.APPEND_OR_REPLACE, request)
    }
  }
}
