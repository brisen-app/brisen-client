import CardScreen from '@/components/card/CardScreen'
import Colors from '@/constants/Colors'
import { CardManager } from '@/managers/CardManager'
import { LocalizationManager } from '@/managers/LocalizationManager'
import BottomSheet from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet'
import React, { useCallback, useEffect, useState } from 'react'
import { Button, Dimensions, FlatList, Pressable, PressableProps } from 'react-native'
import { useAppContext, useAppDispatchContext } from '../providers/AppContextProvider'
import { Text } from './utils/Themed'
import useColorScheme from './utils/useColorScheme'

export type GameViewProps = {
  bottomSheetRef?: React.RefObject<BottomSheet>
}

export default function GameView(props: Readonly<GameViewProps>) {
  const { bottomSheetRef } = props
  const flatListRef = React.useRef<FlatList>(null)
  const { playlist, players, playedCards, playedIds, categoryFilter } = useAppContext()
  const setContext = useAppDispatchContext()
  const [isOutOfCards, setIsOutOfCards] = useState<boolean>(true)

  const onPressNoCard = useCallback(() => {
    bottomSheetRef?.current?.snapToIndex(1)
  }, [])

  const addCard = () => {
    if (playlist.size === 0) return

    const newCard = CardManager.drawCard(playedCards, playedIds, playlist, players, categoryFilter)
    if (!newCard) {
      setIsOutOfCards(true)
      return
    }

    setIsOutOfCards(false)

    setContext({ action: 'addPlayedCard', payload: newCard })
    setContext({
      action: 'incrementPlayCounts',
      payload: newCard.featuredPlayers,
    })

    console.log(
      `Added card ${playedCards.length + 1}:`,
      (newCard.featuredPlayers.size && !newCard.is_group ? newCard.players[0].name + ', ' : '') +
        (newCard.formattedContent ?? newCard.content)
    )
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
      scrollsToTop={false}
      showsVerticalScrollIndicator={false}
      data={playedCards}
      onEndReachedThreshold={1}
      onEndReached={addCard}
      ListFooterComponent={<OutOfCardsView onPress={onPressNoCard} />}
      renderItem={({ item }) => <CardScreen card={item} />}
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
        width: Dimensions.get('screen').width,
        height: Dimensions.get('screen').height,
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
