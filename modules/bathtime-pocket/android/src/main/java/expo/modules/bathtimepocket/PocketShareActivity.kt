package expo.modules.bathtimepocket

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.WindowManager
import android.view.accessibility.AccessibilityManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class PocketShareActivity : Activity() {
  private val handler = Handler(Looper.getMainLooper())
  private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()
  override fun onCreate(state: Bundle?) {
    super.onCreate(state)
    val store = PocketStore(this)
    val shared = if (intent.action == Intent.ACTION_SEND) intent.getCharSequenceExtra(Intent.EXTRA_TEXT)?.toString()
      ?: intent.clipData?.takeIf { it.itemCount > 0 }?.getItemAt(0)?.text?.toString() ?: "" else ""
    var saved = false
    var title = "폰에 저장했어요"
    var detail = "곧 보던 화면으로 돌아가요."
    try {
      store.enqueue(shared, intent.getStringExtra(Intent.EXTRA_SUBJECT) ?: "")
      saved = true
      if (store.owner().isEmpty()) detail = "앱에서 로그인하면 정리를 시작할게요."
    } catch (error: Exception) {
      title = "저장하지 못했어요"
      detail = error.message ?: "링크를 다시 공유해 주세요."
    }
    val card = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(dp(24), dp(24), dp(24), dp(20))
      background = GradientDrawable().apply { setColor(Color.WHITE); cornerRadius = dp(24).toFloat() }
    }
    fun label(value: String, size: Float, color: String) = TextView(this).apply {
      text = value; textSize = size; setTextColor(Color.parseColor(color)); setPadding(0, 0, 0, dp(14))
    }
    card.addView(label("바스타임", 13f, "#007F89"))
    card.addView(label(title, 24f, "#20282D"))
    card.addView(label(detail, 14f, "#63717A"))
    card.addView(Button(this).apply {
      text = "보던 화면으로"; isAllCaps = false; minHeight = dp(48)
      setTextColor(Color.parseColor("#007F89"))
      background = GradientDrawable().apply { setColor(Color.parseColor("#E9FAFA")); cornerRadius = dp(14).toFloat() }
      setOnClickListener { finish() }
    })
    setContentView(card)
    setFinishOnTouchOutside(true)
    window.attributes = window.attributes.apply {
      width = minOf(resources.displayMetrics.widthPixels - dp(32), dp(440))
      height = WindowManager.LayoutParams.WRAP_CONTENT
      gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
      y = dp(24)
    }
    val accessibility = getSystemService(ACCESSIBILITY_SERVICE) as AccessibilityManager
    if (saved && !accessibility.isTouchExplorationEnabled) {
      val delay = if (Build.VERSION.SDK_INT >= 29) accessibility.getRecommendedTimeoutMillis(1600,
        AccessibilityManager.FLAG_CONTENT_TEXT or AccessibilityManager.FLAG_CONTENT_CONTROLS) else 1600
      handler.postDelayed({ finish() }, delay.toLong())
    }
  }
  override fun onDestroy() { handler.removeCallbacksAndMessages(null); super.onDestroy() }
}
