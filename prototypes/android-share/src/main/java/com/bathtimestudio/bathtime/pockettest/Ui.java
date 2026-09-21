package com.bathtimestudio.bathtime.pockettest;

import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.widget.LinearLayout;
import android.widget.TextView;

final class Ui {
    static final int GREEN = Color.rgb(38, 105, 95);
    static final int INK = Color.rgb(35, 54, 48);
    static final int MUTED = Color.rgb(100, 115, 108);
    static final int PAPER = Color.rgb(247, 246, 240);

    static int dp(Context context, float value) {
        return Math.round(value * context.getResources().getDisplayMetrics().density);
    }

    static GradientDrawable rounded(Context context, int color, int radius) {
        GradientDrawable background = new GradientDrawable();
        background.setColor(color);
        background.setCornerRadius(dp(context, radius));
        return background;
    }

    static TextView text(Context context, String content, int size, int color, boolean bold) {
        TextView view = new TextView(context);
        view.setText(content);
        view.setTextSize(size);
        view.setTextColor(color);
        view.setFontFeatureSettings("kern");
        view.setLineSpacing(dp(context, 4), 1);
        if (bold) view.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        return view;
    }

    static void add(LinearLayout parent, android.view.View child, int topMargin) {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(-1, -2);
        params.topMargin = dp(parent.getContext(), topMargin);
        parent.addView(child, params);
    }
}
