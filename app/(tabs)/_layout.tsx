import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgProps } from 'react-native-svg';
import ConditionIcon from '@/assets/icons/condition.svg';
import ConditionIconOn from '@/assets/icons/condition_on.svg';
import HomeIcon from '@/assets/icons/home.svg';
import HomeIconOn from '@/assets/icons/home_on.svg';
import MoodIcon from '@/assets/icons/mood.svg';
import MoodIconOn from '@/assets/icons/mood_on.svg';
import ProductIcon from '@/assets/icons/product.svg';
import ProductIconOn from '@/assets/icons/product_on.svg';
import ProfileIcon from '@/assets/icons/profile.svg';
import ProfileIconOn from '@/assets/icons/profile_on.svg';
import { archiveColors, archiveRadius } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';

type TabIconName = 'home' | 'condition' | 'mood' | 'product' | 'profile';

const TAB_ICONS: Record<TabIconName, { default: React.FC<SvgProps>; active: React.FC<SvgProps> }> = {
  home: { default: HomeIcon, active: HomeIconOn },
  condition: { default: ConditionIcon, active: ConditionIconOn },
  mood: { default: MoodIcon, active: MoodIconOn },
  product: { default: ProductIcon, active: ProductIconOn },
  profile: { default: ProfileIcon, active: ProfileIconOn },
};

function TabBarIcon({ name, color, focused }: { name: TabIconName; color: string; focused: boolean }) {
  const Icon = focused ? TAB_ICONS[name].active : TAB_ICONS[name].default;
  return <Icon width={22} height={22} fill={color} stroke={color} style={{ marginBottom: -2 }} />;
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
      <Tabs.Screen name="index" options={{ title: '홈', tabBarIcon: ({ color, focused }) => <TabBarIcon name="home" color={color} focused={focused} /> }} />
      <Tabs.Screen name="explore" options={{ title: '탐색', tabBarIcon: ({ color, focused }) => <TabBarIcon name="condition" color={color} focused={focused} /> }} />
      <Tabs.Screen name="routines" options={{ title: '의식', tabBarIcon: ({ color, focused }) => <TabBarIcon name="mood" color={color} focused={focused} /> }} />
      <Tabs.Screen name="submit" options={{ title: '제보', tabBarIcon: ({ color, focused }) => <TabBarIcon name="product" color={color} focused={focused} /> }} />
      <Tabs.Screen name="my" options={{ title: '프로필', tabBarIcon: ({ color, focused }) => <TabBarIcon name="profile" color={color} focused={focused} /> }} />
      <Tabs.Screen name="care" options={{ href: null }} />
      <Tabs.Screen name="trip" options={{ href: null }} />
      <Tabs.Screen name="product" options={{ href: null }} />
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
