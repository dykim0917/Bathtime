package com.bathtimestudio.bathtime.pockettest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

final class SharedLink {
    private static final Pattern URL = Pattern.compile("https?://[^\\s<>\"\\p{Cntrl}]+", Pattern.CASE_INSENSITIVE);

    static String extract(String text) {
        if (text == null) return null;
        Matcher matcher = URL.matcher(text);
        while (matcher.find()) {
            String candidate = matcher.group().replaceAll("[.,!?;:)}\\]'’”]+$", "");
            try {
                URI uri = new URI(candidate);
                if (uri.getHost() != null && uri.getUserInfo() == null) return candidate;
            } catch (URISyntaxException ignored) {
                // Continue if a caption contains malformed text before a usable link.
            }
        }
        return null;
    }

    static String identity(String url) {
        URI uri = URI.create(url);
        String host = uri.getHost().toLowerCase(Locale.ROOT);
        String path = uri.getRawPath();
        List<String> query = new ArrayList<>();
        String video = null;
        if (uri.getRawQuery() != null) {
            for (String part : uri.getRawQuery().split("&")) {
                String key = part.split("=", 2)[0].toLowerCase(Locale.ROOT);
                if (key.equals("v") && part.contains("=")) video = part.substring(part.indexOf('=') + 1);
                if (!key.startsWith("utm_") && !key.equals("igsh") && !key.equals("igshid") && !key.equals("si")) query.add(part);
            }
        }
        if (host.equals("youtu.be")) video = path.substring(1);
        if (host.equals("youtube.com") || host.equals("www.youtube.com") || host.equals("m.youtube.com")) {
            if (path.startsWith("/shorts/")) video = path.substring(8).replaceAll("/$", "");
        } else if (!host.equals("youtu.be")) {
            video = null;
        }
        if (video != null && !video.isEmpty()) return "youtube:" + video;
        return uri.getScheme().toLowerCase(Locale.ROOT) + "://" + host
            + (uri.getPort() == -1 ? "" : ":" + uri.getPort()) + path
            + (query.isEmpty() ? "" : "?" + String.join("&", query))
            + (uri.getRawFragment() == null ? "" : "#" + uri.getRawFragment());
    }

    static String source(String url) {
        String host = URI.create(url).getHost().toLowerCase(Locale.ROOT);
        if (host.equals("instagram.com") || host.endsWith(".instagram.com")) return "Instagram";
        if (host.equals("youtu.be") || host.equals("youtube.com") || host.endsWith(".youtube.com")) return "YouTube";
        if (host.equals("maps.app.goo.gl") || host.equals("maps.google.com")) return "Google Maps";
        return host.startsWith("www.") ? host.substring(4) : host;
    }
}
