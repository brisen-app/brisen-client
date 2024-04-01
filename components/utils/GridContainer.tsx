import { Dimensions, FlatListProps, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import React from 'react'

function partition<T>(items: ArrayLike<T> | undefined | null, size: number) {
    if (!items) return []
    let p: T[][] = []
    const itemsArray = Array.from(items)
    for (let i = 0; i < itemsArray.length; i += size) {
        p.push(itemsArray.slice(i, i + size))
    }
    return p
}

export type GridContainerProps<T extends { id: string }> = {
    itemsPerRow?: number
} & FlatListProps<T>

export default function GridContainer<T extends { id: string }>(props: Readonly<GridContainerProps<T>>) {
    const { itemsPerRow = 3, data, renderItem } = props

    const itemWidth = Dimensions.get('window').width - 16 * 2
    const enableScroll = (data?.length ?? 0) > itemsPerRow

    return (
        <FlatList
            style={{ overflow: 'visible' }}
            showsHorizontalScrollIndicator={false}
            horizontal
            scrollEnabled={enableScroll}
            snapToInterval={itemWidth + 8}
            decelerationRate={'fast'}
            contentContainerStyle={{ gap: 8 }}
            data={partition(data, itemsPerRow)}
            renderItem={({ item: items }) => (
                <View style={{ width: itemWidth, gap: 8 }}>
                    {items.map((item, index) => (
                        // @ts-ignore
                        <View key={item.id}>{renderItem ? renderItem({ item, index }) : null}</View>
                    ))}
                </View>
            )}
        />
    )
}
