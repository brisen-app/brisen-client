import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeView from "@/components/HomeView";
import { ActivityIndicator, Platform, Text, View, useColorScheme } from "react-native";
import Language from "@/types/Language";
import Pack from "@/types/Pack";
import Category from "@/types/Category";
import Localization from "@/types/Localization";
import SupabaseEntity from "@/types/SupabaseEntity";

export default function Root() {
	const isLightMode = useColorScheme() === 'light';
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: Infinity,
				refetchOnWindowFocus: false,
				retry: false,
				gcTime: Infinity,
			},
		}
	});

	return (
		<QueryClientProvider client={queryClient}>
			<GestureHandlerRootView style={{
				flex: 1,
				backgroundColor: isLightMode ? 'white' : 'black'
			}}>
				<App />
			</GestureHandlerRootView>
			{Platform.OS === 'web' && <ReactQueryDevtools initialIsOpen={true} />}
		</QueryClientProvider>
	);
}

function App() {
	const queryClient = useQueryClient()

	const { data: languages, isLoading: isLoadingLanguage } = useQuery({
		queryKey: [Language.tableName],
		queryFn: async () => {
			return await Language.fetchAll()
		}
	})

	languages?.forEach(item => {
		queryClient.setQueryData([Language.tableName, item.id], item)
	})

	const { data: packs, isLoading: isLoadingPacks } = useQuery({
		queryKey: [Pack.tableName],
		queryFn: async () => {
			return await Pack.fetchAll()
		}
	})

	packs?.forEach(item => {
		queryClient.setQueryData([Pack.tableName, item.id], item)
	})

	const { data: categories, isLoading: isLoadingCategories } = useQuery({
		queryKey: [Category.tableName],
		queryFn: async () => {
			return await Category.fetchAll()
		}
	})

	categories?.forEach(item => {
		queryClient.setQueryData([Category.tableName, item.id], item)
	})

	const language = languages ? Language.findDeviceLanguage(languages) : null
	const { data: localizations, isLoading: isLoadingLocalizations } = useQuery({
		queryKey: language ? [Localization.tableName, language.id] : [],
		queryFn: async () => {
			return await Localization.fetchAllWithLang(language!)
		},
		enabled: !!language
	})

	localizations?.forEach(item => {
		queryClient.setQueryData([Localization.tableName, language!.id, item.id], item)
	})

	if (isLoadingLanguage || isLoadingPacks || isLoadingCategories || isLoadingLocalizations) return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator color={"white"} size={"large"} />
		</View>
	)

	return <HomeView />
}