import { useColorScheme as defaultFunc } from 'react-native'

export type ColorSchemeName = 'light' | 'dark'

/**
 * A new useColorScheme hook is provided as the preferred way of accessing
 * the user's preferred color scheme (e.g. Dark Mode).
 * Defaults to 'dark' if the user's preference is not available.
 */
export default function useColorScheme(): ColorSchemeName {
  return defaultFunc() ?? 'dark'
}
