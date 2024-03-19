import { StyleSheet, View, Dimensions, PressableProps, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { Text } from '../utils/Themed'
import Colors from '@/constants/Colors'
import Sizes from '@/constants/Sizes'
import useColorScheme from '../utils/useColorScheme'
import Color from '@/types/Color'
import { CardManager } from '@/lib/CardManager'
import { CategoryManager } from '@/lib/CategoryManager'
import { CardView } from './CardView'
import { CardLoadingView } from './CardLoadingView'

type CardProps = {
    cardID: string
}

export type CardScreenProps = CardProps & PressableProps

export default function CardScreen(props: Readonly<CardScreenProps>) {
    const { cardID, onPress } = props
    const colorScheme = useColorScheme()

    const padding = 16
    let insets = useSafeAreaInsets()
    insets = {
        top: insets.top ? insets.top : padding,
        bottom: insets.bottom ? insets.bottom : padding,
        left: insets.left ? insets.left : padding,
        right: insets.right ? insets.right : padding,
    }

    const { data: card, isLoading: isLoadingCard, error: errorCard } = useQuery(CardManager.getFetchQuery(cardID))

    const {
        data: category,
        isLoading: isLoadingCategory,
        error: errorCategory,
    } = useQuery({
        ...CategoryManager.getFetchQuery(card?.category),
        enabled: !!card?.category,
    })

    if (errorCategory) console.warn(errorCategory)

    if (errorCard) {
        console.warn(errorCard)
        // TODO: Show empty card
    }

    const isLoading = isLoadingCard || isLoadingCategory

    return (
        <Pressable
            onPress={onPress}
            style={{
                height: Dimensions.get('window').height,
                width: Dimensions.get('window').width,
                paddingBottom: insets.bottom + Sizes.big + Sizes.normal,
                paddingTop: insets.top,
                paddingLeft: insets.left,
                paddingRight: insets.right,
            }}
        >
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    borderRadius: 32,
                    // padding: 32,
                    backgroundColor: Colors[colorScheme].contentBackground,
                    borderColor: Colors[colorScheme].stroke,
                    borderWidth: Sizes.thin,
                }}
            >
                {isLoading ? (
                    <CardLoadingView />
                ) : !card ? (
                    <CardErrorView />
                ) : (
                    <CardView card={card} category={category} />
                )}
            </View>
        </Pressable>
    )
}

function CardErrorView() {
    // TODO: Make more user friendly
    return (
        <View>
            <Text style={{ fontSize: Sizes.big }}>🥵</Text>
        </View>
    )
}

export const styles = StyleSheet.create({
    shadow: {
        shadowColor: 'black',
        shadowOpacity: 0.5,
        shadowRadius: 1,
        shadowOffset: { width: 0, height: 1 },
    },
    text: {
        userSelect: 'none',
        textShadowColor: Color.black.alpha(0.5).string,
        textShadowRadius: 1,
        textShadowOffset: { width: 0, height: 1 },
        textAlign: 'center',
        color: Color.white.string,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: '900',
    },
    content: {
        fontSize: 28,
        fontWeight: '900',
    },
})
