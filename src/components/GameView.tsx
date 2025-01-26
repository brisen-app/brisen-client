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
import { TouchableOpacityProps } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FontStyles } from '../constants/Styles'
import { useSheetHeight } from '../lib/utils'
import { useAppContext, useAppDispatchContext } from '../providers/AppContextProvider'
import { CardView } from './card/CardView'
import ScrollToBottomButton from './utils/ScrollToBottomButton'

export type GameViewProps = {
  bottomSheetRef?: React.RefObject<BottomSheet>
}

const CARD_PEEK_HEIGHT = 16
const PADDING = 16

export default function GameView(props: Readonly<GameViewProps>) {
  const { bottomSheetRef } = props
  const sheetHeight = useSheetHeight()
  const flatListRef = useRef<FlatList>(null)
  const { playlist, players, playedCards, playedIds, categoryFilter, currentCard } = useAppContext()
  const setContext = useAppDispatchContext()
  const [isOutOfCards, setIsOutOfCards] = useState<boolean>(true)
  const [viewableItems, setViewableItems] = useState<ViewToken<PlayedCard>[] | undefined>(undefined)
  const scrollButtonBottomPosition = sheetHeight - 8

  const insets = useSafeAreaInsets()
  const safeArea = {
    paddingTop: Math.max(PADDING, insets.top),
    marginLeft: insets.left,
    marginRight: insets.right,
  }

  const cardHeight = Dimensions.get('screen').height - sheetHeight - insets.top - PADDING - CARD_PEEK_HEIGHT

  const showScrollButton = useCallback(() => {
    if (viewableItems === undefined) return false
    if (isOutOfCards && viewableItems.some(item => item.index != null && item.index < playedCards.length - 1))
      return true
    return viewableItems.some(item => item.index != null && item.index < playedCards.length - 3)
  }, [viewableItems])

  const onPressNoCard = () => bottomSheetRef?.current?.snapToIndex(1)

  const onPressScrollButton = () => {
    if (isOutOfCards) {
      flatListRef.current?.scrollToEnd({ animated: true })
    } else {
      flatListRef.current?.scrollToIndex({ index: Math.max(0, playedCards.length - 2), animated: true })
    }
  }

  const addCard = async () => {
    if (playedCards.length === 0 && playlist.length === 0) return

    const newCard = CardManager.drawCard(playedCards, playedIds, playlist, players, new Set(categoryFilter))
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
      (newCard.featuredPlayers.length && !newCard.is_group ? newCard.players[0].name + ', ' : '') +
        (newCard.formattedContent ?? newCard.content)
    )
  }

  useEffect(() => {
    if (!currentCard) return
    const currentCardIndex = playedCards.findIndex(c => c.id === currentCard)
    console.debug('Scrolling to card:', currentCard)
    console.debug(
      'list:',
      playedCards.map(c => c.id)
    )
    console.debug('Found at index:', currentCardIndex)
    if (currentCardIndex <= 0) return
    flatListRef.current?.scrollToOffset({
      offset: currentCardIndex * (cardHeight + PADDING),
      animated: false,
    })
  }, [])

  useEffect(() => {
    console.log('Updating current card:', viewableItems?.[0]?.item?.id)
    setContext({ action: 'currentCard', payload: viewableItems?.[0]?.item.id })
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
  }, [playlist.length, players.size])

  const keyExtractor = (item: PlayedCard) => item.id
  const renderItem = useCallback(
    ({ item }: { item: PlayedCard }) => <CardView card={item} style={{ height: cardHeight, marginBottom: PADDING }} />,
    []
  )

  const getItemLayout = useCallback(
    (_: ArrayLike<PlayedCard> | null | undefined, index: number) => ({
      length: cardHeight + PADDING,
      offset: (cardHeight + PADDING) * index,
      index,
    }),
    []
  )

  const listFooter = () => (
    <OutOfCardsView
      onPress={onPressNoCard}
      style={{
        height: cardHeight,
        marginBottom: sheetHeight + insets.top + PADDING + CARD_PEEK_HEIGHT,
      }}
    />
  )

  if (playedCards.length === 0) return <NoCardsView onPress={onPressNoCard} />

  return (
    <>
      <Animated.FlatList<PlayedCard>
        ref={flatListRef}
        maxToRenderPerBatch={3}
        windowSize={3}
        scrollsToTop={false}
        showsVerticalScrollIndicator={false}
        style={safeArea}
        data={playedCards}
        decelerationRate={'fast'}
        snapToInterval={cardHeight + PADDING}
        disableIntervalMomentum
        keyboardDismissMode='on-drag'
        onEndReachedThreshold={1.01}
        onEndReached={addCard}
        onViewableItemsChanged={info => setViewableItems(info.viewableItems)}
        ListFooterComponent={listFooter}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        renderItem={renderItem}
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
