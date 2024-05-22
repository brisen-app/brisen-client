import { CategoryManager } from '@/lib/CategoryManager'
import { LocalizationManager } from '@/lib/LocalizationManager'
import { useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { ActivityIndicator, View } from 'react-native'
import useColorScheme from './useColorScheme'
import Colors from '@/constants/Colors'
import { LanguageManager } from '@/lib/LanguageManager'
import { PackManager } from '@/lib/PackManager'
import { CardManager } from '@/lib/CardManager'
import { CardRelationManager } from '@/lib/CardRelationManager'
import SupabaseManager, { SupabaseItem } from '@/lib/SupabaseManager'

function useSupabase(manager: SupabaseManager<SupabaseItem>, enabled = true): boolean {
    var { data, error, isLoading, isPending, isFetched } = useQuery({
        queryKey: [manager.tableName],
        queryFn: async () => {
            return await manager.fetchAllOrRetrieve()
        },
        enabled: enabled,
    })
    if (error) console.warn(error)
    return !!data && !isLoading && !isPending && isFetched
}

export default function AppDataProvider(props: Readonly<{ children: ReactNode }>) {
    const colorScheme = useColorScheme()

    const hasFetchedLanguages = useSupabase(LanguageManager)
    const hasFetchedCategories = useSupabase(CategoryManager)
    const hasFetchedPacks = useSupabase(PackManager)
    const hasFetchedCards = useSupabase(CardManager)
    const hasFetchedCardRelations = useSupabase(CardRelationManager)
    const hasFetchedLocalizations = useSupabase(LocalizationManager, hasFetchedLanguages)

    if (
        !hasFetchedLanguages ||
        !hasFetchedCategories ||
        !hasFetchedPacks ||
        !hasFetchedCards ||
        !hasFetchedCardRelations ||
        !hasFetchedLocalizations
    )
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: Colors[colorScheme].background,
                }}
            >
                <ActivityIndicator size={'large'} color={Colors[colorScheme].secondaryText} />
            </View>
        )

    // TODO: Display error if any data is null

    return props.children
}
