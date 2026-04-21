import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

interface AnimatedModalShellProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode | ((requestClose: () => void) => React.ReactNode);
  layoutStyle?: StyleProp<ViewStyle>;
  backdropStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  cardStyle?: StyleProp<ViewStyle>;
  align?: 'bottom' | 'center';
}

const BACKDROP_ENTER_DURATION = 220;
const BACKDROP_EXIT_DURATION = 160;
const SHEET_ENTER_DURATION = 320;
const SHEET_EXIT_DURATION = 260;

export function AnimatedModalShell({
  visible,
  onClose,
  children,
  layoutStyle,
  backdropStyle,
  containerStyle,
  cardStyle,
  align = 'bottom',
}: AnimatedModalShellProps) {
  const [isRendered, setIsRendered] = useState(visible);
  const [sheetHeight, setSheetHeight] = useState(0);
  const isClosingByRequest = useRef(false);
  const backdropOpacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const sheetTranslateY = useRef(
    new Animated.Value(visible ? 0 : getHiddenOffset(align, 0)),
  ).current;

  const hiddenOffset = useMemo(() => getHiddenOffset(align, sheetHeight), [align, sheetHeight]);

  const animateIn = useCallback(() => {
    backdropOpacity.stopAnimation();
    sheetTranslateY.stopAnimation();
    backdropOpacity.setValue(0);
    sheetTranslateY.setValue(hiddenOffset);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: BACKDROP_ENTER_DURATION,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: SHEET_ENTER_DURATION,
        easing: Easing.bezier(0.2, 0.96, 0.32, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, hiddenOffset, sheetTranslateY]);

  const animateOut = useCallback((notifyClose: boolean) => {
    backdropOpacity.stopAnimation();
    sheetTranslateY.stopAnimation();

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: BACKDROP_EXIT_DURATION,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: hiddenOffset,
        duration: SHEET_EXIT_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) return;
      setIsRendered(false);
      isClosingByRequest.current = false;
      if (notifyClose) {
        onClose();
      }
    });
  }, [backdropOpacity, hiddenOffset, onClose, sheetTranslateY]);

  useEffect(() => {
    if (visible) {
      isClosingByRequest.current = false;
      setIsRendered(true);
      return;
    }

    if (isRendered && !isClosingByRequest.current) {
      animateOut(false);
    }
  }, [animateOut, isRendered, visible]);

  useEffect(() => {
    if (!isRendered || !visible) return;
    const frame = requestAnimationFrame(() => {
      animateIn();
    });
    return () => cancelAnimationFrame(frame);
  }, [animateIn, isRendered, visible]);

  const requestClose = useCallback(() => {
    if (!isRendered || isClosingByRequest.current) return;
    isClosingByRequest.current = true;
    animateOut(true);
  }, [animateOut, isRendered]);

  const handleSheetLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);
    if (!nextHeight || nextHeight === sheetHeight) return;
    setSheetHeight(nextHeight);
  }, [sheetHeight]);

  return (
    <Modal
      visible={visible || isRendered}
      transparent
      animationType="none"
      onRequestClose={requestClose}
    >
      <View
        style={[
          styles.overlayBase,
          align === 'center' ? styles.overlayCenter : styles.overlayBottom,
          layoutStyle,
        ]}
      >
        <Animated.View
          pointerEvents="box-none"
          style={[
            StyleSheet.absoluteFillObject,
            styles.backdropBase,
            backdropStyle,
            { opacity: backdropOpacity },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFillObject} onPress={requestClose} />
        </Animated.View>
        <View
          pointerEvents="box-none"
          style={[
            styles.contentContainer,
            align === 'center' ? styles.contentCenter : styles.contentBottom,
            containerStyle,
          ]}
        >
          <Animated.View
            style={[
              styles.cardWrap,
              { transform: [{ translateY: sheetTranslateY }] },
            ]}
            onLayout={handleSheetLayout}
          >
            <View style={cardStyle}>
              {typeof children === 'function' ? children(requestClose) : children}
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

function getHiddenOffset(align: 'bottom' | 'center', sheetHeight: number) {
  if (align === 'center') return 42;
  return Math.max(sheetHeight + 36, Dimensions.get('window').height * 0.46);
}

const styles = StyleSheet.create({
  overlayBase: {
    flex: 1,
  },
  backdropBase: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayBottom: {
    justifyContent: 'flex-end',
  },
  overlayCenter: {
    justifyContent: 'center',
  },
  contentContainer: {
    flexShrink: 1,
  },
  contentBottom: {
    justifyContent: 'flex-end',
  },
  contentCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrap: {
    width: '100%',
  },
});
