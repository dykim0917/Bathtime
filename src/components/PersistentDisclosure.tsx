import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import {
  TYPE_SCALE,
  V2_BORDER,
  V2_SURFACE,
  V2_TEXT_MUTED,
} from '@/src/data/colors';
import { copy } from '@/src/content/copy';

interface PersistentDisclosureProps {
  style?: ViewStyle;
  showColdWarning?: boolean;
  title?: string;
  lines?: string[];
  variant?: 'default' | 'v2';
}

export function PersistentDisclosure({
  style,
  showColdWarning = false,
  title = copy.disclosure.title,
  lines,
  variant = 'default',
}: PersistentDisclosureProps) {
  const baseLines = [...copy.disclosure.baseLines];

  const renderedLines = lines ?? [
    ...baseLines,
    ...(showColdWarning ? [copy.disclosure.coldWarning] : []),
  ];

  const isV2 = variant === 'v2';

  return (
    <View style={[styles.container, isV2 && styles.containerV2, style]}>
      <Text style={[styles.title, isV2 && styles.titleV2]}>{title}</Text>
      {renderedLines.map((line) => (
        <Text key={line} style={[styles.line, isV2 && styles.lineV2]}>
          {line}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: V2_BORDER,
    borderRadius: 12,
    backgroundColor: V2_SURFACE,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  containerV2: {
    borderColor: V2_BORDER,
    backgroundColor: V2_SURFACE,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: {
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
    color: V2_TEXT_MUTED,
    marginBottom: 2,
  },
  titleV2: {
    color: V2_TEXT_MUTED,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  line: {
    fontSize: TYPE_SCALE.caption,
    color: V2_TEXT_MUTED,
    lineHeight: 16,
  },
  lineV2: {
    color: V2_TEXT_MUTED,
    lineHeight: 17,
  },
});
