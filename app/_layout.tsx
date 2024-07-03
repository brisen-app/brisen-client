import { AppContextProvider } from '@/components/utils/AppContextProvider'
import AppDataProvider from '@/components/utils/AppDataProvider'
import useColorScheme from '@/components/utils/useColorScheme'
import Colors from '@/constants/Colors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Stack } from 'expo-router'
import { Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function Layout() {
  const colorScheme = useColorScheme()
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
    <QueryClientProvider client={queryClient}>
      <AppDataProvider>
        <AppContextProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors[colorScheme].background },
              }}
            />
            {Platform.OS === 'web' && <ReactQueryDevtools initialIsOpen={true} />}
          </GestureHandlerRootView>
        </AppContextProvider>
      </AppDataProvider>
    </QueryClientProvider>
  )
}
