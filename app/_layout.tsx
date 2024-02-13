import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeView from "@/components/HomeView";
import { Platform, useColorScheme } from "react-native";

export default function App() {
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
			<GestureHandlerRootView style={{ flex: 1,
				backgroundColor: isLightMode ? 'white' : 'black'}}>
				<HomeView />
			</GestureHandlerRootView>
			{Platform.OS === 'web' && <ReactQueryDevtools initialIsOpen={true} />}
		</QueryClientProvider>
	);
}