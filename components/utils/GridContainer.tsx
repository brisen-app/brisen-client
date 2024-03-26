import { Dimensions, FlatListProps } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import React from 'react'

function partition<T>(items: T[] | null, size: number): T[][] {
    if (!items) return []
    let p: T[][] = []
    for (let i = 0; i < items.length; i += size) {
        p.push(items.slice(i, i + size))
    }
    return p
}

export type GridContainerProps<T> = {
    itemsPerRow?: number
} & FlatListProps<T>

export default function GridContainer<T>(props: Readonly<GridContainerProps<T>>) {
    const { itemsPerRow = 3, data } = props

    const itemWidth = Dimensions.get('window').width - 16 * 2
    const enableScroll = (data?.length ?? 0) > itemsPerRow

    return (
        <FlatList
            {...props}
            style={{ flexGrow: 0, overflow: 'visible' }}
            showsHorizontalScrollIndicator={false}
            horizontal
            scrollEnabled={enableScroll}
            snapToInterval={itemWidth + 8}
            decelerationRate={'fast'}
            // ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
            data={partition(data, itemsPerRow)}
        />
    )
}
