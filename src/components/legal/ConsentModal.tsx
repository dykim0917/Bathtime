import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AnimatedModalShell } from '@/src/components/AnimatedModalShell';
import {
  TYPE_BODY,
  TYPE_CAPTION,
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_BORDER,
  V2_SURFACE,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
} from '@/src/data/colors';
import { luxuryFonts } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

export function ConsentModal({
  visible,
  isMinor = false,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  isMinor?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [healthAccepted, setHealthAccepted] = useState(false);
  const [guardianAccepted, setGuardianAccepted] = useState(false);

  const ready = useMemo(() => {
    if (isMinor) return termsAccepted && privacyAccepted && healthAccepted && guardianAccepted;
    return termsAccepted && privacyAccepted && healthAccepted;
  }, [guardianAccepted, healthAccepted, isMinor, privacyAccepted, termsAccepted]);

  const Row = ({
    checked,
    onPress,
    title,
    body,
  }: {
    checked: boolean;
    onPress: () => void;
    title: string;
    body: string;
  }) => (
    <Pressable style={[styles.row, checked && styles.rowActive]} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxActive]}>
        {checked ? <Text style={styles.checkboxMark}>✓</Text> : null}
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowBody}>{body}</Text>
      </View>
    </Pressable>
  );

  return (
    <AnimatedModalShell
      visible={visible}
      onClose={onClose}
      align="center"
      containerStyle={styles.modalContainer}
      backdropStyle={styles.backdrop}
    >
      {(requestClose) => (
        <View style={[ui.glassCardV2, styles.card]}>
          <Text style={styles.title}>회원가입 동의</Text>
          <Text style={styles.subtitle}>
            바스타임은 맞춤 입욕 루틴을 제공하기 위해 건강 상태를 포함한 정보를 확인합니다.
          </Text>

          <Row
            checked={termsAccepted}
            onPress={() => setTermsAccepted((prev) => !prev)}
            title="[필수] 이용약관 동의"
            body="서비스 이용 조건과 책임 제한 내용을 확인했습니다."
          />
          <Row
            checked={privacyAccepted}
            onPress={() => setPrivacyAccepted((prev) => !prev)}
            title="[필수] 개인정보 처리방침 동의"
            body="수집 항목, 이용 목적, 보관 기간, 권리 행사 방법을 확인했습니다."
          />
          <Row
            checked={healthAccepted}
            onPress={() => setHealthAccepted((prev) => !prev)}
            title="[필수] 건강정보 처리 동의"
            body="고혈압/심장병 여부, 임신 여부, 당뇨 여부, 민감성 피부 여부를 민감정보로 처리하는 데 동의합니다."
          />
          {isMinor ? (
            <Row
              checked={guardianAccepted}
              onPress={() => setGuardianAccepted((prev) => !prev)}
              title="[필수] 법정대리인 동의 확인"
              body="14세 미만 이용자로서 법정대리인의 동의를 받았음을 확인합니다."
            />
          ) : null}

          <Text style={styles.caption}>마케팅 수신 동의는 현재 받지 않습니다.</Text>

          <View style={styles.actions}>
            <Pressable style={[ui.secondaryButtonV2, styles.action]} onPress={requestClose}>
              <Text style={ui.secondaryButtonTextV2}>닫기</Text>
            </Pressable>
            <Pressable
              style={[ui.primaryButtonV2, styles.action, !ready && styles.actionDisabled]}
              disabled={!ready}
              onPress={onConfirm}
            >
              <Text style={ui.primaryButtonTextV2}>동의하고 계속</Text>
            </Pressable>
          </View>
        </View>
      )}
    </AnimatedModalShell>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  modalContainer: {
    width: '100%',
    paddingHorizontal: 18,
  },
  card: {
    backgroundColor: V2_SURFACE,
    borderColor: V2_BORDER,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
  },
  title: {
    color: V2_TEXT_PRIMARY,
    fontSize: 20,
    fontFamily: luxuryFonts.display,
  },
  subtitle: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_BODY,
    lineHeight: 20,
    fontFamily: luxuryFonts.sans,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: V2_BORDER,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowActive: {
    borderColor: V2_ACCENT,
    backgroundColor: V2_ACCENT_SOFT,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: V2_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: V2_ACCENT,
    borderColor: V2_ACCENT,
  },
  checkboxMark: {
    color: '#1A2430',
    fontSize: 12,
    fontWeight: '700',
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    color: V2_TEXT_PRIMARY,
    fontSize: TYPE_BODY,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  rowBody: {
    color: V2_TEXT_SECONDARY,
    fontSize: TYPE_CAPTION,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  caption: {
    color: V2_TEXT_MUTED,
    fontSize: TYPE_CAPTION,
    fontFamily: luxuryFonts.sans,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  action: {
    flex: 1,
  },
  actionDisabled: {
    opacity: 0.45,
  },
});
