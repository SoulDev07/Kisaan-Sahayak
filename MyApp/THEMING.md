# Theming Guide

This app now uses a centralized Light/Dark theming system.

## Files
- `theme/index.js`: Theme tokens and navigation theme builder
- `context/ThemeContext.jsx`: Provider with AsyncStorage persistence and system mode

## Usage
- Access the theme in any component:

```jsx
import { useTheme } from '../context/ThemeContext';

const MyComponent = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>Hello</Text>
    </View>
  );
};
```

## Tokens
- `theme.colors`: `background`, `surface`, `card`, `text`, `textSecondary`, `primary`, `border`, `overlay`, `headerBackground`, `headerTitle`, `headerTint`, `statusBarStyle`
- `theme.spacing`, `theme.radii`, `theme.typography`

## Best Practices
- Do NOT hardcode colors. Use `theme.colors.*`.
- For icons, prefer `theme.colors.text` or semantic colors like `theme.colors.primary`.
- Wrap top-level containers with `backgroundColor: theme.colors.background`.
- For modals/overlays, use `theme.colors.overlay`.

## Extending
- Add tokens in `theme/index.js` in both `lightTheme` and `darkTheme`.
- If you add new screens, they automatically inherit navigation theme via `App.jsx`.

## Migration tips
- Grep for hardcoded colors: `#000`, `#111`, `#121212`, `#333`, `#444`, `#666`, `#fff`, `white`, `black`.
- Replace them with theme equivalents:
  - Backgrounds: `theme.colors.background` or `theme.colors.surface`
  - Primary accents: `theme.colors.primary`
  - Text: `theme.colors.text`, `theme.colors.textSecondary`
  - Borders: `theme.colors.border`

## System Mode
- Settings allow `System` mode (follows OS preference). Changes are applied live via `Appearance` listener.