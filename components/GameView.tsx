import CardScreen from '@/components/card/CardScreen'
import Colors from '@/constants/Colors'
import { CardManager } from '@/managers/CardManager'
import { LocalizationManager } from '@/managers/LocalizationManager'
import BottomSheet from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet'
import React, { useCallback, useEffect, useState } from 'react'
import { Button, Dimensions, FlatList, Pressable, PressableProps, ViewToken } from 'react-native'
import { useAppContext, useAppDispatchContext } from '../providers/AppContextProvider'
import { Text } from './utils/Themed'
import useColorScheme from './utils/useColorScheme'
import { useBottomSheet } from '@gorhom/bottom-sheet'

export type GameViewProps = {
  bottomSheetRef?: React.RefObject<BottomSheet>
}

export default function GameView(props: Readonly<GameViewProps>) {
  const { bottomSheetRef } = props
  const flatListRef = React.useRef<FlatList>(null)
  const { playlist, players, playedCards, playedIds, categoryFilter } = useAppContext()
  const setContext = useAppDispatchContext()
  const [isOutOfCards, setIsOutOfCards] = useState<boolean>(true)

  const onPressCard = useCallback(
    (index: number) => {
      if (playedCards.length <= index + 1) return
      flatListRef.current?.scrollToIndex({ index: index + 1, animated: true })
    },
    [playedCards]
  )

  const onPressNoCard = useCallback(() => {
    bottomSheetRef?.current?.snapToIndex(1)
  }, [])

  const addCard = () => {
    if (playlist.size === 0) return

    const newCard = CardManager.drawCard(playedCards, playedIds, playlist, players, categoryFilter)
    if (newCard === null) {
      setIsOutOfCards(true)
      return
    }

    setIsOutOfCards(false)

    setContext({ action: 'addPlayedCard', payload: newCard })
    setContext({
      action: 'incrementPlayCounts',
      payload: newCard.featuredPlayers,
    })

    console.log(`Added card ${playedCards.length + 1}:`, newCard.formattedContent ?? newCard.content)
  }

  // When the playlist or players change
  useEffect(() => {
    if (isOutOfCards) {
      addCard()
      return
    }

    const card = playedCards[playedCards.length - 1]
    setContext({ action: 'removeCachedPlayedCard', payload: card })
    console.log(`Removed card ${playedCards.length}:`, card.formattedContent ?? card.content)
    setIsOutOfCards(true)
  }, [playlist, players.size])

  if (playedCards.length === 0) return <NoCardsView onPress={onPressNoCard} />

  return (
    <FlatList
      ref={flatListRef}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      data={playedCards}
      onEndReachedThreshold={1}
      onEndReached={addCard}
      ListFooterComponent={<OutOfCardsView onPress={onPressNoCard} />}
      renderItem={({ item, index }) => <CardScreen card={item} onPress={() => onPressCard(index)} />}
    />
  )
}

function NoCardsView(props: Readonly<PressableProps>) {
  return (
    <Pressable
      onPress={props.onPress}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 32,
      }}
    >
      <Text style={{ color: Colors[useColorScheme()].secondaryText }}>
        {LocalizationManager.get('select_pack')?.value ?? 'select_pack'}
      </Text>
    </Pressable>
  )
}

type OutOfCardsViewProps = { onPress: () => void }
function OutOfCardsView(props: Readonly<OutOfCardsViewProps>) {
  const colorScheme = useColorScheme()
  const { playedCards } = useAppContext()
  const setContext = useAppDispatchContext()

  return (
    <Pressable
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
      }}
      {...props}
    >
      <Text
        style={{
          textAlign: 'center',
          color: Colors[useColorScheme()].secondaryText,
        }}
      >
        {LocalizationManager.get('out_of_cards')?.value ?? 'out_of_cards'}
      </Text>
      <Button
        title={LocalizationManager.get('restart_game')?.value ?? 'restart_game'}
        color={Colors[colorScheme].accentColor}
        disabled={playedCards.length === 0}
        onPress={() => {
          props.onPress()
          setContext({ action: 'restartGame' })
        }}
      />
    </Pressable>
  )
}
