import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeView from "@/components/HomeView";
import { Platform } from "react-native";

export default function App() {
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
			<GestureHandlerRootView style={{backgroundColor: 'black'}}>
				<HomeView />
			</GestureHandlerRootView>
			{Platform.OS === 'web' && <ReactQueryDevtools initialIsOpen={true} />}
		</QueryClientProvider>
	);
}