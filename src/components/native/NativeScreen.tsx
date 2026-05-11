import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Href, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { luxuryFonts } from '@/src/theme/luxury';
import { archiveColors } from '@/src/theme/archiveTheme';

export function NativeScreen({
  eyebrow,
  title,
  subtitle,
  backHref,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  backHref?: Href;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(backHref as Href);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 98 }]}
      >
        {backHref ? (
          <Pressable accessibilityRole="button" accessibilityLabel="뒤로가기" style={styles.backButton} onPress={handleBack}>
            <FontAwesome name="angle-left" size={25} color={archiveColors.ink} />
          </Pressable>
        ) : null}
        <View style={styles.header}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: archiveColors.canvas,
  },
  content: {
    paddingHorizontal: 18,
    gap: 18,
  },
  header: {
    gap: 8,
  },
  backButton: {
    width: 34,
    height: 34,
    marginBottom: -2,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  eyebrow: {
    color: archiveColors.primary,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: luxuryFonts.sans,
  },
  title: {
    color: archiveColors.ink,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '800',
    fontFamily: luxuryFonts.display,
  },
  subtitle: {
    color: archiveColors.body,
    fontSize: 16,
    lineHeight: 25,
    fontFamily: luxuryFonts.sans,
  },
});
