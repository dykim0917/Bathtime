import React, { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const creators = [
  { handle: 'mondaysauna', name: '먼데이 사우나', initials: 'ms', topic: '사우나 · 목욕', description: '다음에 가보고 싶은 사우나를 찾아보세요.', color: '#E5F8F5' },
  { handle: 'godoghan_sauner', name: '고독한 사우너', initials: '♨', topic: '사우나 탐방', description: '사우나 방문 이야기를 만나보세요.', color: '#EDF3FF' },
];

export function CreatorDiscovery() {
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  async function openProfile(handle: string) {
    setError('');
    try { await Linking.openURL(`https://www.instagram.com/${handle}/`); }
    catch { setError('계정을 열지 못했어요. 잠시 후 다시 눌러 주세요.'); }
  }

  return <>
    <Pressable accessibilityRole="button" onPress={() => { setError(''); setVisible(true); }} style={styles.entry}>
      <View style={styles.entryIcon}><Text style={styles.symbol}>♨</Text></View>
      <View style={styles.entryCopy}><Text style={styles.title}>목욕 콘텐츠 둘러보기</Text><Text style={styles.body}>무엇을 담을지 고민이라면 여기서 찾아보세요.</Text></View>
      <Text style={styles.arrow}>→</Text>
    </Pressable>
    <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
      <View style={[styles.page, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.bar}><Text style={styles.brand}>BATHTIME</Text><Pressable accessibilityRole="button" accessibilityLabel="둘러보기 닫기" style={styles.close} onPress={() => setVisible(false)}><Text style={styles.link}>닫기</Text></Pressable></View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}><Text style={styles.eyebrow}>목욕 콘텐츠 둘러보기</Text><Text style={styles.heading}>다음 목욕이{ '\n' }기다려지는 발견</Text><Text style={styles.body}>목욕 이야기를 전하는 계정을 만나보세요.{ '\n' }마음에 드는 게시물은 바스타임에 담아두세요.</Text><Text accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.heroSymbol}>♨</Text></View>
          <View style={styles.sectionHead}><Text style={styles.section}>목욕 이야기를 전하는 사람들</Text><Text style={styles.meta}>{creators.length}곳</Text></View>
          <View style={styles.grid}>{creators.map(creator => <View key={creator.handle} style={[styles.card, { width: width >= 700 ? '48.5%' : '100%' }]}>
            <View style={styles.identity}><View style={[styles.avatar, { backgroundColor: creator.color }]}><Text style={styles.initials}>{creator.initials}</Text></View><View style={styles.entryCopy}><Text style={styles.title}>{creator.name}</Text><Text style={styles.meta}>@{creator.handle}</Text></View></View>
            <Text style={styles.tag}>{creator.topic}</Text><Text style={styles.body}>{creator.description}</Text>
            <Pressable accessibilityRole="link" accessibilityLabel={`${creator.name} Instagram 계정 보기`} style={styles.profileButton} onPress={() => void openProfile(creator.handle)}><Text style={styles.link}>Instagram에서 보기 ↗</Text></Pressable>
          </View>)}</View>
          {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
          <View style={styles.guide}><Text style={styles.title}>마음에 드는 콘텐츠를 찾았다면</Text><Text style={styles.body}>게시물에서 공유를 누르고 바스타임을 선택해 주세요. 폴더를 고르지 않아도 저장할 수 있어요.</Text><Text style={styles.steps}>공유 → 바스타임 → 내 보관함</Text></View>
          <Text style={styles.meta}>계정은 Instagram에서 열려요. 둘러본 콘텐츠가 보관함에 자동으로 저장되지는 않아요.</Text>
        </ScrollView>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FFFFFF', width: '100%', maxWidth: 1040, alignSelf: 'center' },
  content: { padding: 20, gap: 24, paddingBottom: 40 },
  bar: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#E8EEF1' },
  brand: { fontFamily: 'Pretendard-Bold', color: '#007F89', fontSize: 12, letterSpacing: 1.5 },
  close: { minWidth: 44, minHeight: 52, justifyContent: 'center', alignItems: 'center' },
  entry: { padding: 18, gap: 12, borderRadius: 20, backgroundColor: '#E9FAFA', flexDirection: 'row', alignItems: 'center' },
  entryIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  entryCopy: { flex: 1, gap: 5 }, symbol: { fontSize: 26, color: '#007F89' }, arrow: { fontSize: 22, color: '#007F89' },
  title: { fontFamily: 'Pretendard-Bold', fontSize: 16, lineHeight: 24, color: '#20282D' },
  body: { fontFamily: 'Pretendard-Regular', fontSize: 14, lineHeight: 23, color: '#63717A' },
  meta: { fontFamily: 'Pretendard-Regular', fontSize: 12, lineHeight: 20, color: '#63717A' },
  hero: { padding: 24, gap: 16, backgroundColor: '#F0FBFA', borderRadius: 24, overflow: 'hidden' },
  eyebrow: { fontFamily: 'Pretendard-Medium', fontSize: 12, color: '#007F89' },
  heading: { fontFamily: 'Pretendard-Bold', fontSize: 30, lineHeight: 40, color: '#20282D' },
  heroSymbol: { fontSize: 62, color: '#63C9C6', textAlign: 'right', lineHeight: 72 },
  sectionHead: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', alignItems: 'center' },
  section: { fontFamily: 'Pretendard-Bold', fontSize: 18, lineHeight: 26, color: '#20282D' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' },
  card: { padding: 20, borderWidth: 1, borderColor: '#E8EEF1', borderRadius: 20, gap: 14 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: 'Pretendard-Bold', fontSize: 27, color: '#007F89' },
  tag: { alignSelf: 'flex-start', backgroundColor: '#F5F8FA', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6, fontSize: 12, color: '#63717A', fontFamily: 'Pretendard-Medium' },
  profileButton: { minHeight: 48, borderRadius: 12, backgroundColor: '#E9FAFA', justifyContent: 'center', alignItems: 'center', padding: 10 },
  link: { fontFamily: 'Pretendard-Bold', fontSize: 14, color: '#007F89' },
  guide: { padding: 20, gap: 10, borderRadius: 16, backgroundColor: '#F5F8FA' },
  steps: { fontFamily: 'Pretendard-Medium', fontSize: 13, color: '#007F89', lineHeight: 22 },
  error: { fontFamily: 'Pretendard-Regular', color: '#B74343', fontSize: 14, lineHeight: 22 },
});
