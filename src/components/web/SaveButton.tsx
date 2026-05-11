import React from 'react';
import { GestureResponderEvent, Pressable, StyleSheet } from 'react-native';
import { BookmarkSimple } from '@/src/components/web/phosphorIcons';
import { archiveColors } from '@/src/theme/archiveTheme';

type Props = {
  saved: boolean;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'floating' | 'inline';
};

export function SaveButton({ saved, onPress, disabled = false, variant = 'floating' }: Props) {
  const [hovered, setHovered] = React.useState(false);

  const handlePress = (event: GestureResponderEvent) => {
    event.stopPropagation?.();
    event.preventDefault?.();
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
        hovered && styles.hovered,
        disabled && styles.disabled,
        styles.webTransition,
      ]}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={handlePress}
    >
      <BookmarkSimple size={18} color={saved ? archiveColors.primary : archiveColors.muted} weight={saved ? 'fill' : 'regular'} />
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
  hovered: {
    borderColor: archiveColors.primaryDisabled,
    backgroundColor: archiveColors.primarySoft,
  },
  disabled: {
    opacity: 0.45,
  },
  webTransition: {
    transitionDuration: '140ms',
    transitionProperty: 'background-color, border-color, transform',
    transitionTimingFunction: 'ease-out',
  } as any,
});
