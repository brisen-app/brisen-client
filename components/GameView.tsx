import React, { useCallback, useEffect } from 'react'
import { Button, Dimensions, FlatList, Pressable, PressableProps } from 'react-native'
import CardScreen from '@/components/card/CardScreen'
import Colors from '@/constants/Colors'
import useColorScheme from './utils/useColorScheme'
import BottomSheet from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet'
import { CardManager } from '@/lib/CardManager'
import { useAppContext, useAppDispatchContext } from './utils/AppContextProvider'
import { Text } from './utils/Themed'
import { LocalizationManager } from '@/lib/LocalizationManager'

export type GameViewProps = {
    bottomSheetRef?: React.RefObject<BottomSheet>
}

export default function GameView(props: Readonly<GameViewProps>) {
    const { bottomSheetRef } = props
    const flatListRef = React.useRef<FlatList>(null)
    const { playlist, players, playedCards, playedIds, categoryFilter } = useAppContext()
    const setContext = useAppDispatchContext()

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
        const newCard = CardManager.getNextCard(playedIds, playlist, players, categoryFilter)
        console.log(newCard)
        if (newCard === null) return
        setContext({ type: 'addPlayedCard', payload: newCard })
    }

    useEffect(() => {
        addCard()
    }, [playlist, players])

    if (playedCards.length === 0) return <NoCardsView />

    return (
        <FlatList
            ref={flatListRef}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            // initialNumToRender={2}
            // maxToRenderPerBatch={1}
            data={playedCards}
            // onEndReachedThreshold={0}
            // onEndReached={addCard}
            ListEmptyComponent={<NoCardsView onPress={onPressNoCard} />}
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
            }}
        >
            <Text style={{ color: Colors[useColorScheme()].secondaryText }}>
                {LocalizationManager.get('select_pack')?.value}
            </Text>
        </Pressable>
    )
}

function OutOfCardsView(props: Readonly<PressableProps>) {
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
                {LocalizationManager.get('out_of_cards')?.value}
            </Text>
            <Button
                title={LocalizationManager.get('restart_game')?.value ?? '-'}
                color={Colors[colorScheme].accentColor}
                disabled={playedCards.length === 0}
                onPress={() => setContext({ type: 'restartGame' })}
            />
        </Pressable>
    )
}
