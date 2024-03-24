import { ActivityIndicator, Dimensions, View } from 'react-native'
import { Text } from './Themed'
import { useQuery } from '@tanstack/react-query'
import { FlatList } from 'react-native-gesture-handler'
import React from 'react'
import { SupabaseEntity, SupabaseEntityManager } from '@/lib/supabase'
import { PackManager, Pack } from '@/lib/PackManager'
import PackListView from '../pack/PackListView'
import PackFeaturedView from '../pack/PackFeaturedView'

function partition<T>(items: T[], size: number): T[][] {
    let p: T[][] = []
    for (let i = 0; i < items.length; i += size) {
        p.push(items.slice(i, i + size))
    }
    return p
}

export default function GridContainer(
    props: Readonly<{
        query: ReturnType<typeof SupabaseEntityManager.getFetchAllQuery>
        itemsPerRow?: number
        style?: 'list' | 'card'
    }>
) {
    const { query, itemsPerRow = 3, style = 'list' } = props

    // Todo: Implement pagination
    const { data, isLoading, error } = useQuery(query)

    function itemView(item: SupabaseEntity) {
        if (PackManager.isPack(item))
            return style == 'list' ? (
                <PackListView pack={item} key={item.id} />
            ) : (
                <PackFeaturedView pack={item} key={item.id} />
            )
        return <Text>Unknown item type</Text>
    }

    if (error) return <Text>Error: {error.message}</Text>

    const itemWidth = Dimensions.get('window').width - 16 * 2
    const enableScroll = (data?.length ?? 0) > itemsPerRow

    if (isLoading) return <ActivityIndicator />

    return (
        <FlatList
            style={{ flexGrow: 0, overflow: 'visible' }}
            showsHorizontalScrollIndicator={false}
            horizontal
            scrollEnabled={enableScroll}
            snapToInterval={itemWidth + 8}
            decelerationRate={'fast'}
            // initialNumToRender={itemsPerRow * 2}
            // maxToRenderPerBatch={itemsPerRow * 3}
            ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
            data={partition(data ?? [], itemsPerRow)}
            renderItem={({ item: items }) => (
                <View style={{ width: itemWidth, gap: 8 }}>
                    {items.map(
                        (item) => itemView(item)
                        // <PackListView pack={item} />
                    )}
                </View>
            )}
        />
    )
}
