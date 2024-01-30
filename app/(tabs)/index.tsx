import { StyleSheet, ActivityIndicator } from 'react-native';

import { Text, View } from '@/components/Themed';
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
				<Text key={card.id.string} style={styles.title}>{card.content}</Text>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 16
	},
	title: {
		flex: 1,
		fontSize: 32,
		fontWeight: 'bold',
		textAlign: 'center',
		backgroundColor: 'red',
		padding: 16,
		borderRadius: 16,
		margin: 16
	},
	separator: {
		marginVertical: 30,
		height: 1,
		width: '80%',
	},
});
