import React from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import Card from '@/types/Card';
import GameCard from '@/components/GameCard';
import { useQuery } from '@tanstack/react-query';


export default function GameView() {
	const { data: cards, isLoading } = useQuery({
		queryKey: ["fetch", Card.tableName, "all"],
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
		showsVerticalScrollIndicator={false}
		data={cards}
		renderItem={({ item, index }) => <GameCard card={item} />}
	/>
}