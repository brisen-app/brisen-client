import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { LargeTitle } from '@/components/TextStyles';
import { Card } from '@/types/Card';
import React from 'react';
import { ActivityIndicator } from '@/components/ActivityIndicator';

export default function TabOneScreen() {
	const [cards, setCards] = React.useState<Card[] | null>(null)

	React.useEffect(() => {
		Card.fetchAll().then((cards) => {
			setCards(cards)
		})
	}, [])

	if (cards === null) return (
		<View style={styles.container}>
			<ActivityIndicator/>
		</View>
	)

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
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		textAlign: 'center',
		backgroundColor: 'red',
		padding: 16,
		borderRadius: 16,
		margin: 16,
		overflow: 'hidden'
	},
	separator: {
		marginVertical: 30,
		height: 1,
		width: '80%',
	},
});
