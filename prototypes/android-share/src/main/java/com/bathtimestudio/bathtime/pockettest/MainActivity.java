package com.bathtimestudio.bathtime.pockettest;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.view.WindowInsets;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public final class MainActivity extends Activity {
    @Override protected void onResume() {
        super.onResume();
        render();
    }

    private void render() {
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(Ui.PAPER);
        LinearLayout content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        scroll.addView(content);
        scroll.setOnApplyWindowInsetsListener((view, insets) -> {
            int top;
            int bottom;
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                top = bars.top;
                bottom = bars.bottom;
            } else {
                top = insets.getSystemWindowInsetTop();
                bottom = insets.getSystemWindowInsetBottom();
            }
            scroll.setPadding(0, top, 0, bottom);
            content.setPadding(Ui.dp(this, 22), Ui.dp(this, 28), Ui.dp(this, 22), Ui.dp(this, 28));
            return insets;
        });
        setContentView(scroll);
        Ui.add(content, Ui.text(this, "BATHTIME  /  공유 테스트", 12, Ui.GREEN, true), 0);
        Ui.add(content, Ui.text(this, "나중에 꺼내볼\n목욕의 조각들", 30, Ui.INK, true), 18);
        Ui.add(content, Ui.text(this, "보던 곳에서 공유하고, 계속 보세요.", 15, Ui.MUTED, false), 12);

        LinearLayout hint = new LinearLayout(this);
        hint.setOrientation(LinearLayout.VERTICAL);
        hint.setPadding(Ui.dp(this, 18), Ui.dp(this, 18), Ui.dp(this, 18), Ui.dp(this, 18));
        hint.setBackground(Ui.rounded(this, Color.rgb(232, 238, 230), 18));
        Ui.add(hint, Ui.text(this, "릴스 · 쇼츠 · 지도 · 제품 링크", 15, Ui.GREEN, true), 0);
        Ui.add(hint, Ui.text(this, "공유 → 더보기 → 바스타임에 담기\n폴더나 메모를 고를 필요 없어요.", 14, Ui.INK, false), 8);
        Ui.add(hint, Ui.text(this, "이 테스트는 링크를 폰에만 보관해요.\n자동 정리와 서버 전송은 아직 없어요.", 12, Ui.MUTED, false), 14);
        Ui.add(content, hint, 26);

        try {
            JSONArray items = new LinkStore(this).read();
            Ui.add(content, Ui.text(this, "담아둔 링크  " + items.length(), 19, Ui.INK, true), 28);
            if (items.length() == 0) {
                Ui.add(content, Ui.text(this, "마음에 드는 링크 하나를 공유해 보세요.\n여기에 차곡차곡 모아둘게요.", 15, Ui.MUTED, false), 20);
            }
            for (int i = 0; i < items.length(); i++) addCard(content, items.getJSONObject(i));
            if (items.length() > 0) Ui.add(content, Ui.text(this, "눌러서 원문 열기 · 길게 눌러 삭제", 12, Ui.MUTED, false), 20);
        } catch (Exception error) {
            Ui.add(content, Ui.text(this, "저장한 링크를 읽지 못했어요.\n앱을 다시 열어주세요.", 15, Ui.MUTED, false), 24);
        }
    }

    private void addCard(LinearLayout parent, JSONObject item) throws org.json.JSONException {
        String url = item.getString("url");
        String identity = item.getString("identity");
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(Ui.dp(this, 18), Ui.dp(this, 18), Ui.dp(this, 18), Ui.dp(this, 18));
        card.setBackground(Ui.rounded(this, Color.WHITE, 18));
        Ui.add(card, Ui.text(this, SharedLink.source(url), 12, Ui.GREEN, true), 0);
        String subject = item.optString("subject").trim();
        String shared = item.optString("sharedText").trim();
        String title = !subject.isEmpty() ? subject : shared.equals(url) ? "저장한 링크" : shared;
        TextView titleView = Ui.text(this, title, 16, Ui.INK, true);
        titleView.setMaxLines(3);
        titleView.setEllipsize(android.text.TextUtils.TruncateAt.END);
        Ui.add(card, titleView, 8);
        TextView linkView = Ui.text(this, url, 12, Ui.MUTED, false);
        linkView.setMaxLines(2);
        linkView.setEllipsize(android.text.TextUtils.TruncateAt.END);
        Ui.add(card, linkView, 6);
        String date = new SimpleDateFormat("M월 d일 HH:mm", Locale.KOREA).format(new Date(item.getLong("savedAt")));
        Ui.add(card, Ui.text(this, date + "  ·  원문 열기 ↗", 12, Ui.MUTED, false), 12);
        card.setOnClickListener(view -> {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
            } catch (ActivityNotFoundException error) {
                Toast.makeText(this, "링크를 열 수 있는 앱이 없어요.", Toast.LENGTH_SHORT).show();
            }
        });
        card.setOnLongClickListener(view -> {
            new AlertDialog.Builder(this).setTitle("이 링크를 삭제할까요?")
                .setMessage("이 휴대폰의 보관함에서 삭제해요.")
                .setNegativeButton("취소", null)
                .setPositiveButton("삭제", (dialog, which) -> {
                    try {
                        new LinkStore(this).delete(identity);
                        render();
                    } catch (Exception error) {
                        Toast.makeText(this, "삭제하지 못했어요.", Toast.LENGTH_SHORT).show();
                    }
                }).show();
            return true;
        });
        Ui.add(parent, card, 12);
    }
}
