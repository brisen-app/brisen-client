import React, { useContext, useState } from 'react';
import { ActivityIndicator, FlatList, View, useColorScheme } from 'react-native';
import Card from '@/types/Card';
import CardView from '@/components/CardView';
import { useQuery } from '@tanstack/react-query';
import { PlaylistContext } from './AppContext';
import { Text } from './Themed';
import Colors from '@/constants/Colors';


export default function GameView() {
	const colorScheme = useColorScheme() ?? 'dark';
	const { playlist } = useContext(PlaylistContext);
	const [playedCards, setPlayedCards] = useState([] as Card[]);

	if (playlist.length === 0) return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<Text style={{ color: Colors[colorScheme].secondaryText }}>Ingen pakker valg</Text>
		</View>
	)

	return <FlatList
		pagingEnabled
		initialNumToRender={1}
		showsVerticalScrollIndicator={false}
		data={playedCards}
		renderItem={({ item, index }) => <CardView card={item} />}
	/>
}