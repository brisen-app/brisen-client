import Colors from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import useColorScheme from "./useColorScheme";
import { Text } from "./Themed";

type ButtonProps = {
    icon: keyof typeof Feather.glyphMap
    label?: string
    size?: 'small' | 'large'
    isTapped?: boolean
};

export type StatButtonProps = ButtonProps & TouchableOpacityProps;

export function StatButton(props: StatButtonProps) {
    const colorScheme = useColorScheme()
    const { icon, label, size, isTapped, style, ...touchableOpacityProps } = props;

    const iconSize = size === 'small' ? 24 : 32
    const labelSize = size === 'small' ? 12 : 14

    return (
        <TouchableOpacity {...touchableOpacityProps} style={{
            alignItems: 'center',
            justifyContent: 'center',
            ...style as object
        }} >
            <Feather
                name={icon}
                size={iconSize}
                color={Colors[colorScheme].text
            } />
            { label &&
                <Text
                    numberOfLines={1}
                    style={{
                        color: Colors[colorScheme].text,
                        fontSize: labelSize,
                        textAlign: 'center',
                        marginTop: 4
                    }}
                >
                    {label}
                </Text>
            }
        </TouchableOpacity>
    )
}