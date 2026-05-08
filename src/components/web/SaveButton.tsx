import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { GestureResponderEvent, Pressable, StyleSheet } from 'react-native';
import { archiveColors } from '@/src/theme/archiveTheme';

type Props = {
  saved: boolean;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'floating' | 'inline';
};

export function SaveButton({ saved, onPress, disabled = false, variant = 'floating' }: Props) {
  const handlePress = (event: GestureResponderEvent) => {
    event.stopPropagation?.();
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={saved ? '저장 해제' : '저장하기'}
      disabled={disabled}
      hitSlop={10}
      style={[
        styles.button,
        variant === 'inline' && styles.inline,
        disabled && styles.disabled,
      ]}
      onPress={handlePress}
    >
      <FontAwesome name={saved ? 'bookmark' : 'bookmark-o'} size={15} color={saved ? archiveColors.primary : archiveColors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: archiveColors.surface,
    borderWidth: 1,
    borderColor: archiveColors.hairline,
  },
  inline: {
    backgroundColor: archiveColors.primarySoft,
  },
  disabled: {
    opacity: 0.45,
  },
});
