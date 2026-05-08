import React from 'react';
import { Href, router, usePathname } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';
import { copy } from '@/src/content/copy';
import { brand } from '@/src/content/brand';

type NavItem = {
  href: Href;
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
};

const NAV_ITEMS: NavItem[] = [
  { href: '/' as Href, label: copy.archive.nav.home, icon: 'home' },
  { href: '/explore' as unknown as Href, label: copy.archive.nav.explore, icon: 'search' },
  { href: '/routines' as unknown as Href, label: copy.archive.nav.routines, icon: 'play-circle' },
  { href: '/submit' as unknown as Href, label: copy.archive.nav.submit, icon: 'plus-square-o' },
  { href: '/saved' as unknown as Href, label: copy.archive.nav.saved, icon: 'bookmark-o' },
];

function getHrefPath(href: Href): string {
  return typeof href === 'string' ? href : href.pathname;
}

function isActive(pathname: string, href: Href): boolean {
  const hrefPath = getHrefPath(href);
  if (hrefPath === '/') return pathname === '/';
  return pathname.startsWith(hrefPath);
}

function NavLink({ item, active, compact = false }: { item: NavItem; active: boolean; compact?: boolean }) {
  return (
    <Pressable style={[compact ? styles.bottomTabItem : styles.navItem, active && styles.navItemActive]} onPress={() => router.push(item.href)}>
      <FontAwesome name={item.icon} size={compact ? 17 : 18} color={active ? archiveColors.primaryActive : archiveColors.body} />
      <Text style={[compact ? styles.bottomTabLabel : styles.navLabel, active && styles.navLabelActive]} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <View style={styles.sidebar}>
      <View style={styles.brandBlock}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.sidebarNav}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.label} item={item} active={isActive(pathname, item.href)} />
        ))}
      </View>
      <View style={styles.sidebarFooter}>
        <Text style={styles.sidebarFooterText}>개인정보처리방침</Text>
        <Text style={styles.sidebarFooterText}>이용약관</Text>
      </View>
    </View>
  );
}

function DesktopSearch() {
  const [query, setQuery] = React.useState('');

  const submitSearch = () => {
    const value = query.trim();
    router.push(value ? (`/explore?query=${encodeURIComponent(value)}` as Href) : ('/explore' as Href));
  };

  return (
    <View style={styles.topSearchWrap}>
      <View style={styles.topSearch}>
        <FontAwesome name="search" size={15} color={archiveColors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={submitSearch}
          placeholder="의식, 재료 또는 장소를 입력해주세요..."
          placeholderTextColor={archiveColors.muted}
          style={styles.topSearchInput}
          returnKeyType="search"
        />
      </View>
    </View>
  );
}

function BottomTab({ pathname, bottomInset }: { pathname: string; bottomInset: number }) {
  return (
    <View style={[styles.bottomTab, { paddingBottom: Math.max(bottomInset, 8) }]}>
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.label} item={item} active={isActive(pathname, item.href)} compact />
      ))}
    </View>
  );
}

export function WebShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <View style={styles.root}>
      {isDesktop ? <Sidebar pathname={pathname} /> : null}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={[
          styles.main,
          {
            paddingTop: isDesktop ? 12 : insets.top + 18,
            paddingBottom: isDesktop ? 48 : insets.bottom + 98,
          },
        ]}
      >
        {!isDesktop ? (
          <View style={styles.mobileHeader}>
            <View>
              <Text style={styles.eyebrow}>{copy.archive.meta.brandEyebrow}</Text>
              <Text style={styles.mobileBrand}>{brand.displayName}</Text>
            </View>
          </View>
        ) : null}
        {isDesktop ? <DesktopSearch /> : null}
        {children}
      </ScrollView>
      {!isDesktop ? <BottomTab pathname={pathname} bottomInset={insets.bottom} /> : null}
    </View>
  );
}

export const webStyles = StyleSheet.create({
  pageStack: {
    gap: 28,
  },
  header: {
    gap: 8,
    maxWidth: 760,
  },
  eyebrow: {
    color: archiveColors.primary,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  title: {
    color: archiveColors.ink,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    fontFamily: luxuryFonts.display,
  },
  lede: {
    color: archiveColors.body,
    fontSize: 17,
    lineHeight: 29,
    fontFamily: luxuryFonts.sans,
  },
  section: {
    gap: 18,
  },
  sectionTitle: {
    color: archiveColors.ink,
    fontSize: 20,
    fontWeight: '800',
    fontFamily: luxuryFonts.display,
  },
  muted: {
    color: archiveColors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: luxuryFonts.sans,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: archiveColors.canvas,
  },
  scroll: {
    flex: 1,
    backgroundColor: archiveColors.canvas,
  },
  main: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 0,
    gap: 42,
  },
  sidebar: {
    width: 192,
    minHeight: '100%',
    borderRightWidth: 1,
    borderRightColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 24,
    gap: 300,
  },
  brandBlock: {
    minHeight: 76,
    justifyContent: 'center',
  },
  logo: {
    width: 158,
    height: 40,
  },
  eyebrow: {
    color: archiveColors.primary,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  brandTitle: {
    color: archiveColors.ink,
    fontSize: 25,
    fontWeight: '900',
    marginTop: 6,
    fontFamily: luxuryFonts.display,
  },
  sidebarNav: {
    gap: 18,
  },
  navItem: {
    minHeight: 40,
    borderRadius: archiveRadius.lg,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navItemActive: {
    backgroundColor: archiveColors.primarySoft,
  },
  navLabel: {
    color: archiveColors.body,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: luxuryFonts.sans,
  },
  navLabelActive: {
    color: archiveColors.primaryActive,
  },
  sidebarNote: {
    marginTop: 'auto',
    backgroundColor: archiveColors.primarySoft,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    borderRadius: archiveRadius.md,
    padding: 12,
    gap: 6,
  },
  sidebarNoteTitle: {
    color: archiveColors.ink,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  sidebarNoteText: {
    color: archiveColors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: luxuryFonts.sans,
  },
  sidebarFooter: {
    marginTop: 'auto',
    gap: 8,
    paddingHorizontal: 2,
  },
  sidebarFooterText: {
    color: archiveColors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: luxuryFonts.sans,
  },
  topSearchWrap: {
    width: '100%',
    paddingHorizontal: 62,
  },
  topSearch: {
    width: 665,
    maxWidth: '100%',
    minHeight: 42,
    borderRadius: archiveRadius.full,
    borderWidth: 1,
    borderColor: archiveColors.borderStrong,
    backgroundColor: '#F2F6F4',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topSearchInput: {
    flex: 1,
    minHeight: 40,
    color: archiveColors.ink,
    fontSize: 13,
    fontFamily: luxuryFonts.sans,
  },
  mobileHeader: {
    minHeight: 48,
    justifyContent: 'center',
  },
  mobileBrand: {
    color: archiveColors.ink,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
    fontFamily: luxuryFonts.display,
  },
  bottomTab: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 76,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
  },
  bottomTabItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    borderRadius: archiveRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bottomTabLabel: {
    color: archiveColors.body,
    fontSize: 10,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
});
