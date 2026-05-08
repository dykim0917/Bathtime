import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Bathtub,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  ShoppingBag,
  type PhosphorIcon,
} from '@/src/components/web/phosphorIcons';
import { archiveColors } from '@/src/theme/archiveTheme';
import { luxuryFonts } from '@/src/theme/luxury';

export type MetaIconName = 'clock' | 'bathtub' | 'map-pin' | 'check-circle' | 'shopping-bag' | 'tag' | 'file-text';

type MetaItem = {
  label: string;
  icon?: MetaIconName;
};

type Props = {
  items: MetaItem[];
};

const META_ICONS: Record<MetaIconName, PhosphorIcon> = {
  clock: Clock,
  bathtub: Bathtub,
  'map-pin': MapPin,
  'check-circle': CheckCircle,
  'shopping-bag': ShoppingBag,
  tag: FileText,
  'file-text': FileText,
};

export function MetaRow({ items }: Props) {
  return (
    <View style={styles.row}>
      {items.map((item) => {
        const IconComponent = item.icon ? META_ICONS[item.icon] : null;

        return (
          <View style={styles.item} key={`${item.icon ?? 'meta'}-${item.label}`}>
            {IconComponent ? <IconComponent size={14} color={archiveColors.muted} weight="regular" /> : null}
            <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
          </View>
        );
      })}
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
    fontWeight: '500',
    fontFamily: luxuryFonts.sans,
  },
});
