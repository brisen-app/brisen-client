import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import Card from '@/types/Card';
import GameCard from '@/components/GameCard';
import { ActivityIndicator } from '@/components/ActivityIndicator';
import { useQuery } from '@tanstack/react-query';


export default function TabOneScreen() {
	const { data: cards, isLoading } = useQuery({
		queryKey: ["fetchCards"],
		queryFn: async () => {
			return await Card.fetchAll()
		}
	})

	if (isLoading) return <ActivityIndicator label='Fetching cards'/>

	return <FlatList
		pagingEnabled
		showsVerticalScrollIndicator={false}
		data={cards}
		renderItem={({ item, index }) => <GameCard card={item} />}
		removeClippedSubviews={true}
		maxToRenderPerBatch={1}
	/>
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	}
});
