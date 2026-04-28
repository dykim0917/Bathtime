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
import { V2_ACCENT, V2_TEXT_MUTED } from '@/src/data/colors';
import { luxuryFonts } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

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
        tabBarActiveTintColor: V2_ACCENT,
        tabBarInactiveTintColor: V2_TEXT_MUTED,
        tabBarStyle: [
          ui.tabBarStyle,
          {
            height: ui.tabBarStyle.height + bottomInset,
            paddingBottom: ui.tabBarStyle.paddingBottom + bottomInset,
          },
        ],
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', letterSpacing: 0, fontFamily: luxuryFonts.sans },
        tabBarItemStyle: { borderRadius: 16, marginHorizontal: 1 },
        tabBarBackground: () => null,
      }}
    >
      <Tabs.Screen name="index" options={{ title: '홈', tabBarIcon: ({ color, focused }) => <TabBarIcon name="home" color={color} focused={focused} /> }} />
      <Tabs.Screen name="care" options={{ title: '컨디션', tabBarIcon: ({ color, focused }) => <TabBarIcon name="condition" color={color} focused={focused} /> }} />
      <Tabs.Screen name="trip" options={{ title: '무드', tabBarIcon: ({ color, focused }) => <TabBarIcon name="mood" color={color} focused={focused} /> }} />
      <Tabs.Screen name="product" options={{ title: '제품', tabBarIcon: ({ color, focused }) => <TabBarIcon name="product" color={color} focused={focused} /> }} />
      <Tabs.Screen name="my" options={{ title: '프로필', tabBarIcon: ({ color, focused }) => <TabBarIcon name="profile" color={color} focused={focused} /> }} />
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
