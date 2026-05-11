import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArchivePageContainer } from '@/src/components/web/ArchivePageContainer';
import { SeoMetadata } from '@/src/components/web/SeoMetadata';
import { WebShell, webStyles } from '@/src/components/web/WebShell';
import { trackArchiveEvent } from '@/src/analytics/events';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';

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
              앱에서는 웹에서 발견한 콘텐츠를 보관하고, 연결된 의식을 타이머로 따라 할 수 있어요. 스토어 링크는 앱 출시 시 연결됩니다.
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>지금은 앱 열기를 준비 중입니다.</Text>
            <Text style={styles.cardBody}>설치 링크가 준비되면 이 페이지에서 바로 안내할게요.</Text>
            <Pressable
              style={styles.button}
              onPress={() => trackArchiveEvent('app_store_clicked', { platform: 'web', source: 'placeholder' })}
            >
              <Text style={styles.buttonText}>출시 안내 확인</Text>
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
