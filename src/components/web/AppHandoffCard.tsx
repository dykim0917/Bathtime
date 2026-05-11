import React, { useEffect } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Href, router } from 'expo-router';
import { Sparkle } from '@/src/components/web/phosphorIcons';
import { trackArchiveEvent } from '@/src/analytics/events';
import type { ArchiveAnalyticsEventName } from '@/src/analytics/events';
import { useAuth } from '@/src/auth/AuthProvider';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';

type AppHandoffSource = 'content' | 'saved' | 'routine_preview';

type Props = {
  source: AppHandoffSource;
  title: string;
  body: string;
  ctaLabel: string;
  deepLink: string;
  contentId?: string;
  contentCategory?: string;
  ctaType: string;
};

const FALLBACK_PATH = '/app';

function eventNameForSource(source: AppHandoffSource): ArchiveAnalyticsEventName {
  if (source === 'content') return 'app_handoff_from_content';
  if (source === 'saved') return 'app_handoff_from_saved';
  return 'app_handoff_from_routine_preview';
}

export function AppHandoffCard({ source, title, body, ctaLabel, deepLink, contentId, contentCategory, ctaType }: Props) {
  const { isAuthenticated } = useAuth();
  const payload = {
    sourcePage: source,
    contentId,
    contentCategory,
    ctaType,
    platform: 'web',
    deviceType: 'web',
    loggedIn: isAuthenticated,
  };

  useEffect(() => {
    trackArchiveEvent('app_cta_impression', payload);
  }, [contentId, contentCategory, ctaType, isAuthenticated, source]);

  const handlePress = async () => {
    trackArchiveEvent('app_cta_clicked', payload);
    trackArchiveEvent(eventNameForSource(source), payload);

    try {
      const canOpen = await Linking.canOpenURL(deepLink);
      if (canOpen) {
        await Linking.openURL(deepLink);
        return;
      }
    } catch {
      // Fallback below keeps the handoff useful when the app is not installed.
    }

    router.push(`${FALLBACK_PATH}?from=${source}` as Href);
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconBadge}>
        <Sparkle size={21} color={archiveColors.primaryActive} weight="regular" />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>{ctaLabel}</Text>
      </Pressable>
      <Text style={styles.note}>앱이 설치되어 있지 않으면 안내 페이지로 이동합니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: archiveColors.surface,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    borderRadius: archiveRadius.lg,
    padding: 16,
    gap: 14,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: archiveRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: archiveColors.primarySoft,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
  },
  textBlock: {
    gap: 7,
  },
  title: {
    color: archiveColors.ink,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  body: {
    color: archiveColors.body,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: luxuryFonts.sans,
  },
  button: {
    minHeight: 46,
    borderRadius: archiveRadius.md,
    backgroundColor: archiveColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: archiveColors.onPrimary,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  note: {
    color: archiveColors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
});
