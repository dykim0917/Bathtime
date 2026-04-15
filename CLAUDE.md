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
  analytics/    ← Event tracking and analytics payload helpers
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
  TYPE_SCALE,
  TYPE_HEADING_LG, TYPE_HEADING_MD, TYPE_TITLE, TYPE_BODY, TYPE_CAPTION,
  V2_BG_BASE, V2_BG_TOP, V2_BG_BOTTOM, V2_BG_OVERLAY,
  V2_SURFACE, V2_SURFACE_SOFT, V2_BORDER, V2_BORDER_STRONG, V2_SHADOW,
  V2_MODAL_SURFACE, V2_MODAL_SURFACE_SUBTLE,
  V2_TEXT_PRIMARY, V2_TEXT_SECONDARY, V2_TEXT_MUTED,
  V2_ACCENT, V2_ACCENT_SOFT, V2_ACCENT_TEXT, V2_WARNING, V2_DANGER,
  V2_PILL_BG, V2_PILL_ACTIVE_BG, V2_PILL_BORDER,
  PERSONA_COLORS, PERSONA_GRADIENTS,
} from '@/src/data/colors';
```

**Typography scale:**
| Token | Value | Use |
|---|---|---|
| `TYPE_HEADING_LG` | 34 | Hero headings |
| `TYPE_HEADING_MD` | 20 | Section headings |
| `TYPE_TITLE` | 18 | Card titles |
| `TYPE_BODY` | 14 | Body text |
| `TYPE_CAPTION` | 12 | Labels, captions |

`TYPE_SCALE` is the single source of truth. Prefer `TYPE_SCALE.*` in new code, and use `luxuryFonts` / `luxuryTracking` from `src/theme/luxury.ts` for typography roles and tracking.

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
  { backgroundColor: V2_SURFACE, borderRadius: 24, borderWidth: 1, borderColor: V2_BORDER }
  ```
- **Pill buttons:** `borderRadius: 999`
- **Shadows (iOS + Android):**
  ```typescript
  { shadowColor: V2_SHADOW, shadowOpacity: 1, shadowRadius: 28, elevation: 8 }
  ```
- **Conditional styles:** `[styles.base, selected && { backgroundColor: V2_PILL_ACTIVE_BG }]`
- **Dynamic sizing:** Use `Dimensions.get('window')` only when truly needed; prefer flex layout
- **Quiet-luxury dark baseline only** — do not reintroduce light/pastel UI tokens unless explicitly requested

---

## Icons

- **IMPORTANT: Do not install new icon libraries.** Use only `@expo/vector-icons` (FontAwesome subset).
  ```typescript
  import { FontAwesome } from '@expo/vector-icons';
  <FontAwesome name="music" size={20} color={V2_ACCENT} />
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
- **Reanimated visuals** such as steam should also provide `.web.tsx` fallback when native-only behavior is involved

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
- Do not hardcode colors (`'#B08D57'` → use `V2_ACCENT`)
- Do not hardcode font sizes (prefer `TYPE_SCALE.*`; legacy `TYPE_*` aliases are acceptable when needed)
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
