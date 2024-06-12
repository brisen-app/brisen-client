import React, { useCallback, useEffect } from 'react'
import { Button, Dimensions, FlatList, Pressable, PressableProps, ViewToken } from 'react-native'
import CardScreen from '@/components/card/CardScreen'
import Colors from '@/constants/Colors'
import useColorScheme from './utils/useColorScheme'
import BottomSheet from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet'
import { CardManager, PlayedCard } from '@/lib/CardManager'
import { useAppContext, useAppDispatchContext } from './utils/AppContextProvider'
import { Text } from './utils/Themed'
import { LocalizationManager } from '@/lib/LocalizationManager'
import Animated, { Easing, SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

export type GameViewProps = {
  bottomSheetRef?: React.RefObject<BottomSheet>
}

export default function GameView(props: Readonly<GameViewProps>) {
  const { bottomSheetRef } = props
  const flatListRef = React.useRef<FlatList>(null)
  const { playlist, players, playedCards, playedIds, categoryFilter } = useAppContext()
  const setContext = useAppDispatchContext()
  const visibleItems = useSharedValue<ViewToken[]>([])

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
    if (newCard === null) return
    setContext({ type: 'addPlayedCard', payload: newCard })
    console.log(`Added card ${playedCards.length + 1}:`, newCard.formattedContent ?? newCard.content)
  }

  const onViewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
    visibleItems.value = viewableItems
  }

  useEffect(() => {
    if (visibleItems.value.length === 0) addCard()
  }, [playlist, players])

  if (playedCards.length === 0) return <NoCardsView onPress={onPressNoCard} />

  return (
    <FlatList
      ref={flatListRef}
      pagingEnabled
      onViewableItemsChanged={onViewableItemsChanged}
      showsVerticalScrollIndicator={false}
      initialNumToRender={1}
      maxToRenderPerBatch={1}
      data={playedCards}
      onEndReachedThreshold={0.99}
      onEndReached={addCard}
      ListFooterComponent={<OutOfCardsView viewableItems={visibleItems} onPress={onPressNoCard} />}
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
      }}
    >
      <Text style={{ color: Colors[useColorScheme()].secondaryText }}>
        {LocalizationManager.get('select_pack')?.value}
      </Text>
    </Pressable>
  )
}

type OutOfCardsViewProps = { onPress: () => void; viewableItems: SharedValue<ViewToken<PlayedCard>[]> }
function OutOfCardsView(props: Readonly<OutOfCardsViewProps>) {
  const { viewableItems } = props
  const colorScheme = useColorScheme()
  const { playedCards } = useAppContext()
  const setContext = useAppDispatchContext()

  const animationConfig = { duration: 200, easing: Easing.bezier(0, 0, 0.5, 1) }

  const animatedStyle = useAnimatedStyle(() => {
    const isVisible = viewableItems.value.length === 0
    return {
      opacity: withTiming(isVisible ? 1 : 0, animationConfig),
      transform: [{ scale: withTiming(isVisible ? 1 : 0.9, animationConfig) }],
    }
  }, [])

  return (
    <Animated.View style={animatedStyle}>
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
          {LocalizationManager.get('out_of_cards')?.value}
        </Text>
        <Button
          title={LocalizationManager.get('restart_game')?.value ?? '-'}
          color={Colors[colorScheme].accentColor}
          disabled={playedCards.length === 0}
          onPress={() => {
            props.onPress()
            setContext({ type: 'restartGame' })
          }}
        />
      </Pressable>
    </Animated.View>
  )
}
