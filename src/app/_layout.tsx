import Colors from '@/src/constants/Colors'
import { AppContextProvider } from '@/src/providers/AppContextProvider'
import AppDataProvider from '@/src/providers/AppDataProvider'
import InAppPurchaseProvider from '@/src/providers/InAppPurchaseProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setBackgroundColorAsync, setBehaviorAsync, setPositionAsync } from 'expo-navigation-bar'
import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Color from '../models/Color'

SplashScreen.preventAutoHideAsync()

export default function Layout() {
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

  useEffect(() => {
    if (Platform.OS === 'android') {
      setBackgroundColorAsync(Color.transparent.string)
      setPositionAsync('absolute')
      setBehaviorAsync('overlay-swipe')
    }
  }, [])

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <AppDataProvider>
          <AppContextProvider>
            <InAppPurchaseProvider>
              <StatusBar style='auto' translucent backgroundColor={Color.transparent.string} />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: Colors.background },
                }}
              />
            </InAppPurchaseProvider>
          </AppContextProvider>
        </AppDataProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
