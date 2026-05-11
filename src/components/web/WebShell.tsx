import React from 'react';
import { Href, router, usePathname } from 'expo-router';
import { Animated, Easing, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import {
  BookmarkSimple,
  Compass,
  House,
  List,
  MagnifyingGlass,
  PlayCircle,
  PlusSquare,
  User,
  type PhosphorIcon,
} from '@/src/components/web/phosphorIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';
import { copy } from '@/src/content/copy';
import { BrandMark } from '@/src/components/BrandMark';
import { useAuth } from '@/src/auth/AuthProvider';

type NavItem = {
  href: Href;
  label: string;
  icon: PhosphorIcon;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/' as Href, label: copy.archive.nav.home, icon: House },
  { href: '/explore' as unknown as Href, label: copy.archive.nav.explore, icon: Compass },
  { href: '/routines' as unknown as Href, label: copy.archive.nav.routines, icon: PlayCircle },
  { href: '/submit' as unknown as Href, label: copy.archive.nav.submit, icon: PlusSquare },
  { href: '/saved' as unknown as Href, label: copy.archive.nav.saved, icon: BookmarkSimple },
];

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'bathtime:web-sidebar-collapsed';

function getStoredSidebarCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true';
}

function getHrefPath(href: Href): string {
  return typeof href === 'string' ? href : href.pathname;
}

function getActivePath(pathname: string): string {
  if (pathname.startsWith('/content/')) return '/explore';
  return pathname;
}

function isActive(pathname: string, href: Href): boolean {
  const activePath = getActivePath(pathname);
  const hrefPath = getHrefPath(href);
  if (hrefPath === '/') return activePath === '/';
  return activePath.startsWith(hrefPath);
}

function NavLink({
  item,
  active,
  compact = false,
  collapsed = false,
  labelOpacity,
}: {
  item: NavItem;
  active: boolean;
  compact?: boolean;
  collapsed?: boolean;
  labelOpacity?: Animated.Value;
}) {
  const [hovered, setHovered] = React.useState(false);
  const IconComponent = item.icon;

  return (
    <Pressable
      style={[
        compact ? styles.bottomTabItem : styles.navItem,
        collapsed && styles.navItemCollapsed,
        active && styles.navItemActive,
        hovered && !active && styles.navItemHover,
        styles.webTransition,
      ]}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={() => router.push(item.href)}
    >
      <IconComponent
        size={compact ? 21 : 20}
        color={active ? archiveColors.primaryActive : archiveColors.body}
        weight={active ? 'fill' : 'regular'}
      />
      {!collapsed ? (
        <Animated.Text
          style={[compact ? styles.bottomTabLabel : styles.navLabel, active && styles.navLabelActive, labelOpacity ? { opacity: labelOpacity } : null]}
          numberOfLines={1}
        >
          {item.label}
        </Animated.Text>
      ) : null}
    </Pressable>
  );
}

function Sidebar({
  pathname,
  collapsed,
  onToggle,
  progress,
}: {
  pathname: string;
  collapsed: boolean;
  onToggle: () => void;
  progress: Animated.Value;
}) {
  const sidebarWidth = progress.interpolate({ inputRange: [0, 1], outputRange: [77, 192] });

  return (
    <Animated.View style={[styles.sidebar, { width: sidebarWidth }, collapsed && styles.sidebarCollapsed]}>
      <View style={styles.brandBlock}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          style={styles.sidebarToggle}
          onPress={onToggle}
        >
          <List size={21} color={archiveColors.body} weight="regular" />
        </Pressable>
        {!collapsed ? (
          <Animated.View style={[styles.logoWrap, { opacity: progress }]}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          </Animated.View>
        ) : (
          <View style={styles.symbolWrap}>
            <BrandMark size={28} />
          </View>
        )}
      </View>
      <View style={[styles.sidebarNav, collapsed && styles.sidebarNavCollapsed]}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.label} item={item} active={isActive(pathname, item.href)} collapsed={collapsed} labelOpacity={progress} />
        ))}
      </View>
      {!collapsed ? (
        <Animated.View style={[styles.sidebarFooter, { opacity: progress }]}>
          <Pressable style={styles.sidebarFooterLink} onPress={() => router.push('/legal/privacy' as Href)}>
            <Text style={styles.sidebarFooterText}>개인정보처리방침</Text>
          </Pressable>
          <Pressable style={styles.sidebarFooterLink} onPress={() => router.push('/legal/terms' as Href)}>
            <Text style={styles.sidebarFooterText}>이용약관</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

function DesktopSearch() {
  const [query, setQuery] = React.useState('');
  const [focused, setFocused] = React.useState(false);

  const submitSearch = () => {
    const value = query.trim();
    router.push(value ? (`/explore?query=${encodeURIComponent(value)}` as Href) : ('/explore' as Href));
  };

  return (
    <View style={[styles.topSearch, focused && styles.topSearchFocused, styles.webTransition]}>
      <MagnifyingGlass size={17} color={focused ? archiveColors.primaryActive : archiveColors.muted} weight="regular" />
      <TextInput
        value={query}
        onChangeText={setQuery}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onSubmitEditing={submitSearch}
        placeholder="의식, 재료 또는 장소를 입력해주세요..."
        placeholderTextColor={archiveColors.muted}
        style={styles.topSearchInput}
        returnKeyType="search"
      />
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

export function AccountControls() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <Pressable style={styles.accountButton} onPress={() => router.push('/auth/login' as Href)}>
        <Text style={styles.accountButtonText}>로그인</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.profileMenuWrap}>
      {menuOpen ? <Pressable style={styles.profileMenuBackdrop} onPress={() => setMenuOpen(false)} /> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="계정 메뉴 열기"
        testID="account-profile-button"
        style={styles.profileButton}
        onPress={() => setMenuOpen((current) => !current)}
      >
        {user?.profileImageUrl ? (
          <Image testID="account-profile-image" source={{ uri: user.profileImageUrl }} style={styles.profileImage} resizeMode="cover" />
        ) : (
          <View testID="account-profile-fallback">
            <User size={18} color={archiveColors.primaryActive} weight="regular" />
          </View>
        )}
      </Pressable>
      {menuOpen ? (
        <View testID="account-profile-menu" style={styles.profileMenu}>
          <View style={styles.profileMenuHeader}>
            <Text style={styles.accountName} numberOfLines={1}>{user?.nickname ?? '내 계정'}</Text>
            {user?.email ? <Text style={styles.accountEmail} numberOfLines={1}>{user.email}</Text> : null}
          </View>
          <Pressable
            style={styles.logoutMenuItem}
            onPress={() => {
              setMenuOpen(false);
              void logout();
            }}
          >
            <Text style={styles.logoutMenuItemText}>로그아웃</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function DesktopTopBar() {
  return (
    <View style={styles.topBar}>
      <DesktopSearch />
      <AccountControls />
    </View>
  );
}

export function WebShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(getStoredSidebarCollapsed);
  const sidebarProgress = React.useRef(new Animated.Value(sidebarCollapsed ? 0 : 1)).current;
  const pageProgress = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  React.useEffect(() => {
    Animated.timing(sidebarProgress, {
      toValue: sidebarCollapsed ? 0 : 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [sidebarCollapsed, sidebarProgress]);

  React.useEffect(() => {
    pageProgress.setValue(0);
    Animated.timing(pageProgress, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pathname, pageProgress]);

  const pageTranslateY = pageProgress.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });

  return (
    <View style={styles.root}>
      {isDesktop ? (
        <Sidebar
          pathname={pathname}
          collapsed={sidebarCollapsed}
          progress={sidebarProgress}
          onToggle={() => setSidebarCollapsed((current) => !current)}
        />
      ) : null}
      <View style={styles.contentArea}>
        {isDesktop ? <DesktopTopBar /> : null}
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={[
          styles.main,
          {
            paddingHorizontal: isDesktop ? 0 : 16,
            paddingTop: isDesktop ? 40 : insets.top + 18,
            paddingBottom: isDesktop ? 48 : insets.bottom + 98,
          },
        ]}
      >
          <Animated.View style={{ opacity: pageProgress, transform: [{ translateY: pageTranslateY }] }}>
            {children}
          </Animated.View>
        </ScrollView>
      </View>
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
  contentArea: {
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
    paddingHorizontal: 0,
    paddingTop: 26,
    paddingBottom: 24,
    position: 'relative',
  },
  sidebarCollapsed: {},
  brandBlock: {
    minHeight: 116,
    position: 'relative',
  },
  sidebarToggle: {
    position: 'absolute',
    top: 0,
    left: 22,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  logoWrap: {
    marginTop: 58,
    marginLeft: 16,
  },
  symbolWrap: {
    alignItems: 'center',
    marginTop: 62,
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
    position: 'absolute',
    left: 16,
    right: 16,
    top: '50%',
    transform: [{ translateY: -170 }],
    gap: 8,
  },
  sidebarNavCollapsed: {
    left: 8,
    right: 8,
  },
  navItem: {
    minHeight: 60,
    borderRadius: archiveRadius.lg,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navItemCollapsed: {
    width: 60,
    paddingHorizontal: 0,
    justifyContent: 'center',
  },
  navItemActive: {
    backgroundColor: archiveColors.primarySoft,
  },
  navItemHover: {
    backgroundColor: archiveColors.surfaceSoft,
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
    gap: 4,
    paddingHorizontal: 16,
  },
  accountName: {
    color: archiveColors.ink,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  accountButton: {
    minHeight: 38,
    minWidth: 72,
    borderRadius: archiveRadius.md,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: archiveColors.surface,
  },
  accountButtonText: {
    color: archiveColors.ink,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  accountEmail: {
    color: archiveColors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: luxuryFonts.sans,
  },
  profileMenuWrap: {
    position: 'relative',
    zIndex: 20,
  },
  profileMenuBackdrop: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
  } as any,
  profileButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 30,
  },
  profileImage: {
    width: 38,
    height: 38,
  },
  profileMenu: {
    position: 'absolute',
    top: 46,
    right: 0,
    width: 220,
    borderRadius: archiveRadius.lg,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
    backgroundColor: archiveColors.surface,
    padding: 10,
    gap: 8,
    zIndex: 40,
    boxShadow: '0 16px 38px rgba(37, 42, 42, 0.16)',
  } as any,
  profileMenuHeader: {
    gap: 3,
    paddingHorizontal: 4,
    paddingVertical: 5,
  },
  logoutMenuItem: {
    minHeight: 38,
    borderRadius: archiveRadius.md,
    backgroundColor: archiveColors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutMenuItemText: {
    color: archiveColors.ink,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  sidebarFooterLink: {
    minHeight: 28,
    justifyContent: 'center',
  },
  sidebarFooterText: {
    color: archiveColors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: luxuryFonts.sans,
  },
  topBar: {
    width: '100%',
    minHeight: 64,
    backgroundColor: archiveColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: archiveColors.hairline,
    paddingHorizontal: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
    zIndex: 10,
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
  topSearchFocused: {
    borderColor: archiveColors.primaryDisabled,
    backgroundColor: archiveColors.surface,
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
  webTransition: {
    transitionDuration: '160ms',
    transitionProperty: 'background-color, border-color, opacity, transform',
    transitionTimingFunction: 'ease-out',
  } as any,
});
