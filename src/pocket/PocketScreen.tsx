import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Linking, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/auth/AuthProvider';
import { getArchiveSaves, recordArchiveEvent, removeArchiveSave, type ArchiveSave } from './api';
import { archiveCards, filterArchiveCards, type ArchiveCard } from './selectors';
import { archiveCacheKey, localArchiveLinks, removeLocalArchiveLink, saveArchiveLink, syncArchiveLinks, type LocalArchiveLink } from './storage';
import { normalizeArchiveLink } from './contracts';
import { pocketNative } from './native';

const statuses = { queued: '정리 대기', processing: '정리 중', ready: '정리 완료', unavailable: '링크 보관' };
const fonts = { regular: 'Pretendard-Regular', medium: 'Pretendard-Medium', bold: 'Pretendard-Bold' };

export function PocketScreen() {
  const { user, isLoading, isConfigured, loginWithProvider, logout } = useAuth();
  const owner = user?.id ?? '';
  const currentOwner = useRef(owner); currentOwner.current = owner;
  const insets = useSafeAreaInsets();
  const [saves, setSaves] = useState<ArchiveSave[]>([]);
  const [loadedOwner, setLoadedOwner] = useState(owner);
  const [local, setLocal] = useState<LocalArchiveLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | ArchiveCard['kind']>('all');
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    const captured = owner;
    setLoading(true);
    try {
      await syncArchiveLinks();
      const pending = await localArchiveLinks(captured);
      if (currentOwner.current !== captured) return;
      setLocal(pending);
      if (captured) {
        const items = await getArchiveSaves();
        if (currentOwner.current !== captured) return;
        setSaves(items); setLoadedOwner(captured); setMessage('');
        await AsyncStorage.setItem(archiveCacheKey(captured), JSON.stringify(items));
      }
    } catch { if (currentOwner.current === captured) setMessage('연결을 확인해 주세요. 폰에 저장한 내용은 그대로 있어요.'); }
    finally { if (currentOwner.current === captured) setLoading(false); }
  }, [owner]);

  useEffect(() => {
    setSaves([]); setLocal([]); setSelectedId(null); setMessage('');
    let active = true;
    void (async () => {
      if (owner) {
        const cached = await AsyncStorage.getItem(archiveCacheKey(owner));
        if (active && cached) { try { setSaves(JSON.parse(cached)); setLoadedOwner(owner); } catch { /* Fetch a fresh copy below. */ } }
        void recordArchiveEvent('archive_opened').catch(() => undefined);
      }
      if (active) await refresh();
    })();
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') void refresh(); });
    let changed: ReturnType<typeof setTimeout> | undefined;
    const outbox = pocketNative?.addListener('onOutboxChange', () => {
      if (changed) clearTimeout(changed);
      changed = setTimeout(() => { if (active && AppState.currentState === 'active') void refresh(); }, 150);
    });
    return () => { active = false; subscription.remove(); outbox?.remove(); if (changed) clearTimeout(changed); };
  }, [owner, refresh]);

  const cards = useMemo(() => archiveCards(loadedOwner === owner ? saves.filter((save) => !local.some((row) =>
    row.ownerId === owner && row.state === 'deleting' && matchesSource(row, save))) : []), [saves, loadedOwner, owner, local]);
  const filtered = filterArchiveCards(cards, kind, query);
  const selected = cards.find((card) => card.id === selectedId);
  const pending = local.filter((row) => (!row.ownerId || row.ownerId === owner) && row.state !== 'deleting' && !saves.some((save) => save.source.id === row.sourceId));

  async function add() {
    setSaving(true);
    try {
      await saveArchiveLink(input, owner);
      setInput(''); setAdding(false); setMessage('폰에 저장했어요.');
      await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : '링크를 다시 확인해 주세요.'); }
    finally { setSaving(false); }
  }

  async function open(url: string, type: 'original_opened' | 'action_opened', sourceId?: string) {
    if (!/^https?:\/\//i.test(url)) return;
    try {
      await Linking.openURL(url);
      if (owner) void recordArchiveEvent(type, sourceId).catch(() => undefined);
    } catch { setMessage('페이지를 열지 못했어요. 잠시 후 다시 눌러 주세요.'); }
  }

  function remove(save: ArchiveSave) {
    Alert.alert('이 게시물을 보관함에서 삭제할까요?', '이 게시물로 저장한 장소·제품도 함께 빠져요.', [
      { text: '취소', style: 'cancel' }, { text: '삭제', style: 'destructive', onPress: () => {
        void (async () => {
          try {
            for (const row of local.filter((row) => row.ownerId === owner && matchesSource(row, save))) await removeLocalArchiveLink(row.id);
            await removeArchiveSave(save.id);
            void recordArchiveEvent('save_removed').catch(() => undefined);
            await refresh();
          } catch { setMessage('삭제하지 못했어요. 연결을 확인해 주세요.'); }
        })();
      } },
    ]);
  }

  return <View style={[styles.page, { paddingTop: insets.top }]}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refresh()} tintColor="#007F89" />}>
      <View style={styles.header}><View><Text style={styles.brand}>BATHTIME</Text><Text style={styles.heading}>내 보관함</Text></View>
        <Pressable style={styles.smallButton} accessibilityRole="button" onPress={() => setAdding(true)}><Text style={styles.buttonText}>＋ 링크 추가</Text></Pressable></View>
      <Text style={styles.body}>저장한 목욕 장소와 제품을 한곳에서 찾아보세요.</Text>
      <Text style={styles.meta}>저장한 링크는 운영자가 확인해 순서대로 정리해요.</Text>
      {!owner && !isLoading ? <View style={styles.notice}><Text style={styles.body}>로그인하면 링크를 정리하고 다른 기기에서도 볼 수 있어요.</Text>
        <Pressable accessibilityRole="button" style={styles.button} onPress={() => {
          if (!isConfigured) { setMessage('아직 서버에 연결하지 않았어요. 링크는 이 폰에 보관할 수 있어요.'); return; }
          void loginWithProvider('google').catch(() => setMessage('로그인을 다시 시도해 주세요.'));
        }}><Text style={styles.primaryText}>Google로 계속하기</Text></Pressable>
      </View> : null}
      {message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}
      <TextInput value={query} onChangeText={setQuery} placeholder="이름, 지역, 특징으로 검색" placeholderTextColor="#76838B" accessibilityLabel="보관함 검색" style={styles.search} />
      <View style={styles.filters}>{([['all', '전체'], ['place', '장소'], ['product', '제품'], ['link', '게시물']] as const).map(([value, label]) =>
        <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: kind === value }} onPress={() => setKind(value)} style={[styles.filter, kind === value && styles.filterActive]}>
          <Text style={[styles.filterText, kind === value && styles.activeText]}>{label}</Text>
        </Pressable>)}</View>
      {pending.length ? <View style={styles.notice}><Text style={styles.section}>폰에 보관한 링크 {pending.length}</Text>{pending.map((row) => <View key={row.id} style={styles.pendingRow}>
        <Pressable style={{ flex: 1 }} onPress={() => void open(row.url, 'original_opened')}><Text numberOfLines={1} style={styles.cardTitle}>{row.title || '저장한 링크'}</Text>
          <Text style={styles.meta}>{row.error || (owner ? '보관함에 보내는 중' : '로그인 후 정리를 시작해요')}</Text></Pressable>
        <Pressable accessibilityLabel="폰에 보관한 링크 삭제" style={styles.smallButton} onPress={() => void removeLocalArchiveLink(row.id).then(refresh)}><Text style={styles.meta}>삭제</Text></Pressable>
      </View>)}</View> : null}
      <View style={styles.grid}>{filtered.map((card) => <Pressable key={card.id} style={styles.card} accessibilityRole="button" onPress={() => {
        setSelectedId(card.id); void recordArchiveEvent('detail_opened', card.sources[0].source.id).catch(() => undefined);
      }}>
        <View style={[styles.cover, card.kind === 'product' && styles.productCover]}><Text style={styles.coverIcon}>{card.kind === 'place' ? '♨' : card.kind === 'product' ? '◌' : '↗'}</Text>
          <Text style={styles.coverLabel}>{card.kind === 'place' ? '목욕 장소' : card.kind === 'product' ? '목욕 제품' : statuses[card.sources[0].source.status]}</Text></View>
        <Text style={styles.meta} numberOfLines={1}>{card.location}</Text><Text style={styles.cardTitle} numberOfLines={2}>{card.name}</Text>
        <Text style={styles.meta} numberOfLines={2}>{card.tags.slice(0, 2).join(' · ') || card.summary || statuses[card.sources[0].source.status]}</Text>
      </Pressable>)}</View>
      {!filtered.length ? <View style={styles.empty}><Text style={styles.section}>{cards.length ? '찾는 내용이 없어요' : '다음에 가보고 싶은 곳을 담아보세요'}</Text>
        <Text style={styles.body}>{cards.length ? '다른 검색어나 분류로 찾아보세요.' : '릴스나 쇼츠에서 공유를 누르고\n바스타임에 담기를 선택해 주세요.'}</Text>
        <Pressable style={styles.smallButton} onPress={() => { if (cards.length) { setKind('all'); setQuery(''); } else setAdding(true); }}><Text style={styles.buttonText}>{cards.length ? '전체 보기' : '링크 붙여넣기'}</Text></Pressable>
      </View> : null}
      <View style={styles.footer}><Pressable style={styles.smallButton} onPress={() => router.push('/saved' as never)}><Text style={styles.meta}>이전 보관함</Text></Pressable>
        <Pressable style={styles.smallButton} onPress={() => router.push('/settings' as never)}><Text style={styles.meta}>설정 및 계정</Text></Pressable>
        <Pressable style={styles.smallButton} onPress={() => router.push('/legal/privacy' as never)}><Text style={styles.meta}>개인정보 처리방침</Text></Pressable>
        {owner ? <Pressable style={styles.smallButton} onPress={() => void logout().catch(() => setMessage('로그아웃을 다시 시도해 주세요.'))}><Text style={styles.meta}>로그아웃</Text></Pressable> : null}</View>
    </ScrollView>
    <Modal visible={adding} transparent animationType="slide" onRequestClose={() => setAdding(false)}><View style={styles.scrim}><View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
      <Text style={styles.section}>링크 추가</Text><Text style={styles.body}>목욕 장소, 제품, 게시물 주소를 넣어 주세요.</Text>
      <TextInput value={input} onChangeText={setInput} placeholder="https://" autoCapitalize="none" autoCorrect={false} accessibilityLabel="저장할 링크" style={styles.search} />
      <Pressable disabled={saving || !input.trim()} style={styles.button} onPress={() => void add()}>{saving ? <ActivityIndicator color="white" /> : <Text style={styles.primaryText}>저장하기</Text>}</Pressable>
      <Pressable style={styles.smallButton} onPress={() => setAdding(false)}><Text style={styles.buttonText}>닫기</Text></Pressable>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View></View></Modal>
    <Modal visible={Boolean(selected)} animationType="slide" onRequestClose={() => setSelectedId(null)}>{selected ? <View style={[styles.page, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.detailHeader}><Pressable style={styles.smallButton} accessibilityLabel="상세 닫기" onPress={() => setSelectedId(null)}><Text style={styles.buttonText}>← 보관함</Text></Pressable></View>
      <ScrollView contentContainerStyle={styles.content}><Text style={styles.meta}>{selected.location}</Text><Text style={styles.heading}>{selected.name}</Text><Text style={styles.body}>{selected.summary}</Text>
        <Text style={styles.section}>{selected.kind === 'product' ? '제품 정보' : '이용 정보'}</Text>
        {selected.facts.length ? selected.facts.map((fact, i) => <View key={i} style={styles.fact}><Text style={styles.cardTitle}>{fact.label}</Text><Text style={styles.body}>{fact.value}</Text>
          <Pressable accessibilityRole="link" style={styles.smallButton} onPress={() => void open(fact.sourceUrl, 'original_opened', selected.sources[0].source.id)}><Text style={styles.meta}>{fact.basis === 'official' ? '공식 안내' : '게시물'} · {fact.checkedAt} 확인 ↗</Text></Pressable></View>) : <Text style={styles.body}>확인한 내용이 생기면 여기에 정리해 둘게요.</Text>}
        <Text style={styles.section}>저장한 게시물 {selected.sources.length}</Text>{selected.sources.map(({ source, saveId }) => <View key={source.id} style={styles.notice}>
          <Text style={styles.cardTitle}>{source.title || '저장한 게시물'}</Text><Text style={styles.meta}>{source.creator || source.platform} · {statuses[source.status]}</Text>
          {source.reason ? <Text style={styles.body}>{source.reason}</Text> : null}
          <Pressable style={styles.smallButton} onPress={() => void open(source.url, 'original_opened', source.id)}><Text style={styles.buttonText}>게시물 보기 ↗</Text></Pressable>
          <Pressable style={styles.smallButton} onPress={() => remove({ id: saveId, source, created_at: '' })}><Text style={styles.meta}>보관함에서 삭제</Text></Pressable>
        </View>)}
        <Pressable style={styles.smallButton} onPress={() => void Linking.openURL(`mailto:getbathtime@gmail.com?subject=${encodeURIComponent('보관함 정보 수정 요청')}&body=${encodeURIComponent(`이름: ${selected.name}\n원문: ${selected.sources[0].source.url}\n수정할 내용: `)}`)}><Text style={styles.meta}>잘못된 정보 알려주기</Text></Pressable>
      </ScrollView>
      {selected.kind === 'place' || selected.actionUrl ? <View style={styles.detailFooter}><Pressable accessibilityRole="link" style={styles.button} onPress={() => void open(selected.kind === 'place' ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selected.name} ${selected.location}`)}` : selected.actionUrl!, 'action_opened', selected.sources[0].source.id)}><Text style={styles.primaryText}>{selected.kind === 'place' ? '지도에서 찾기' : '제품 페이지 보기'} ↗</Text></Pressable></View> : null}
    </View> : null}</Modal>
  </View>;
}

function matchesSource(row: LocalArchiveLink, save: ArchiveSave): boolean {
  if (row.sourceId === save.source.id) return true;
  try { return normalizeArchiveLink(row.url).canonicalKey === save.source.canonical_key; }
  catch { return false; }
}

const styles = StyleSheet.create({
  page: { flex: 1, width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: '#FFFFFF' },
  content: { padding: 20, gap: 18, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: '#007F89', fontSize: 11, fontFamily: fonts.bold, letterSpacing: 1.5, marginBottom: 8 },
  heading: { color: '#20282D', fontSize: 28, lineHeight: 37, fontFamily: fonts.bold },
  body: { color: '#63717A', fontSize: 14, lineHeight: 22, fontFamily: fonts.regular },
  section: { color: '#20282D', fontSize: 18, fontFamily: fonts.bold },
  notice: { backgroundColor: '#F5F8FA', borderRadius: 16, padding: 16, gap: 12 },
  message: { color: '#007F89', fontSize: 13, lineHeight: 20, fontFamily: fonts.medium },
  search: { backgroundColor: '#F5F8FA', borderRadius: 12, minHeight: 48, paddingHorizontal: 16, color: '#20282D', fontFamily: fonts.regular, fontSize: 14 },
  filters: { flexDirection: 'row', gap: 8 }, filter: { minHeight: 44, paddingHorizontal: 17, borderRadius: 22, justifyContent: 'center', backgroundColor: '#F5F8FA' },
  filterActive: { backgroundColor: '#E9FAFA' }, filterText: { color: '#63717A', fontFamily: fonts.medium, fontSize: 14 }, activeText: { color: '#007F89' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 24 }, card: { width: '47.5%', gap: 7 },
  cover: { aspectRatio: 1.15, backgroundColor: '#E9FAFA', borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 3 },
  productCover: { backgroundColor: '#F0F3FF' }, coverIcon: { fontSize: 44, color: '#007F89' }, coverLabel: { fontFamily: fonts.medium, color: '#007F89', fontSize: 12 },
  cardTitle: { fontFamily: fonts.bold, color: '#20282D', fontSize: 15, lineHeight: 22 }, meta: { fontFamily: fonts.regular, color: '#63717A', fontSize: 12, lineHeight: 18 },
  button: { backgroundColor: '#007F89', borderRadius: 14, minHeight: 52, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 },
  primaryText: { color: '#FFFFFF', fontFamily: fonts.bold, fontSize: 15 }, smallButton: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  buttonText: { color: '#007F89', fontFamily: fonts.bold, fontSize: 14 }, empty: { paddingVertical: 34, alignItems: 'center', gap: 14 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, borderTopWidth: 1, borderColor: '#E8EEF1', paddingTop: 12 },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, scrim: { flex: 1, backgroundColor: '#20282D66', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { width: '100%', maxWidth: 440, padding: 24, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, gap: 16 },
  detailHeader: { paddingHorizontal: 14, alignItems: 'flex-start', borderBottomWidth: 1, borderColor: '#E8EEF1' },
  detailFooter: { padding: 16, borderTopWidth: 1, borderColor: '#E8EEF1' }, fact: { paddingVertical: 12, gap: 6, borderBottomWidth: 1, borderColor: '#E8EEF1' },
});
