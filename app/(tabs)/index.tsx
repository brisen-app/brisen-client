import { StyleSheet, ActivityIndicator } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabase';
import React from 'react';

async function getCards() {
  const { data: cards, error } = await supabase
    .from('cards')
    .select('*')
  if (error) console.log('error', error)
  return cards ?? []
}

export default function TabOneScreen() {
  const [cards, setCards] = React.useState<any[] | null>(null)

  React.useEffect(() => {
    getCards().then((cards) => {
      setCards(cards)
    })
  }, [])

  if (cards === null) return <ActivityIndicator />

  return (
    <View style={styles.container}>
      {cards.map((card) => (
        <Text key={card.id}>{card.title}</Text>
      ))  
      }
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
