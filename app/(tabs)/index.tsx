import { StyleSheet, ActivityIndicator } from 'react-native';

import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabase';
import { Card } from '@/types/Card';
import React from 'react';

export default function TabOneScreen() {
	const [cards, setCards] = React.useState<Card[] | null>(null)

	React.useEffect(() => {
		Card.fetchAll().then((cards) => {
			setCards(cards)
		})
	}, [])

	if (cards === null) return <ActivityIndicator />

	return (
		<View style={styles.container}>
			{cards.map((card) => (
				<Text key={card.id.string}>{card.content}</Text>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	separator: {
		marginVertical: 30,
		height: 1,
		width: '80%',
	},
});
