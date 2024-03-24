import Colors from '@/constants/Colors'
import Sizes from '@/constants/Sizes'
import Color from '@/types/Color'
import { Image } from 'expo-image'
import { TouchableOpacity } from 'react-native-gesture-handler'
import useColorScheme from '../utils/useColorScheme'
import { useMemo } from 'react'
import { DimensionValue, TouchableOpacityProps, View } from 'react-native'
import { Text } from '../utils/Themed'
import { FontStyles, Styles } from '@/constants/Styles'

const users: {
    name: string
    username: string
    image?: string
}[] = [
    {
        name: 'Ole',
        username: 'mrkalle',
        image: `https://picsum.photos/seed/mrkalle/265`,
    },
    {
        name: 'Sondre',
        username: 'ikkelikelursomhanserutsom69',
        // image: `https://picsum.photos/seed/sond/265`,
    },
    {
        name: 'Johannes',
        username: 'sognnese',
        image: `https://picsum.photos/seed/sognnese/265`,
    },
]

export type UserQuickViewProps = {
    // user: {
    //     name: string
    //     username: string
    //     image?: string
    // }
    height?: DimensionValue
    showDetails?: boolean
} & TouchableOpacityProps

export default function UserQuickView(props: Readonly<UserQuickViewProps>) {
    const { height = 48, showDetails, style } = props
    const colorScheme = useColorScheme()

    const user = useMemo(() => {
        return users[Math.floor(Math.random() * users.length)]
    }, [])

    return (
        <TouchableOpacity
            onPress={() => {
                console.log(`User ${user.name} tapped`)
            }}
            style={[
                {
                    flexDirection: 'row',
                    height: height,
                    gap: 8,
                    ...Styles.shadow,
                },
                style,
            ]}
        >
            <View
                style={{
                    borderRadius: 1000,
                    overflow: 'hidden',
                    borderColor: Colors[colorScheme].stroke,
                    borderWidth: Sizes.thin,
                    backgroundColor: Color.white.alpha(0.25).string,
                }}
            >
                {user.image ? (
                    <Image
                        source={user.image}
                        style={{
                            flex: 1,
                            aspectRatio: 1,
                        }}
                    />
                ) : (
                    <View style={{ flex: 1, aspectRatio: 1 }} />
                )}
            </View>

            {showDetails && (
                <View style={{ justifyContent: 'center' }}>
                    <Text numberOfLines={1} lineBreakMode='tail' style={FontStyles.Title}>
                        {user.name}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={{
                            ...FontStyles.Subheading,
                            color: Colors[colorScheme].secondaryText,
                        }}
                    >
                        @{user.username}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    )
}
