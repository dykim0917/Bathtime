package com.bathtimestudio.bathtime.pockettest;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.IOException;

final class LinkStore {
    private final SharedPreferences preferences;

    LinkStore(Context context) {
        preferences = context.getSharedPreferences("saved_links", Context.MODE_PRIVATE);
    }

    JSONArray read() throws JSONException {
        return new JSONArray(preferences.getString("items", "[]"));
    }

    boolean save(String url, String text, String subject) throws JSONException, IOException {
        JSONArray previous = read();
        String identity = SharedLink.identity(url);
        for (int i = 0; i < previous.length(); i++) {
            if (identity.equals(previous.getJSONObject(i).getString("identity"))) return false;
        }
        JSONObject item = new JSONObject();
        item.put("identity", identity);
        item.put("url", url);
        item.put("sharedText", text);
        item.put("subject", subject == null ? "" : subject);
        item.put("savedAt", System.currentTimeMillis());
        JSONArray next = new JSONArray().put(item);
        for (int i = 0; i < previous.length(); i++) next.put(previous.get(i));
        write(next);
        return true;
    }

    void delete(String identity) throws JSONException, IOException {
        JSONArray previous = read();
        JSONArray next = new JSONArray();
        for (int i = 0; i < previous.length(); i++) {
            JSONObject item = previous.getJSONObject(i);
            if (!identity.equals(item.getString("identity"))) next.put(item);
        }
        write(next);
    }

    private void write(JSONArray items) throws IOException {
        // A success message is shown only after the local file has been written.
        if (!preferences.edit().putString("items", items.toString()).commit()) {
            throw new IOException("Local save failed");
        }
    }
}
