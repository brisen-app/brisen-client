import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { LargeTitle } from '@/components/TextStyles';
import { Card } from '@/types/Card';
import GameCard from '@/components/GameCard';
import { ActivityIndicator } from '@/components/ActivityIndicator';


export default function TabOneScreen() {
	const [cards, setCards] = React.useState<Card[] | null>(null)
	const [index, setIndex] = React.useState(0)

	React.useEffect(() => {
		Card.fetchAll().then((cards) => {
			setCards(cards)
		})
	}, [])

	const onPress = () => {
		setIndex((index + 1) % cards!.length)
	}

	if (cards === null) return (
		<View style={styles.container}>
			<ActivityIndicator/>
		</View>
	)

	return <GameCard card={cards[index]} onPress={onPress} />
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	}
});
