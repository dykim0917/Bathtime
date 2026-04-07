# Bath Sommelier — Claude Code Design System Rules

## Figma MCP Integration

### Required Flow (do not skip)

1. Run `get_design_context` first for the exact node(s)
2. If the response is too large, run `get_metadata` to get the node map, then re-fetch only required nodes with `get_design_context`
3. Run `get_screenshot` for a visual reference before writing any code
4. Only after you have both `get_design_context` and `get_screenshot`, start implementation
5. Translate the MCP output (React + Tailwind) into React Native conventions (see rules below)
6. Validate against the Figma screenshot for 1:1 look and behavior before marking complete

### Translation Rules (Figma MCP → React Native)

- Figma MCP outputs React + Tailwind. Translate to **React Native primitives + StyleSheet**.
- `div` → `View`, `span`/`p` → `Text`, `button` → `TouchableOpacity`, `img` → `Image`
- Tailwind utility classes → `StyleSheet.create()` entries using project design tokens
- CSS flexbox maps directly to RN flexbox (default axis is `column` in RN, not `row`)
- No `px` units — RN uses unitless numbers
- No `hover` or CSS pseudo-classes — use `onPress`, `onPressIn`, `onPressOut`
- No inline SVG — use `@expo/vector-icons` (FontAwesome) or `Image` for raster assets

---

## Project Structure

```
src/
  components/   ← All reusable UI components (16 files)
  data/         ← Design tokens and static data
  engine/       ← Pure algorithm logic (no UI)
  hooks/        ← Custom React hooks
  storage/      ← AsyncStorage wrappers
  theme/        ← Shared StyleSheet namespace (ui.ts)
  utils/        ← Utility functions
app/            ← Expo Router screens (file-based routing)
assets/         ← Images, audio files
```

---

## Component Conventions

- Place new UI components in `src/components/`
- Use **named exports** (not default exports): `export function ComponentName(...)`
- Define TypeScript interfaces for all props (strict mode is enabled)
- Put `StyleSheet.create()` at the **bottom** of the file
- Component filenames match the exported function name exactly

```typescript
// Pattern
export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  return <View style={styles.container}>...</View>;
}

const styles = StyleSheet.create({
  container: { /* ... */ },
});
```

---

## Design Tokens

**IMPORTANT: Never hardcode colors, font sizes, or spacing values.** Always import from the token files below.

### Colors & Typography — `src/data/colors.ts`

```typescript
import {
  APP_BG_BASE, CARD_SURFACE, CARD_BORDER, CARD_SHADOW,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED,
  ACCENT, BTN_PRIMARY, BTN_DISABLED,
  PILL_BG, PILL_ACTIVE_BG, PILL_BORDER,
  WARNING_COLOR, DANGER_COLOR,
  TYPE_HEADING_LG, TYPE_HEADING_MD, TYPE_TITLE, TYPE_BODY, TYPE_CAPTION,
  PERSONA_COLORS, PERSONA_GRADIENTS,
} from '@/src/data/colors';
```

**Typography scale:**
| Token | Value | Use |
|---|---|---|
| `TYPE_HEADING_LG` | 30 | Hero headings |
| `TYPE_HEADING_MD` | 22 | Section headings |
| `TYPE_TITLE` | 18 | Card titles |
| `TYPE_BODY` | 14 | Body text |
| `TYPE_CAPTION` | 12 | Labels, captions |

**Persona-keyed theming:** Components that vary by health persona must use `PERSONA_COLORS[personaCode]` and `PERSONA_GRADIENTS[personaCode]` — accept `accentColor: string` as a prop when persona-driven.

### Shared StyleSheet Namespace — `src/theme/ui.ts`

```typescript
import { ui } from '@/src/theme/ui';
// Use: ui.screenShell, ui.glassCard, ui.sectionTitle, ui.titleHero, ui.bodyText, ui.pillButton
```

IMPORTANT: Reuse `ui.*` entries for common patterns before creating new styles.

---

## Styling Patterns

- **No NativeWind, no Tailwind, no CSS-in-JS** — use `StyleSheet.create()` only
- **Glass-morphism surface pattern:**
  ```typescript
  { backgroundColor: CARD_SURFACE, borderRadius: 18, borderWidth: 1, borderColor: CARD_BORDER }
  ```
- **Pill buttons:** `borderRadius: 999`
- **Shadows (iOS + Android):**
  ```typescript
  { shadowColor: CARD_SHADOW, shadowOpacity: 1, shadowRadius: 8, elevation: 4 }
  ```
- **Conditional styles:** `[styles.base, selected && { backgroundColor: PILL_ACTIVE_BG }]`
- **Dynamic sizing:** Use `Dimensions.get('window')` only when truly needed; prefer flex layout
- **Light mode only** — no dark mode variants required

---

## Icons

- **IMPORTANT: Do not install new icon libraries.** Use only `@expo/vector-icons` (FontAwesome subset).
  ```typescript
  import { FontAwesome } from '@expo/vector-icons';
  <FontAwesome name="music" size={20} color={ACCENT} />
  ```
- For assets from Figma MCP localhost sources, use them directly with `<Image source={{ uri: '...' }} />`

---

## Animation

- **Complex animations** (progress, transitions): `react-native-reanimated` v4
  ```typescript
  import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
  ```
- **Gradient backgrounds**: `expo-linear-gradient`
  ```typescript
  import { LinearGradient } from 'expo-linear-gradient';
  ```
- **Skia graphics** (water fill): `@shopify/react-native-skia` — provide `.web.tsx` fallback for web

---

## Haptic Feedback

Use the `useHaptic` hook — never call `expo-haptics` directly.

```typescript
import { useHaptic } from '@/src/hooks/useHaptic';
const haptic = useHaptic();
haptic.light(); // or .medium(), .success(), .warning()
```

---

## Navigation (Expo Router)

- Screens live in `app/` using file-based routing
- Modal screens use Stack presentation `'modal'` or `'transparentModal'`
- Navigate with `router.push('/result/recipe/[id]')` from `expo-router`
- Tab structure (v3.12.0): 5 tabs — Home (`index`), Care (`care`), Trip (`trip`), Product (`product`), My (`my`)

---

## Modal Pattern

All modal overlays follow this structure:

```typescript
export function MyModal({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={[ui.glassCard, styles.container]}>
          {/* content */}
        </View>
      </View>
    </Modal>
  );
}
```

---

## Asset Handling

- Static assets: `assets/` directory (images in `assets/images/`, audio in `assets/audio/`)
- IMPORTANT: If Figma MCP server returns a localhost URI for an image/SVG, use it directly in `<Image source={{ uri }}>` — do not download or add placeholder
- Do not create placeholder images or blank Image components if the asset URI is available

---

## Path Aliases

The `@/` alias resolves to the project root. Always use it for imports:
- `@/src/components/TagChip` ✓
- `../../src/components/TagChip` ✗

---

## What Not to Do

- Do not add NativeWind, Tailwind, or any new styling library
- Do not hardcode colors (`'#7895CF'` → use `ACCENT`)
- Do not hardcode font sizes (use `TYPE_*` tokens)
- Do not install new icon packages
- Do not create default exports for components
- Do not invent a separate light-mode redesign, the app now uses a quiet-luxury dark baseline
- Do not use `console.log` in production components
- Do not add TypeScript `any` types (strict mode enforced)

## Design System
Always read `DESIGN.md` before making any visual or UI decisions.
All font roles, colors, spacing, tone, and component rules are defined there.
Use serif only for branded editorial moments, sans for interaction, and monospace for timer/data moments.
Do not revert to pastel tokens, generic wellness gradients, or glass-heavy cards without explicit user approval.
In QA or review mode, flag any screen that drifts away from `DESIGN.md`.
