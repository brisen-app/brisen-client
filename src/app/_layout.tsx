import Colors from '@/src/constants/Colors'
import { AppContextProvider } from '@/src/providers/AppContextProvider'
import AppDataProvider from '@/src/providers/AppDataProvider'
import InAppPurchaseProvider from '@/src/providers/InAppPurchaseProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { setBackgroundColorAsync, setPositionAsync } from 'expo-navigation-bar'
import { SplashScreen, Stack } from 'expo-router'
import { Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

SplashScreen.preventAutoHideAsync()

if (Platform.OS === 'android') {
  setBackgroundColorAsync('#00000000')
  setPositionAsync('absolute')
}

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
              {Platform.OS === 'web' && <ReactQueryDevtools initialIsOpen={true} />}
            </InAppPurchaseProvider>
          </AppContextProvider>
        </AppDataProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
