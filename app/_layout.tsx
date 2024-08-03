import { AppContextProvider } from '@/providers/AppContextProvider'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Platform, View } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SplashScreen, Stack } from 'expo-router'
import * as NavigationBar from 'expo-navigation-bar'
import AppDataProvider from '@/providers/AppDataProvider'
import Colors from '@/constants/Colors'
import useColorScheme from '@/components/utils/useColorScheme'
import { Styles } from '@/constants/Styles'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Color from '@/models/Color'

SplashScreen.preventAutoHideAsync()
if (Platform.OS === 'android') {
  NavigationBar.setBackgroundColorAsync('#ffffff00')
  NavigationBar.setPositionAsync('absolute')
}

export default function Layout() {
  const colorScheme = useColorScheme()
  if (Platform.OS === 'android') {
    NavigationBar.setButtonStyleAsync(colorScheme === 'dark' ? 'light' : 'dark')
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        retry: false,
        gcTime: Infinity,
      },
    },
  })

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <AppDataProvider>
          <AppContextProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors[colorScheme].background },
              }}
            />
            {Platform.OS === 'web' && <ReactQueryDevtools initialIsOpen={true} />}
          </AppContextProvider>
        </AppDataProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
