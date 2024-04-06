import { ScrollView, ScrollViewProps } from 'react-native'
import { Text } from './Themed'

export type TagListProps = {
    tags: string[]
}

export default function TagList(props: Readonly<TagListProps & ScrollViewProps>) {
    const { tags, style } = props

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[{ flexDirection: 'row', gap: 8 }, style]}
            {...props}
        >
            {tags.map((tag) => (
                <Text key={tag}>{tag}</Text>
            ))}
        </ScrollView>
    )
}
