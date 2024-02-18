import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, View, useColorScheme } from 'react-native';
import Card from '@/types/Card';
import CardScreen from '@/components/CardView';
import { useQuery } from '@tanstack/react-query';
import { PlaylistContext } from './AppContext';
import { Text } from './Themed';
import Colors from '@/constants/Colors';
import Pack from '@/types/Pack';
import UUID from '@/types/uuid';

function getRandomCard(playedCards: UUID[], playlist: Pack[]) {
	if (playlist.length === 0) return null;
	const packs = playlist.map(p => p.cards).flat();
	const availableCards = packs.filter(c => !playedCards.includes(c));
	const randomIndex = Math.floor(Math.random() * availableCards.length);
	return availableCards[randomIndex];
}

export default function GameView() {
	const colorScheme = useColorScheme() ?? 'dark';
	const { playlist } = useContext(PlaylistContext);
	const [playedCards, setPlayedCards] = useState([] as UUID[]);

	const addCard = () => {
		console.debug('Trying to add card');
		const newCard = getRandomCard(playedCards, playlist);
		if (!newCard) return;
		setPlayedCards([...playedCards, newCard])
	};

	useEffect(() => {
		if (playedCards.length === 0) addCard()
	}, [playlist]);

	if (playedCards.length === 0) return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<Text style={{ color: Colors[colorScheme].secondaryText }}>Velg en pakke!</Text>
		</View>
	)

	return <FlatList
		pagingEnabled
		showsVerticalScrollIndicator={false}
		data={playedCards}
		onEndReached={() => addCard()}
		renderItem={({ item }) => <CardScreen cardID={item} />}
	/>
}