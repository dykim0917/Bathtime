import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Href, router } from 'expo-router';
import { ArchivePageContainer } from '@/src/components/web/ArchivePageContainer';
import { SeoMetadata } from '@/src/components/web/SeoMetadata';
import { WebShell, webStyles } from '@/src/components/web/WebShell';
import { SUBMISSION_TYPE_LABELS } from '@/src/archive/labels';
import { Submission } from '@/src/archive/types';
import { trackArchiveEvent } from '@/src/analytics/events';
import { useAuth } from '@/src/auth/AuthProvider';
import { setPendingAuthAction } from '@/src/auth/pendingActions';
import { saveSubmission } from '@/src/storage/submissions';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';
import { copy } from '@/src/content/copy';

const TYPES = Object.keys(SUBMISSION_TYPE_LABELS) as Submission['type'][];

export default function SubmitPage() {
  const [type, setType] = useState<Submission['type']>('sauna_spa');
  const [linkOrImage, setLinkOrImage] = useState('');
  const [comment, setComment] = useState('');
  const [nickname, setNickname] = useState('');
  const [canPublish, setCanPublish] = useState(true);
  const [complete, setComplete] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    trackArchiveEvent('submit_started', { submissionType: type, platform: 'web' });
    const draft = {
      type,
      linkOrImage: linkOrImage.trim() || undefined,
      comment: comment.trim(),
      nickname: nickname.trim() || undefined,
      canPublish,
    };

    if (!isAuthenticated) {
      setPendingAuthAction({ type: 'submit_draft', draft, returnTo: '/submit' });
      trackArchiveEvent('submit_login_required', { submissionType: type, platform: 'web' });
      trackArchiveEvent('auth_prompt_shown', { submissionType: type, pendingAction: 'submit_draft', platform: 'web' });
      router.push('/auth/login?source=submit&next=/submit' as Href);
      return;
    }

    await saveSubmission(draft);
    setComplete(true);
    setLinkOrImage('');
    setComment('');
    setNickname('');
    trackArchiveEvent('submit_completed', { submissionType: type, platform: 'web' });
  };

  return (
    <WebShell>
      <SeoMetadata title={`${copy.archive.nav.submit} - 바스타임`} description="좋은 장소, 세팅, 아이템의 단서를 남겨주세요." />
      <ArchivePageContainer variant="narrow">
      <View style={webStyles.pageStack}>
        <View style={webStyles.header}>
          <Text style={webStyles.eyebrow}>{copy.archive.nav.submit}</Text>
          <Text style={webStyles.title}>좋은 바스타임 단서를 남겨주세요.</Text>
          <Text style={webStyles.lede}>제보는 바로 공개되지 않습니다. 운영자가 확인한 뒤 바스타임식 콘텐츠로 정리합니다.</Text>
        </View>

        {complete ? (
          <View style={styles.completeBox}>
            <Text style={styles.completeTitle}>제보가 저장되었습니다.</Text>
            <Text style={styles.completeText}>좋은 기록으로 정리할 수 있는지 확인해볼게요.</Text>
            <Pressable style={styles.secondaryButton} onPress={() => setComplete(false)}>
              <Text style={styles.secondaryButtonText}>다른 제보 남기기</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.form}>
          <Text style={styles.label}>제보 유형</Text>
          <View style={styles.chipGroup}>
            {TYPES.map((item) => (
              <Pressable key={item} style={[styles.chip, type === item && styles.chipActive]} onPress={() => setType(item)}>
                <Text style={[styles.chipText, type === item && styles.chipTextActive]}>{SUBMISSION_TYPE_LABELS[item]}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>사진 또는 링크</Text>
          <TextInput value={linkOrImage} onChangeText={setLinkOrImage} placeholder="https://..." placeholderTextColor={archiveColors.muted} style={styles.input} />

          <Text style={styles.label}>한 줄 코멘트</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="어떤 점이 좋았는지, 확인하면 좋을 점을 적어주세요."
            placeholderTextColor={archiveColors.muted}
            multiline
            style={[styles.input, styles.textArea]}
          />

          <Text style={styles.label}>닉네임</Text>
          <TextInput value={nickname} onChangeText={setNickname} placeholder="선택 입력" placeholderTextColor={archiveColors.muted} style={styles.input} />

          <Pressable style={styles.checkRow} onPress={() => setCanPublish((current) => !current)}>
            <View style={[styles.checkbox, canPublish && styles.checkboxActive]} />
            <Text style={styles.checkText}>운영자가 확인 후 공개 콘텐츠에 참고해도 괜찮아요.</Text>
          </Pressable>

          <Pressable style={[styles.primaryButton, !comment.trim() && styles.disabled]} onPress={handleSubmit} disabled={!comment.trim()}>
            <Text style={styles.primaryButtonText}>제보 제출</Text>
          </Pressable>
        </View>
      </View>
      </ArchivePageContainer>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: archiveColors.surface,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    borderRadius: archiveRadius.xl,
    padding: 16,
    gap: 12,
  },
  label: {
    color: archiveColors.ink,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: archiveColors.primary,
  },
  chipText: {
    color: archiveColors.body,
    fontSize: 12,
    fontWeight: '900',
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
    minHeight: 110,
    textAlignVertical: 'top',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
  },
  checkboxActive: {
    backgroundColor: archiveColors.primary,
  },
  checkText: {
    flex: 1,
    color: archiveColors.body,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: luxuryFonts.sans,
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
    opacity: 0.45,
  },
  completeBox: {
    backgroundColor: archiveColors.surface,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    borderRadius: archiveRadius.lg,
    padding: 16,
    gap: 8,
  },
  completeTitle: {
    color: archiveColors.primary,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: luxuryFonts.display,
  },
  completeText: {
    color: archiveColors.body,
    fontSize: 14,
    fontFamily: luxuryFonts.sans,
  },
  secondaryButton: {
    minHeight: 42,
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
