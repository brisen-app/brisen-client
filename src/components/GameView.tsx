import Colors from '@/src/constants/Colors'
import { PlayedCard } from '@/src/managers/CardManager'
import { LocalizationManager } from '@/src/managers/LocalizationManager'
import { Ionicons } from '@expo/vector-icons'
import BottomSheet from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
  ViewToken,
} from 'react-native'
import { TouchableOpacityProps } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { FontStyles } from '../constants/Styles'
import { useSheetBottomInset } from '../lib/utils'
import { drawCard, getPlayableCards } from '../managers/GameManager'
import { PackManager } from '../managers/PackManager'
import { useAppContext, useAppDispatchContext } from '../providers/AppContextProvider'
import { useInAppPurchaseContext } from '../providers/InAppPurchaseProvider'
import { CardView } from './card/CardView'
import HoverButtons from './utils/HoverButtons'

export type GameViewProps = {
  bottomSheetRef?: React.RefObject<BottomSheet>
}

export default function GameView(props: Readonly<GameViewProps>) {
  const { bottomSheetRef } = props
  const sheetHeight = useSheetBottomInset()
  const flatListRef = useRef<FlatList>(null)
  const c = useAppContext()
  const { playlist, players, playedCards, currentCard } = c
  const setContext = useAppDispatchContext()
  const [isOutOfCards, setIsOutOfCards] = useState<boolean>(true)
  const [viewableItems, setViewableItems] = useState<ViewToken<PlayedCard>[] | undefined>(undefined)
  const { isSubscribed } = useInAppPurchaseContext()

  const screenHeight = Dimensions.get('window').height

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

    const newCard = drawCard(c)
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
      offset: currentCardIndex * screenHeight,
      animated: false,
    })
  }, [])

  useEffect(() => {
    console.log('Updating current card:', viewableItems?.[0]?.item?.id)
    setContext({ action: 'currentCard', payload: viewableItems?.[0]?.item.id })
  }, [viewableItems])

  // When the playlist or players change
  useEffect(() => {
    setContext({
      action: 'removePacks',
      payload: playlist.filter(p => {
        const pack = PackManager.get(p)
        if (!pack) return true
        const playableCards = getPlayableCards(pack.id, c)
        if (!PackManager.isPlayable(pack.cards.length, playableCards.size)) return true
        if (!pack.is_free && !isSubscribed) return true
        return false
      }),
    })

    if (isOutOfCards || playedCards.length === 0) {
      addCard()
      return
    }

    const card = playedCards[playedCards.length - 1]
    setContext({ action: 'removeCachedPlayedCard', payload: card })
    console.log(`Removed card ${playedCards.length}:`, card.formattedContent ?? card.content)
  }, [playlist.length, players.length])

  const keyExtractor = (item: PlayedCard) => item.id
  const renderItem: ({ item }: { item: PlayedCard }) => React.JSX.Element = useCallback(
    ({ item }) => <CardView card={item} style={{ height: screenHeight }} />,
    []
  )

  const getItemLayout = useCallback(
    (_: ArrayLike<PlayedCard> | null | undefined, index: number) => ({
      length: screenHeight,
      offset: screenHeight * index,
      index,
    }),
    []
  )

  const listFooter = () => (
    <OutOfCardsView
      onPress={onPressNoCard}
      style={{
        height: screenHeight,
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
        data={playedCards}
        pagingEnabled
        disableIntervalMomentum
        keyboardDismissMode='on-drag'
        onEndReachedThreshold={1}
        onEndReached={addCard}
        onViewableItemsChanged={info => setViewableItems(info.viewableItems)}
        ListFooterComponent={listFooter}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        renderItem={renderItem}
      />
      {showScrollButton() && (
        <HoverButtons
          buttons={[
            {
              icon: 'chevron-down',
              onPress: onPressScrollButton,
              style: { paddingHorizontal: 16, bottom: sheetHeight + 64 },
            },
          ]}
        />
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
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.yellow.dark,
          paddingVertical: 12,
          paddingHorizontal: 36,
          borderRadius: Number.MAX_SAFE_INTEGER,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: Colors.stroke,
          gap: 4,
        }}
      >
        <Ionicons name='reload' size={18} color={Colors.yellow.light} />
        <Text
          style={{
            ...FontStyles.Button,
            color: Colors.yellow.light,
          }}
        >
          {LocalizationManager.get('restart_game')?.value ?? 'restart_game'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
