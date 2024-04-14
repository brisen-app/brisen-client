import { TouchableOpacity, TouchableOpacityProps } from 'react-native'
import { Text } from './Themed'
import Colors from '@/constants/Colors'
import useColorScheme from './useColorScheme'
import { MaterialIcons } from '@expo/vector-icons'
import { FontStyles } from '@/constants/Styles'

export type TagListProps = {
    text: string
    hideIcon?: boolean
} & TouchableOpacityProps

export default function Tag(props: Readonly<TagListProps>) {
    const { text, hideIcon, style } = props
    const colorScheme = useColorScheme()

    return (
        <TouchableOpacity
            {...props}
            style={[
                {
                    flexDirection: 'row',
                    backgroundColor: Colors[colorScheme].background,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    alignItems: 'center',
                    overflow: 'hidden',
                    gap: 4,
                },
                style,
            ]}
        >
            {!hideIcon ? <MaterialIcons name="close" size={16} color={Colors[colorScheme].secondaryText} /> : null}
            <Text style={[FontStyles.AccentuatedBody, { color: Colors[colorScheme].text }]}>{text}</Text>
        </TouchableOpacity>
    )
}
