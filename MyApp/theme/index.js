// Centralized Light/Dark theme tokens for the app
// Keep tokens minimal and opinionated; extend as needed

const base = {
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radii: { sm: 6, md: 12, lg: 20, xl: 28 },
  typography: {
    sizes: { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28, display: 52 },
    weights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
  },
  // Brand colors
  brand: {
    primary: '#10B981', // emerald
    danger: '#FF5722',
    info: '#3B82F6',
  },
};

export const lightTheme = {
  name: 'light',
  colors: {
    // Content
    text: '#111827',
    textSecondary: '#4B5563',
    // Surfaces
    background: '#C8E6C9',
    surface: '#F6F7F9',
    card: '#FFFFFF',
    border: '#E5E7EB',
    overlay: 'rgba(0,0,0,0.5)',
    // Accents
    primary: base.brand.primary,
    success: '#22C55E',
    danger: base.brand.danger,
    info: base.brand.info,
    // Header
    headerBackground: '#C8E6C9',
    headerTitle: '#111827',
    headerTint: '#4B5563',
    // Status bar
    statusBarStyle: 'dark-content',
  // Additional semantic tokens
  onPrimary: '#FFFFFF',
  accent: '#A855F7',
  muted: '#9CA3AF',
  warning: '#F59E0B',
  },
  ...base,
};

export const darkTheme = {
  name: 'dark',
  colors: {
    // Content
    text: '#FFFFFF',
    textSecondary: '#C7C7CC',
    // Surfaces
    background: '#121212',
    surface: '#1A1A1A',
    card: '#1F2937',
    border: '#2A2A2A',
    overlay: 'rgba(0,0,0,0.7)',
    // Accents
    primary: base.brand.primary,
    success: '#22C55E',
    danger: base.brand.danger,
    info: base.brand.info,
    // Header
    headerBackground: '#161616',
    headerTitle: '#FFFFFF',
    headerTint: '#C7C7CC',
    // Status bar
    statusBarStyle: 'light-content',
  // Additional semantic tokens
  onPrimary: '#000000',
  accent: '#A855F7',
  muted: '#9CA3AF',
  warning: '#F59E0B',
  },
  ...base,
};

// Build a theme object for @react-navigation
export const buildNavigationTheme = (theme) => ({
  dark: theme.name === 'dark',
  colors: {
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.card,
    text: theme.colors.text,
    border: theme.colors.border,
    notification: theme.colors.primary,
  },
});

export const themes = { light: lightTheme, dark: darkTheme };
