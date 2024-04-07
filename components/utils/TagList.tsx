import { TouchableOpacity, View, ViewProps } from 'react-native'
import { Text } from './Themed'
import Colors from '@/constants/Colors'
import useColorScheme from './useColorScheme'
import { MaterialIcons } from '@expo/vector-icons'
import { FontStyles } from '@/constants/Styles'

export type TagListProps = {
    tags: string[]
    onPress?: (tag: string) => void
}

export default function TagList(props: Readonly<TagListProps & ViewProps>) {
    const { tags, style, onPress } = props
    const colorScheme = useColorScheme()

    return (
        <View {...props} style={[{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }, style]}>
            {tags.map((tag) => (
                <TouchableOpacity
                    key={tag}
                    onPress={() => onPress?.(tag)}
                    style={{
                        flexDirection: 'row',
                        backgroundColor: Colors[colorScheme].background,
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 8,
                        alignItems: 'center',
                        overflow: 'hidden',
                        gap: 4,
                    }}
                >
                    <MaterialIcons name="close" size={16} color={Colors[colorScheme].secondaryText} />
                    <Text style={FontStyles.AccentuatedBody}>{tag}</Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}
