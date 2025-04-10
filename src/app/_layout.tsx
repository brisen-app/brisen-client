import Colors from '@/src/constants/Colors'
import { AppContextProvider } from '@/src/providers/AppContextProvider'
import AppDataProvider from '@/src/providers/AppDataProvider'
import InAppPurchaseProvider from '@/src/providers/InAppPurchaseProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as NavigationBar from 'expo-navigation-bar'
import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Color from '../models/Color'

SplashScreen.preventAutoHideAsync()

export default function Layout() {
  const [loadingNavBar, setLoadingNavBar] = useState(Platform.OS === 'android')
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
    if (loadingNavBar) {
      setNavigationBarConfig()
        .catch(e => console.warn(e))
        .finally(() => setLoadingNavBar(false))
    }
  }, [])

  if (loadingNavBar) return null

  SplashScreen.hideAsync().catch(e => console.warn(e))

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <AppContextProvider>
          <AppDataProvider>
            <InAppPurchaseProvider>
              <StatusBar style='auto' translucent backgroundColor={Color.transparent.string} />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: Colors.background },
                }}
              />
            </InAppPurchaseProvider>
          </AppDataProvider>
        </AppContextProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}

async function setNavigationBarConfig() {
  await NavigationBar.setBackgroundColorAsync(Color.transparent.string)
  await NavigationBar.setPositionAsync('absolute')
  await NavigationBar.setBehaviorAsync('overlay-swipe')
}
