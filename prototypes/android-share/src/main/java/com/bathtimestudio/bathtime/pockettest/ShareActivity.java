package com.bathtimestudio.bathtime.pockettest;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityManager;
import android.widget.Button;
import android.widget.LinearLayout;

public final class ShareActivity extends Activity {
    private final Handler handler = new Handler(Looper.getMainLooper());

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        String text = sharedText(getIntent());
        String url = SharedLink.extract(text);
        String title;
        String detail;
        boolean saved = false;
        if (url == null) {
            title = "링크를 찾지 못했어요";
            detail = "릴스나 쇼츠의 공유 메뉴에서\n링크를 보내주세요.";
        } else {
            try {
                boolean added = new LinkStore(this).save(url, text, getIntent().getStringExtra(Intent.EXTRA_SUBJECT));
                title = added ? "담았어요" : "이미 담아둔 링크예요";
                detail = SharedLink.source(url) + " · 이 휴대폰에 저장했어요";
                saved = true;
            } catch (Exception error) {
                title = "저장하지 못했어요";
                detail = "휴대폰의 여유 공간을 확인한 뒤\n다시 공유해 주세요.";
            }
        }

        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(Ui.dp(this, 24), Ui.dp(this, 24), Ui.dp(this, 24), Ui.dp(this, 16));
        card.setBackground(Ui.rounded(this, Ui.PAPER, 24));
        Ui.add(card, Ui.text(this, "바스타임  /  공유 테스트", 12, Ui.GREEN, true), 0);
        Ui.add(card, Ui.text(this, title, 25, Ui.INK, true), 14);
        Ui.add(card, Ui.text(this, detail, 14, Ui.MUTED, false), 8);
        if (saved) Ui.add(card, Ui.text(this, "곧 보던 화면으로 돌아가요.", 12, Ui.MUTED, false), 12);
        Button close = new Button(this);
        close.setText("보던 화면으로");
        close.setTextColor(Ui.GREEN);
        close.setBackground(Ui.rounded(this, android.graphics.Color.rgb(228, 236, 229), 14));
        close.setOnClickListener(view -> finish());
        Ui.add(card, close, 18);
        setContentView(card);
        setFinishOnTouchOutside(true);
        WindowManager.LayoutParams window = getWindow().getAttributes();
        window.width = Math.min(getResources().getDisplayMetrics().widthPixels - Ui.dp(this, 32), Ui.dp(this, 440));
        window.height = WindowManager.LayoutParams.WRAP_CONTENT;
        window.gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
        window.y = Ui.dp(this, 24);
        getWindow().setAttributes(window);

        if (saved) {
            AccessibilityManager accessibility = (AccessibilityManager) getSystemService(ACCESSIBILITY_SERVICE);
            // Screen-reader users dismiss explicitly; everyone else gets a short confirmation.
            if (accessibility == null || !accessibility.isTouchExplorationEnabled()) {
                int delay = 1600;
                if (Build.VERSION.SDK_INT >= 29 && accessibility != null) {
                    delay = accessibility.getRecommendedTimeoutMillis(delay,
                        AccessibilityManager.FLAG_CONTENT_TEXT | AccessibilityManager.FLAG_CONTENT_CONTROLS);
                }
                handler.postDelayed(this::finish, delay);
            }
        }
    }

    private String sharedText(Intent intent) {
        if (!Intent.ACTION_SEND.equals(intent.getAction())) return "";
        CharSequence extra = intent.getCharSequenceExtra(Intent.EXTRA_TEXT);
        if (extra != null && SharedLink.extract(extra.toString()) != null) return extra.toString();
        ClipData clip = intent.getClipData();
        if (clip != null) {
            for (int i = 0; i < clip.getItemCount(); i++) {
                ClipData.Item item = clip.getItemAt(i);
                String value = item.getText() != null ? item.getText().toString()
                    : item.getUri() == null ? "" : item.getUri().toString();
                if (SharedLink.extract(value) != null) return value;
            }
        }
        return extra == null ? "" : extra.toString();
    }

    @Override protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        super.onDestroy();
    }
}
