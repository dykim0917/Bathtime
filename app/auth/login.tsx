import React, { useEffect } from 'react';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthPrompt } from '@/src/components/auth/AuthPrompt';
import { ArchivePageContainer } from '@/src/components/web/ArchivePageContainer';
import { SeoMetadata } from '@/src/components/web/SeoMetadata';
import { WebShell, webStyles } from '@/src/components/web/WebShell';
import { useAuth } from '@/src/auth/AuthProvider';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';

function normalizeParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default function LoginPage() {
  const params = useLocalSearchParams<{ next?: string | string[]; source?: string | string[] }>();
  const { isAuthenticated, isLoading } = useAuth();
  const nextPath = normalizeParam(params.next) || '/saved';
  const source = normalizeParam(params.source);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(nextPath as Href);
    }
  }, [isAuthenticated, isLoading, nextPath]);

  const content = (
    <View style={webStyles.pageStack}>
      <View style={webStyles.header}>
        <Text style={webStyles.eyebrow}>LOGIN</Text>
        <Text style={webStyles.title}>내 바스타임을 이어서 보기</Text>
        <Text style={webStyles.lede}>Google 계정으로 저장한 콘텐츠와 제보를 연결합니다.</Text>
      </View>
      <AuthPrompt source={source === 'submit' ? 'submit' : source === 'save' ? 'save' : 'saved'} nextPath={nextPath} />
      <Pressable style={styles.secondaryButton} onPress={() => router.replace('/explore' as Href)}>
        <Text style={styles.secondaryButtonText}>둘러보기로 돌아가기</Text>
      </Pressable>
    </View>
  );

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.nativeRoot}>
        {content}
      </View>
    );
  }

  return (
    <WebShell>
      <SeoMetadata title="로그인 - 바스타임" description="바스타임 저장과 제보를 위해 로그인합니다." />
      <ArchivePageContainer variant="narrow">
        {content}
      </ArchivePageContainer>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  nativeRoot: {
    flex: 1,
    backgroundColor: archiveColors.canvas,
    paddingHorizontal: 18,
    paddingTop: 88,
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: archiveRadius.md,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: archiveColors.ink,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
});
