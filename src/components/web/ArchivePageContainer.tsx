import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

type Variant = 'grid' | 'detail' | 'narrow';

type Props = {
  children: React.ReactNode;
  variant: Variant;
};

function getMaxWidth(variant: Variant): number {
  if (variant === 'narrow') return 760;
  return 1120;
}

export function ArchivePageContainer({ children, variant }: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const desktopPadding = variant === 'detail' ? 0 : 62;

  return (
    <View
      style={[
        styles.container,
        {
          maxWidth: isDesktop ? getMaxWidth(variant) : undefined,
          paddingHorizontal: isDesktop ? desktopPadding : 0,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
  },
});
