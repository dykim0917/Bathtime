import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { V2_ACCENT, V2_TEXT_MUTED } from '@/src/data/colors';
import { luxuryFonts } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string; }) {
  return <FontAwesome size={21} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: V2_ACCENT,
        tabBarInactiveTintColor: V2_TEXT_MUTED,
        tabBarStyle: ui.tabBarStyle,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', letterSpacing: 0, fontFamily: luxuryFonts.sans },
        tabBarItemStyle: { borderRadius: 10, marginHorizontal: 0 },
        tabBarBackground: () => null,
      }}
    >
      <Tabs.Screen name="index" options={{ title: '홈', tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} /> }} />
      <Tabs.Screen name="care" options={{ title: '컨디션', tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} /> }} />
      <Tabs.Screen name="trip" options={{ title: '무드', tabBarIcon: ({ color }) => <TabBarIcon name="compass" color={color} /> }} />
      <Tabs.Screen name="product" options={{ title: '제품', tabBarIcon: ({ color }) => <TabBarIcon name="shopping-bag" color={color} /> }} />
      <Tabs.Screen name="my" options={{ title: '프로필', tabBarIcon: ({ color }) => <TabBarIcon name="user-o" color={color} /> }} />
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
