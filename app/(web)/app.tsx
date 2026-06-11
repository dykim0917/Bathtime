import React, { useEffect } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArchivePageContainer } from '@/src/components/web/ArchivePageContainer';
import { SeoMetadata } from '@/src/components/web/SeoMetadata';
import { WebShell, webStyles } from '@/src/components/web/WebShell';
import { trackArchiveEvent } from '@/src/analytics/events';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.bathtimestudio.bathtime';

export default function AppDownloadPage() {
  useEffect(() => {
    trackArchiveEvent('app_download_page_viewed', { platform: 'web', source: 'app_handoff_fallback' });
  }, []);

  return (
    <WebShell>
      <SeoMetadata title="바스타임 앱 - 바스타임" description="바스타임 앱에서 저장한 콘텐츠와 의식을 이어갑니다." />
      <ArchivePageContainer variant="narrow">
        <View style={webStyles.pageStack}>
          <View style={webStyles.header}>
            <Text style={webStyles.eyebrow}>BATHTIME APP</Text>
            <Text style={webStyles.title}>앱에서 저장하고 실행하기</Text>
            <Text style={webStyles.lede}>
              앱에서는 웹에서 발견한 콘텐츠를 보관하고, 연결된 의식을 타이머로 따라 할 수 있어요.
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>바스타임 앱으로 이어가기</Text>
            <Text style={styles.cardBody}>설치되어 있지 않다면 Play Store에서 바스타임을 받을 수 있습니다.</Text>
            <Pressable
              style={styles.button}
              onPress={() => {
                trackArchiveEvent('app_store_clicked', { platform: 'web', source: 'app_handoff_fallback' });
                void Linking.openURL(PLAY_STORE_URL);
              }}
            >
              <Text style={styles.buttonText}>Play Store에서 보기</Text>
            </Pressable>
          </View>
        </View>
      </ArchivePageContainer>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: archiveColors.surface,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    borderRadius: archiveRadius.lg,
    padding: 18,
    gap: 12,
  },
  cardTitle: {
    color: archiveColors.ink,
    fontSize: 20,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  cardBody: {
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
});
