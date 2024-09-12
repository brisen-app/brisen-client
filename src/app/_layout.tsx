import { AppContextProvider } from '@/src/providers/AppContextProvider'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Platform, StatusBar } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SplashScreen, Stack } from 'expo-router'
import * as NavigationBar from 'expo-navigation-bar'
import AppDataProvider from '@/src/providers/AppDataProvider'
import Colors from '@/src/constants/Colors'
import InAppPurchaseProvider from '@/src/providers/InAppPurchaseProvider'

SplashScreen.preventAutoHideAsync()

if (Platform.OS === 'android') {
  NavigationBar.setBackgroundColorAsync('#ffffff00')
  NavigationBar.setPositionAsync('absolute')
}

export default function Layout() {
  if (Platform.OS === 'android') {
    NavigationBar.setButtonStyleAsync('light')
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
            <InAppPurchaseProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: Colors.background },
                }}
              />
              <StatusBar barStyle={'light-content'} translucent />
              {Platform.OS === 'web' && <ReactQueryDevtools initialIsOpen={true} />}
            </InAppPurchaseProvider>
          </AppContextProvider>
        </AppDataProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
