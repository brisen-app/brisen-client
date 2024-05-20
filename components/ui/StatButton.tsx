import Colors from '@/constants/Colors'
import { Feather } from '@expo/vector-icons'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'
import useColorScheme from '../utils/useColorScheme'
import { Text } from '../utils/Themed'
import Color from '@/models/Color'

type ButtonProps = {
    icon: keyof typeof Feather.glyphMap
    label?: string
    size?: 'small' | 'large'
    isTapped?: boolean
}

export type StatButtonProps = ButtonProps & TouchableOpacityProps

export function StatButton(props: StatButtonProps) {
    const colorScheme = useColorScheme()
    const { icon, label, size, isTapped, style, ...touchableOpacityProps } = props

    const iconSize = size === 'small' ? 24 : 32
    const labelSize = size === 'small' ? 12 : 14

    const shadowColor = Color.black.alpha(0.25).string
    const shadowRadius = 1

    return (
        <TouchableOpacity
            onPress={() => {
                console.log(`${icon} tapped`)
            }}
            style={{
                alignItems: 'center',
                justifyContent: 'center',
                ...(style as object),
            }}
            {...touchableOpacityProps}
        >
            <Feather
                name={icon}
                size={iconSize}
                color={Colors[colorScheme].text}
                style={{
                    textShadowColor: shadowColor,
                    textShadowRadius: shadowRadius,
                    textShadowOffset: { width: 0, height: shadowRadius },
                }}
            />
            {label && (
                <Text
                    numberOfLines={1}
                    style={{
                        color: Colors[colorScheme].text,
                        fontSize: labelSize,
                        textAlign: 'center',
                        marginTop: 4,
                        textShadowColor: shadowColor,
                        textShadowRadius: shadowRadius,
                        textShadowOffset: { width: 0, height: shadowRadius },
                    }}
                >
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    )
}
