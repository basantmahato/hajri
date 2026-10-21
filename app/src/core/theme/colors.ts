export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryGradient: readonly [string, string];
  accent: string;
  accentLight: string;
  accentDark: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;
  background: string;
  surface: string;
  surfaceSubtle: string;
  surfaceBorder: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  textInverse: string;
  cardShadow: string;
  overlay: string;
  divider: string;
  tabBarBg: string;
  tabBarBorder: string;
}

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    // Hajri Signature Forest Green
    primary: '#1b6b4a',
    primaryDark: '#163d30',
    primaryLight: '#eef5f1',
    primaryGradient: ['#163d30', '#1b6b4a'],

    // Present (Green)
    accent: '#1b6b4a',
    accentLight: '#eef5f1',
    accentDark: '#114a33',

    // Half Day (Warm Amber)
    warning: '#d97706',
    warningLight: '#fef3c7',

    // Absent (Red)
    danger: '#dc2626',
    dangerLight: '#fee2e2',

    // Leave (Slate Blue)
    info: '#2563eb',
    infoLight: '#eff6ff',

    background: '#f4f6f3',
    surface: '#ffffff',
    surfaceSubtle: '#e8ece8',
    surfaceBorder: '#dde3dd',

    text: '#17251f',
    textMuted: '#738078',
    textSubtle: '#9aa59f',
    textInverse: '#ffffff',

    cardShadow: 'rgba(23, 37, 31, 0.08)',
    overlay: 'rgba(23, 37, 31, 0.55)',
    divider: '#e8ece8',
    tabBarBg: '#ffffff',
    tabBarBorder: '#e2e8e4',
  },
  dark: {
    primary: '#2ea171',
    primaryDark: '#1b6b4a',
    primaryLight: '#183125',
    primaryGradient: ['#11261d', '#1b6b4a'],

    accent: '#2ea171',
    accentLight: '#183125',
    accentDark: '#45bf89',

    warning: '#f59e0b',
    warningLight: '#452205',

    danger: '#ef4444',
    dangerLight: '#451212',

    info: '#3b82f6',
    infoLight: '#172b4d',

    background: '#0d1511',
    surface: '#15211b',
    surfaceSubtle: '#1d2c25',
    surfaceBorder: '#273a31',

    text: '#f2f5f3',
    textMuted: '#9aa59f',
    textSubtle: '#697770',
    textInverse: '#0d1511',

    cardShadow: 'rgba(0, 0, 0, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.75)',
    divider: '#273a31',
    tabBarBg: '#15211b',
    tabBarBorder: '#273a31',
  },
};
