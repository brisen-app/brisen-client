import { StyleSheet, ActivityIndicator } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { supabase } from '@/lib/supabase';
import React from 'react';

async function getCards() {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
  if (error) console.log('error', error)
  console.log('data', data)
  return data as Map<string, any>[]
}

export default function TabOneScreen() {
  const [cards, setCards] = React.useState<Map<string, any>[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    getCards().then((cards) => {
      setCards(cards)
      setLoading(false)
    })
  }, [])

  if (loading) return <ActivityIndicator />

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      {cards.map((card) => (
        <Text key={card.get("header")}>{card.get("header")}</Text>
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
