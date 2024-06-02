import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Platform } from 'react-native'
import { AppContextProvider } from '@/components/utils/AppContextProvider'
import Colors from '@/constants/Colors'
import useColorScheme from '@/components/utils/useColorScheme'
import AppDataProvider from '@/components/utils/AppDataProvider'

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
