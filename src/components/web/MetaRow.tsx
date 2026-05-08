import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { archiveColors } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';

type MetaItem = {
  label: string;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
};

type Props = {
  items: MetaItem[];
};

export function MetaRow({ items }: Props) {
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View style={styles.item} key={`${item.icon ?? 'meta'}-${item.label}`}>
          {item.icon ? <FontAwesome name={item.icon} size={12} color={archiveColors.muted} /> : null}
          <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  label: {
    color: archiveColors.muted,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: luxuryFonts.sans,
  },
});

