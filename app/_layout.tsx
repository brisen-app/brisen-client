import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import HomeView from '@/components/HomeView'
import { Platform, View } from 'react-native'
import { AppContextProvider } from '@/components/utils/AppContext'
import Colors from '@/constants/Colors'
import useColorScheme from '@/components/utils/useColorScheme'
import { Text } from '@/components/utils/Themed'

export default function Root() {
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'red' }}>
            <Text style={{ color: 'black' }}>Test</Text>
        </View>
    )

    // return (
    //     <QueryClientProvider client={queryClient}>
    //         <AppContextProvider>
    //             <GestureHandlerRootView
    //                 style={{
    //                     flex: 1,
    //                     backgroundColor: Colors[colorScheme].appBackground,
    //                 }}
    //             >
    //                 <App />
    //                 {Platform.OS === 'web' && <ReactQueryDevtools initialIsOpen={true} />}
    //             </GestureHandlerRootView>
    //         </AppContextProvider>
    //     </QueryClientProvider>
    // )
}

function App() {
    // Initial setup
    // const queryClient = useQueryClient()

    // const { data: languages, error, isLoading: isLoadingLanguage } = useQuery({
    // 	queryKey: [Language.tableName],
    // 	queryFn: async () => {
    // 		return await Language.fetchAll()
    // 	}
    // })

    // languages?.forEach(item => {
    // 	queryClient.setQueryData([Language.tableName, item.id], item)
    // })

    // const { data: packs, isLoading } = useQuery({
    // 	queryKey: [Pack.tableName],
    // 	queryFn: async () => {
    // 		return await Pack.fetchAll()
    // 	}
    // })

    // packs?.forEach(item => {
    // 	queryClient.setQueryData([Pack.tableName, item.id], item)
    // })

    // const { data: categories, isLoading: isLoadingCategories } = useQuery({
    // 	queryKey: [Category.tableName],
    // 	queryFn: async () => {
    // 		return await Category.fetchAll()
    // 	}
    // })

    // categories?.forEach(item => {
    // 	queryClient.setQueryData([Category.tableName, item.id], item)
    // })

    // const language = languages ? Language.findDeviceLanguage(languages) : null
    // const { data: localizations, isLoading: isLoadingLocalizations } = useQuery({
    // 	queryKey: language ? [Localization.tableName, language.id] : [],
    // 	queryFn: async () => {
    // 		return await Localization.fetchAllWithLang(language!)
    // 	},
    // 	enabled: !!language
    // })

    // localizations?.forEach(item => {
    // 	queryClient.setQueryData([Localization.tableName, language!.id, item.id], item)
    // })

    // if (isLoading) return (
    // 	<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    // 		<ActivityIndicator color={"white"} size={"large"} />
    // 	</View>
    // )

    return <HomeView />
}
