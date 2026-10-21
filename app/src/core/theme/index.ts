import { useColorScheme } from 'react-native';
import { Colors, type ThemeColors } from './colors';
import { Spacing, Radius, Typography } from './spacing';

export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors: ThemeColors = isDark ? Colors.dark : Colors.light;

  return {
    isDark,
    colors,
    spacing: Spacing,
    radius: Radius,
    typography: Typography,
  };
}

export { Colors, Spacing, Radius, Typography };
export type { ThemeColors };
