import React, { useState } from 'react';
import { Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeScreen } from '@/src/components/native/NativeScreen';
import { SUBMISSION_TYPE_LABELS } from '@/src/archive/labels';
import { Submission } from '@/src/archive/types';
import { trackArchiveEvent } from '@/src/analytics/events';
import { useAuth } from '@/src/auth/AuthProvider';
import { setPendingAuthAction } from '@/src/auth/pendingActions';
import { saveSubmission } from '@/src/storage/submissions';
import { luxuryFonts } from '@/src/theme/luxury';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';

const TYPES = Object.keys(SUBMISSION_TYPE_LABELS) as Submission['type'][];

export default function NativeSubmitScreen() {
  const [type, setType] = useState<Submission['type']>('sauna_spa');
  const [linkOrImage, setLinkOrImage] = useState('');
  const [comment, setComment] = useState('');
  const [nickname, setNickname] = useState('');
  const [complete, setComplete] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    const draft = {
      type,
      linkOrImage: linkOrImage.trim() || undefined,
      comment: comment.trim(),
      nickname: nickname.trim() || undefined,
      canPublish: true,
    };

    trackArchiveEvent('submit_started', { submissionType: type, platform: 'native' });
    if (!isAuthenticated) {
      await setPendingAuthAction({ type: 'submit_draft', draft, returnTo: '/(tabs)/submit' });
      trackArchiveEvent('submit_login_required', { submissionType: type, platform: 'native' });
      router.push('/auth/login?source=submit&next=/(tabs)/submit' as Href);
      return;
    }

    await saveSubmission(draft);
    setComplete(true);
    setLinkOrImage('');
    setComment('');
    setNickname('');
    trackArchiveEvent('submit_completed', { submissionType: type, platform: 'native' });
  };

  return (
    <NativeScreen eyebrow="SUBMIT" title="좋은 바스타임 단서 제보하기" subtitle="장소, 세팅, 아이템, 주제를 남겨주시면 운영자가 확인한 뒤 콘텐츠로 정리합니다.">
      {complete ? (
        <View style={styles.completeBox}>
          <Text style={styles.completeTitle}>제보가 저장되었습니다.</Text>
          <Text style={styles.helpText}>좋은 기록으로 정리할 수 있는지 확인해볼게요.</Text>
        </View>
      ) : null}
      <View style={styles.form}>
        <Text style={styles.label}>제보 유형</Text>
        <View style={styles.chipRow}>
          {TYPES.map((item) => {
            const selected = type === item;
            return (
              <Pressable key={item} style={[styles.chip, selected && styles.chipActive]} onPress={() => setType(item)}>
                <Text style={[styles.chipText, selected && styles.chipTextActive]}>{SUBMISSION_TYPE_LABELS[item]}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.label}>사진 또는 링크</Text>
        <TextInput value={linkOrImage} onChangeText={setLinkOrImage} placeholder="https://..." placeholderTextColor={archiveColors.muted} style={styles.input} />
        <Text style={styles.label}>한 줄 코멘트</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="어떤 점이 좋았는지 적어주세요."
          placeholderTextColor={archiveColors.muted}
          multiline
          style={[styles.input, styles.textArea]}
        />
        <Text style={styles.label}>닉네임</Text>
        <TextInput value={nickname} onChangeText={setNickname} placeholder="선택 입력" placeholderTextColor={archiveColors.muted} style={styles.input} />
        <Pressable style={[styles.primaryButton, !comment.trim() && styles.disabled]} onPress={handleSubmit} disabled={!comment.trim()}>
          <Text style={styles.primaryButtonText}>제보 제출</Text>
        </Pressable>
      </View>
    </NativeScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    borderRadius: archiveRadius.lg,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    padding: 16,
    gap: 12,
  },
  label: {
    color: archiveColors.ink,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surfaceSoft,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: archiveColors.primary,
    borderColor: archiveColors.primary,
  },
  chipText: {
    color: archiveColors.body,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
  chipTextActive: {
    color: archiveColors.onPrimary,
  },
  input: {
    minHeight: 46,
    borderRadius: archiveRadius.md,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surfaceSoft,
    color: archiveColors.ink,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: luxuryFonts.sans,
  },
  textArea: {
    minHeight: 104,
    textAlignVertical: 'top',
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: archiveRadius.md,
    backgroundColor: archiveColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: archiveColors.onPrimary,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  disabled: {
    opacity: 0.5,
  },
  completeBox: {
    borderRadius: archiveRadius.lg,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    padding: 16,
    gap: 6,
  },
  completeTitle: {
    color: archiveColors.primary,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  helpText: {
    color: archiveColors.body,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
});
