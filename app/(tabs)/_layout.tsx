import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';

type TabIconName = 'home' | 'explore' | 'routine' | 'submit' | 'saved';

function TabBarIcon({ name, color, focused }: { name: TabIconName; color: string; focused: boolean }) {
  const strokeWidth = focused ? 2.1 : 1.8;

  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" style={{ marginBottom: -2 }}>
      {name === 'home' ? (
        <Path d="M4 10.7 12 4l8 6.7V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.3Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      ) : null}
      {name === 'explore' ? (
        <>
          <Circle cx="12" cy="12" r="8.2" stroke={color} strokeWidth={strokeWidth} />
          <Path d="m15.4 8.6-2 5-5 2 2-5 5-2Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
        </>
      ) : null}
      {name === 'routine' ? (
        <>
          <Path d="M12 3.8v3.1M12 17.1v3.1M5.6 6.4l2.2 2.2M16.2 15.4l2.2 2.2M3.8 12h3.1M17.1 12h3.1M5.6 17.6l2.2-2.2M16.2 8.6l2.2-2.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Circle cx="12" cy="12" r="3.3" stroke={color} strokeWidth={strokeWidth} />
        </>
      ) : null}
      {name === 'submit' ? (
        <>
          <Path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6.7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 3.1v-3.1A2.5 2.5 0 0 1 5 13.2V6.5Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M12 7.8v4.8M9.6 10.2h4.8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </>
      ) : null}
      {name === 'saved' ? (
        <Path d="M7 5.2A2.2 2.2 0 0 1 9.2 3h5.6A2.2 2.2 0 0 1 17 5.2V21l-5-3-5 3V5.2Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      ) : null}
    </Svg>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: archiveColors.primaryActive,
        tabBarInactiveTintColor: archiveColors.muted,
        tabBarStyle: {
          backgroundColor: archiveColors.surface,
          borderTopColor: archiveColors.hairline,
          borderTopWidth: 1,
          height: 74 + bottomInset,
          paddingTop: 8,
          paddingBottom: 8 + bottomInset,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', letterSpacing: 0, fontFamily: luxuryFonts.sans },
        tabBarItemStyle: { borderRadius: archiveRadius.md, marginHorizontal: 1 },
        tabBarBackground: () => null,
      }}
    >
      <Tabs.Screen name="index" options={{ title: '지금', tabBarIcon: ({ color, focused }) => <TabBarIcon name="home" color={color} focused={focused} /> }} />
      <Tabs.Screen name="explore" options={{ title: '탐색', tabBarIcon: ({ color, focused }) => <TabBarIcon name="explore" color={color} focused={focused} /> }} />
      <Tabs.Screen name="routines" options={{ title: '의식', tabBarIcon: ({ color, focused }) => <TabBarIcon name="routine" color={color} focused={focused} /> }} />
      <Tabs.Screen name="submit" options={{ title: '제보', tabBarIcon: ({ color, focused }) => <TabBarIcon name="submit" color={color} focused={focused} /> }} />
      <Tabs.Screen name="my" options={{ title: '보관함', tabBarIcon: ({ color, focused }) => <TabBarIcon name="saved" color={color} focused={focused} /> }} />
      <Tabs.Screen name="care" options={{ href: null }} />
      <Tabs.Screen name="trip" options={{ href: null }} />
      <Tabs.Screen name="product" options={{ href: null }} />
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
