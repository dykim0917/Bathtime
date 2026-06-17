import type React from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type PhosphorIconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

export type PhosphorIconProps = {
  color?: string;
  duotoneColor?: string;
  duotoneOpacity?: number;
  mirrored?: boolean;
  size?: number | string;
  style?: StyleProp<ViewStyle | Omit<TextStyle, 'cursor'>>;
  testID?: string;
  title?: string;
  titleId?: string;
  weight?: PhosphorIconWeight;
};

export type PhosphorIcon = React.FC<PhosphorIconProps>;

export { Bathtub } from 'phosphor-react-native/src/icons/Bathtub';
export { BookmarkSimple } from 'phosphor-react-native/src/icons/BookmarkSimple';
export { BookOpen } from 'phosphor-react-native/src/icons/BookOpen';
export { Buildings } from 'phosphor-react-native/src/icons/Buildings';
export { CalendarCheck } from 'phosphor-react-native/src/icons/CalendarCheck';
export { CheckCircle } from 'phosphor-react-native/src/icons/CheckCircle';
export { Clock } from 'phosphor-react-native/src/icons/Clock';
export { ClockClockwise } from 'phosphor-react-native/src/icons/ClockClockwise';
export { Compass } from 'phosphor-react-native/src/icons/Compass';
export { CurrencyDollar } from 'phosphor-react-native/src/icons/CurrencyDollar';
export { FileText } from 'phosphor-react-native/src/icons/FileText';
export { Fire } from 'phosphor-react-native/src/icons/Fire';
export { Gauge } from 'phosphor-react-native/src/icons/Gauge';
export { HouseLine } from 'phosphor-react-native/src/icons/HouseLine';
export { House } from 'phosphor-react-native/src/icons/House';
export { Lock } from 'phosphor-react-native/src/icons/Lock';
export { ListChecks } from 'phosphor-react-native/src/icons/ListChecks';
export { List } from 'phosphor-react-native/src/icons/List';
export { MagnifyingGlass } from 'phosphor-react-native/src/icons/MagnifyingGlass';
export { MapPin } from 'phosphor-react-native/src/icons/MapPin';
export { MapTrifold } from 'phosphor-react-native/src/icons/MapTrifold';
export { Moon } from 'phosphor-react-native/src/icons/Moon';
export { Package } from 'phosphor-react-native/src/icons/Package';
export { Play } from 'phosphor-react-native/src/icons/Play';
export { PlayCircle } from 'phosphor-react-native/src/icons/PlayCircle';
export { PlusSquare } from 'phosphor-react-native/src/icons/PlusSquare';
export { ShoppingBag } from 'phosphor-react-native/src/icons/ShoppingBag';
export { Shower } from 'phosphor-react-native/src/icons/Shower';
export { SlidersHorizontal } from 'phosphor-react-native/src/icons/SlidersHorizontal';
export { Sparkle } from 'phosphor-react-native/src/icons/Sparkle';
export { SquaresFour } from 'phosphor-react-native/src/icons/SquaresFour';
export { Thermometer } from 'phosphor-react-native/src/icons/Thermometer';
export { Timer } from 'phosphor-react-native/src/icons/Timer';
export { Umbrella } from 'phosphor-react-native/src/icons/Umbrella';
export { User } from 'phosphor-react-native/src/icons/User';
export { Waves } from 'phosphor-react-native/src/icons/Waves';
export { Wind } from 'phosphor-react-native/src/icons/Wind';
export { Wrench } from 'phosphor-react-native/src/icons/Wrench';
export { XCircle } from 'phosphor-react-native/src/icons/XCircle';
