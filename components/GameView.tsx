import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, FlatList, View } from 'react-native';
import CardScreen from '@/components/CardScreen';
import { PlaylistContext } from './AppContext';
import { Text } from './Themed';
import Colors from '@/constants/Colors';
import useColorScheme from './useColorScheme';
import { Pack } from '@/lib/supabase';

function getRandomCard(playedCards: (string | null)[], playlist: Pack[]) {
	const allCards = playlist.map(p => p.cards).flat();
	const availableCards = allCards.filter(c => !playedCards.includes(c.id));
	if (availableCards.length === 0) return null;
	const randomIndex = Math.floor(Math.random() * availableCards.length);
	return availableCards[randomIndex].id;
}

export default function GameView() {
	const colorScheme = useColorScheme();
	const { playlist } = useContext(PlaylistContext);
	const [playedCards, setPlayedCards] = useState([] as (string | null)[]);

	const addCard = () => {
		if (playlist.length === 0) return;
		console.debug('Trying to add card');
		const newCard = getRandomCard(playedCards, playlist);
		if (playedCards[playedCards.length - 1] === null && newCard === null) return;
		if (newCard && !playedCards[playedCards.length - 1]) playedCards.pop();
		setPlayedCards([...playedCards, newCard])
	};

	useEffect(() => {
		// When playlist changes
		if (playedCards.length === 0 || playedCards[playedCards.length - 1] === null) addCard()
	}, [playlist]);

	useEffect(() => {
		console.debug("Rendering GameView");
	}, [])

	if (playedCards.length === 0) return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<Text style={{ color: Colors[colorScheme].secondaryText }}>Velg en pakke!</Text>
		</View>
	)

	return <FlatList
		pagingEnabled
		showsVerticalScrollIndicator={false}
		initialNumToRender={1}
		maxToRenderPerBatch={1}
		data={playedCards}
		// onEndReachedThreshold={0}
		onEndReached={() => {
			if (playedCards[playedCards.length - 1] === null) return;
			addCard()
		}}
		renderItem={({ item }) => item ?
			<CardScreen cardID={item} /> :
			<NoCardView />
		}
	/>
}

function NoCardView() {
	return (
		<View style={{
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			width: Dimensions.get('window').width,
			height: Dimensions.get('window').height
		}}>
			<Text>Tomt for kort!</Text>
		</View>
	)
}