package com.bathtimestudio.bathtime.pockettest;

import org.junit.Test;
import static org.junit.Assert.*;

public class SharedLinkTest {
    @Test public void extractsLinksFromRealisticSharePayloads() {
        assertEquals("https://www.instagram.com/reel/Example/?igsh=abc", SharedLink.extract("온천에서 쉬는 하루\nhttps://www.instagram.com/reel/Example/?igsh=abc"));
        assertEquals("https://youtu.be/AbCd123?si=xyz", SharedLink.extract("https://youtu.be/AbCd123?si=xyz"));
        assertEquals("https://maps.app.goo.gl/AbCd123", SharedLink.extract("테리하 스파 (https://maps.app.goo.gl/AbCd123)"));
        assertEquals("https://shop.example/bath?id=42", SharedLink.extract("입욕제 https://shop.example/bath?id=42"));
    }

    @Test public void ignoresUnsafeAndMalformedPayloads() {
        assertNull(SharedLink.extract("javascript:alert(1)"));
        assertNull(SharedLink.extract("file:///private/photo.jpg"));
        assertNull(SharedLink.extract("content://photos/123"));
        assertNull(SharedLink.extract("https://user:password@example.com"));
        assertNull(SharedLink.extract("메모만 공유했어요"));
        assertNull(SharedLink.extract(null));
    }

    @Test public void deduplicatesShareTrackingAndYoutubeFormats() {
        assertEquals(SharedLink.identity("https://www.instagram.com/reel/Abc/?igsh=one"), SharedLink.identity("https://www.instagram.com/reel/Abc/?igsh=two&utm_source=share"));
        assertEquals(SharedLink.identity("https://youtube.com/shorts/Abc?si=one"), SharedLink.identity("https://youtu.be/Abc?si=two"));
        assertEquals(SharedLink.identity("https://www.youtube.com/watch?v=Abc&si=one"), SharedLink.identity("https://youtu.be/Abc"));
        assertNotEquals(SharedLink.identity("https://shop.example/item?id=1"), SharedLink.identity("https://shop.example/item?id=2"));
        assertNotEquals(SharedLink.identity("https://shop.example/?v=1"), SharedLink.identity("https://youtu.be/1"));
    }
}
