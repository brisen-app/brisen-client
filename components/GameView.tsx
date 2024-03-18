import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Dimensions, FlatList, Pressable, PressableProps } from 'react-native'
import CardScreen from '@/components/CardScreen'
import { PlaylistContext } from './AppContext'
import Colors from '@/constants/Colors'
import useColorScheme from './useColorScheme'
import { Pack } from '@/lib/PackManager'
import { LocalizedText } from './LocalizedText'
import BottomSheet from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet'

function getRandomCard(playedCards: (string | null)[], playlist: Pack[]) {
    const allCards = playlist.map((p) => p.cards).flat()
    const availableCards = allCards.filter((c) => !playedCards.includes(c.id))
    if (availableCards.length === 0) return null
    const randomIndex = Math.floor(Math.random() * availableCards.length)
    return availableCards[randomIndex].id
}

export type GameViewProps = {
    bottomSheetRef?: React.RefObject<BottomSheet>
}

export default function GameView(props: Readonly<GameViewProps>) {
    const colorScheme = useColorScheme()
    const { bottomSheetRef } = props
    const flatListRef = React.useRef<FlatList>(null)
    const { playlist } = useContext(PlaylistContext)
    const [playedCards, setPlayedCards] = useState([] as (string | null)[])

    const onPressCard = useCallback(
        (index: number) => {
            if (playedCards.length <= index + 1) return
            flatListRef.current?.scrollToIndex({ index: index + 1, animated: true })
        },
        [playedCards.length]
    )

    const onPressNoCard = useCallback(() => {
        bottomSheetRef?.current?.snapToIndex(1)
    }, [])

    const addCard = () => {
        if (playlist.length === 0) return
        console.debug('Trying to add card')
        const newCard = getRandomCard(playedCards, playlist)
        if (playedCards[playedCards.length - 1] === null && newCard === null) return
        if (newCard && !playedCards[playedCards.length - 1]) playedCards.pop()
        setPlayedCards([...playedCards, newCard])
    }

    useEffect(() => {
        // When playlist changes
        if (playedCards.length === 0 || playedCards[playedCards.length - 1] === null) {
            addCard()
        }
    }, [playlist])

    useEffect(() => {
        console.debug('Rendering GameView')
    }, [])

    if (playedCards.length === 0)
        return (
            <Pressable
                onPress={onPressNoCard}
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <LocalizedText
                    id={'select_pack'}
                    style={{ color: Colors[colorScheme].secondaryText }}
                    placeHolderStyle={{ width: 128 }}
                />
            </Pressable>
        )

    return (
        <FlatList
            ref={flatListRef}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            initialNumToRender={2}
            maxToRenderPerBatch={1}
            data={playedCards}
            // onEndReachedThreshold={0}
            onEndReached={addCard}
            ListEmptyComponent={<NoCardsView onPress={onPressNoCard} />}
            renderItem={({ item, index }) =>
                item ? (
                    <CardScreen cardID={item} onPress={() => onPressCard(index)} />
                ) : (
                    <OutOfCardsView onPress={onPressNoCard} />
                )
            }
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
            <LocalizedText
                id={'select_pack'}
                style={{ color: Colors[useColorScheme()].secondaryText }}
                placeHolderStyle={{ width: 128 }}
            />
        </Pressable>
    )
}

function OutOfCardsView(props: Readonly<PressableProps>) {
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
            <LocalizedText
                id="out_of_cards"
                style={{
                    textAlign: 'center',
                    color: Colors[useColorScheme()].secondaryText,
                }}
            />
        </Pressable>
    )
}
