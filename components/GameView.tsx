import React from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import Card from '@/types/Card';
import CardView from '@/components/CardView';
import { useQuery } from '@tanstack/react-query';


export default function GameView() {
	const { data: cards, isLoading } = useQuery({
		queryKey: [Card.tableName],
		queryFn: async () => {
			return await Card.fetchAll()
		}
	})

	if (isLoading) return (
		<View style={{ flex: 1 }}>
			<ActivityIndicator size={'large'} />
		</View>
	)

	return <FlatList
		pagingEnabled
		initialNumToRender={1}
		showsVerticalScrollIndicator={false}
		data={cards}
		renderItem={({ item, index }) => <CardView card={item} />}
	/>
}