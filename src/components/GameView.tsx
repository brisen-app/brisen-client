import CardScreen from '@/src/components/card/CardScreen'
import Colors from '@/src/constants/Colors'
import { CardManager, PlayedCard } from '@/src/managers/CardManager'
import { LocalizationManager } from '@/src/managers/LocalizationManager'
import BottomSheet from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Pressable,
  PressableProps,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
  ViewToken,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FontStyles } from '../constants/Styles'
import { useSheetHeight } from '../lib/utils'
import { useAppContext, useAppDispatchContext } from '../providers/AppContextProvider'
import ScrollToBottomButton from './utils/ScrollToBottomButton'
import { TouchableOpacityProps } from 'react-native-gesture-handler'

export type GameViewProps = {
  bottomSheetRef?: React.RefObject<BottomSheet>
}

const CARD_PEEK_HEIGHT = 16

export default function GameView(props: Readonly<GameViewProps>) {
  const { bottomSheetRef } = props
  const flatListRef = useRef<FlatList>(null)
  const { playlist, players, playedCards, playedIds, categoryFilter } = useAppContext()
  const setContext = useAppDispatchContext()
  const [isOutOfCards, setIsOutOfCards] = useState<boolean>(true)
  const [viewableItems, setViewableItems] = useState<ViewToken<PlayedCard>[] | undefined>(undefined)
  const scrollButtonBottomPosition = useSheetHeight() - 8

  const padding = 16
  const insets = useSafeAreaInsets()
  const safeArea = {
    paddingTop: Math.max(padding, insets.top),
    paddingLeft: insets.left,
    paddingRight: insets.right,
    paddingBottom: useSheetHeight() + padding,
  }

  const bottomSheetHeight = useSheetHeight()
  const cardHeight = Dimensions.get('screen').height - bottomSheetHeight - insets.top - padding - CARD_PEEK_HEIGHT

  const showScrollButton = useCallback(() => {
    if (viewableItems === undefined || viewableItems.length < 2) return false
    if (isOutOfCards) return true
    return viewableItems.some(item => item.index && item.index < playedCards.length - 3)
  }, [viewableItems, isOutOfCards])

  const onPressNoCard = useCallback(() => {
    bottomSheetRef?.current?.snapToIndex(1)
  }, [])

  const onPressScrollButton = useCallback(() => {
    if (isOutOfCards) {
      flatListRef.current?.scrollToEnd({ animated: true })
    } else {
      flatListRef.current?.scrollToIndex({ index: Math.max(0, playedCards.length - 2), animated: true })
    }
  }, [playedCards.length, isOutOfCards])

  const addCard = async () => {
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

  useEffect(() => {
    setContext({ action: 'currentCard', payload: viewableItems?.[0]?.item })
  }, [viewableItems])

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
        scrollsToTop={false}
        showsVerticalScrollIndicator={false}
        style={[{ overflow: 'visible' }, safeArea]}
        contentContainerStyle={{ gap: padding }}
        data={playedCards}
        decelerationRate={'fast'}
        snapToInterval={cardHeight + padding}
        keyboardDismissMode='on-drag'
        onEndReachedThreshold={1.01}
        onEndReached={addCard}
        onViewableItemsChanged={viewableItems => setViewableItems(viewableItems.viewableItems)}
        ListFooterComponent={
          <OutOfCardsView
            onPress={onPressNoCard}
            style={{ height: cardHeight, marginBottom: insets.top + insets.bottom + bottomSheetHeight + padding }}
          />
        }
        renderItem={({ item }) => <CardScreen card={item} style={{ height: cardHeight }} />}
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

function OutOfCardsView(props: Readonly<TouchableOpacityProps>) {
  const { onPress, style } = props
  const { playedCards } = useAppContext()
  const setContext = useAppDispatchContext()

  return (
    <View
      {...props}
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
        },
        style,
      ]}
    >
      <Text
        style={{
          textAlign: 'center',
          color: Colors.secondaryText,
        }}
      >
        {LocalizationManager.get('out_of_cards')?.value ?? 'out_of_cards'}
      </Text>
      <TouchableOpacity
        disabled={playedCards.length === 0}
        onPress={() => {
          onPress?.()
          setContext({ action: 'restartGame' })
        }}
        style={{
          backgroundColor: Colors.accentColor,
          borderRadius: Number.MAX_SAFE_INTEGER,
        }}
      >
        <Text
          style={{
            ...FontStyles.Button,
            color: Colors.background,
            paddingVertical: 12,
            paddingHorizontal: 48,
          }}
        >
          {LocalizationManager.get('restart_game')?.value ?? 'restart_game'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
