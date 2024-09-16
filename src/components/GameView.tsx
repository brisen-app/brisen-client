import CardScreen from '@/src/components/card/CardScreen'
import Colors from '@/src/constants/Colors'
import { CardManager, PlayedCard } from '@/src/managers/CardManager'
import { LocalizationManager } from '@/src/managers/LocalizationManager'
import BottomSheet from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet'
import React, { useCallback, useEffect, useState } from 'react'
import { Button, Dimensions, FlatList, Pressable, PressableProps, Text, ViewProps, ViewToken } from 'react-native'
import { useSheetHeight } from '../lib/utils'
import { useAppContext, useAppDispatchContext } from '../providers/AppContextProvider'
import ScrollToBottomButton from './utils/ScrollToBottomButton'

export type GameViewProps = {
  bottomSheetRef?: React.RefObject<BottomSheet>
}

export default function GameView(props: Readonly<GameViewProps>) {
  const { bottomSheetRef } = props
  const flatListRef = React.useRef<FlatList>(null)
  const { playlist, players, playedCards, playedIds, categoryFilter } = useAppContext()
  const setContext = useAppDispatchContext()
  const [isOutOfCards, setIsOutOfCards] = useState<boolean>(true)
  const [viewableItems, setViewableItems] = useState<ViewToken<PlayedCard>[] | undefined>(undefined)
  const scrollButtonBottomPosition = useSheetHeight() - 8

  const showScrollButton = useCallback(() => {
    if (viewableItems === undefined) return false
    if (viewableItems.length === 0) return false
    return viewableItems.some(
      item => item.key !== playedCards[playedCards.length - 1].id && item.key !== playedCards[playedCards.length - 2].id
    )
  }, [viewableItems])

  const onPressNoCard = useCallback(() => {
    bottomSheetRef?.current?.snapToIndex(1)
  }, [])

  const onPressScrollButton = useCallback(() => {
    flatListRef.current?.scrollToIndex({ index: Math.max(0, playedCards.length - 1), animated: true })
  }, [playedCards.length])

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
    <>
      <FlatList<PlayedCard>
        ref={flatListRef}
        pagingEnabled
        scrollsToTop={false}
        showsVerticalScrollIndicator={false}
        data={playedCards}
        onEndReachedThreshold={1.01}
        onEndReached={addCard}
        onViewableItemsChanged={viewableItems => setViewableItems(viewableItems.viewableItems)}
        ListFooterComponent={<OutOfCardsView onPress={onPressNoCard} />}
        renderItem={({ item }) => <CardScreen card={item} />}
      />
      {showScrollButton() && (
        <ScrollToBottomButton onPress={onPressScrollButton} style={{ bottom: scrollButtonBottomPosition }} />
      )}
    </>
  )
}

function NoCardsView(props: Readonly<PressableProps & ViewProps>) {
  const { onPress, style } = props
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
          gap: 32,
        },
        style,
      ]}
    >
      <Text style={{ color: Colors.secondaryText, textAlign: 'center' }}>
        {LocalizationManager.get('select_pack')?.value ?? 'select_pack'}
      </Text>
    </Pressable>
  )
}

type OutOfCardsViewProps = { onPress: () => void }
function OutOfCardsView(props: Readonly<OutOfCardsViewProps>) {
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
          color: Colors.secondaryText,
        }}
      >
        {LocalizationManager.get('out_of_cards')?.value ?? 'out_of_cards'}
      </Text>
      <Button
        title={LocalizationManager.get('restart_game')?.value ?? 'restart_game'}
        color={Colors.accentColor}
        disabled={playedCards.length === 0}
        onPress={() => {
          props.onPress()
          setContext({ action: 'restartGame' })
        }}
      />
    </Pressable>
  )
}
