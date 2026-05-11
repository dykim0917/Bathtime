import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/src/auth/AuthProvider';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';

type AuthPromptSource = 'save' | 'submit' | 'saved';

const PROMPT_COPY: Record<AuthPromptSource, { title: string; body: string }> = {
  save: {
    title: '내 바스타임으로 저장하려면 로그인이 필요해요.',
    body: '저장한 콘텐츠는 나중에 다시 꺼내볼 수 있습니다.',
  },
  submit: {
    title: '제보를 남기려면 로그인이 필요해요.',
    body: '제보 채택 여부를 확인하고, 닉네임 표시 여부를 선택할 수 있습니다.',
  },
  saved: {
    title: '저장한 바스타임을 보려면 로그인이 필요해요.',
    body: '콘텐츠, 장소, 의식을 내 보관함에 모아둘 수 있습니다.',
  },
};

export function AuthPrompt({
  source,
  nextPath,
  compact = false,
}: {
  source: AuthPromptSource;
  nextPath?: string;
  compact?: boolean;
}) {
  const { isConfigured, loginWithProvider } = useAuth();
  const copy = PROMPT_COPY[source];

  const handleGoogleLogin = () => {
    void loginWithProvider('google', nextPath);
  };

  return (
    <View style={[styles.box, compact && styles.compact]}>
      <View style={styles.textStack}>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.body}>{copy.body}</Text>
      </View>
      {!isConfigured ? (
        <Text style={styles.configWarning}>Supabase 로그인 환경변수가 필요합니다.</Text>
      ) : null}
      <View style={styles.buttonStack}>
        <Pressable style={[styles.button, styles.googleButton, !isConfigured && styles.disabled]} disabled={!isConfigured} onPress={handleGoogleLogin}>
          <View style={styles.googleIcon}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
          <Text style={styles.googleButtonText}>Google로 계속하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: archiveRadius.lg,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    padding: 18,
    gap: 16,
  },
  compact: {
    padding: 14,
  },
  textStack: {
    gap: 7,
  },
  title: {
    color: archiveColors.ink,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '800',
    fontFamily: luxuryFonts.display,
  },
  body: {
    color: archiveColors.body,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: luxuryFonts.sans,
  },
  configWarning: {
    color: archiveColors.primary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  buttonStack: {
    gap: 9,
  },
  button: {
    minHeight: 46,
    borderRadius: archiveRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: archiveColors.surface,
    borderColor: archiveColors.hairline,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: '#4285F4',
    fontSize: 13,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  googleButtonText: {
    color: archiveColors.ink,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  disabled: {
    opacity: 0.45,
  },
});
