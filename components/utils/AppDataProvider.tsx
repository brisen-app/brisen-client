import { CategoryManager } from '@/lib/CategoryManager'
import { LocalizationManager } from '@/lib/LocalizationManager'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { ActivityIndicator, Button, View } from 'react-native'
import useColorScheme from './useColorScheme'
import Colors from '@/constants/Colors'
import { LanguageManager } from '@/lib/LanguageManager'
import { PackManager } from '@/lib/PackManager'
import { CardManager } from '@/lib/CardManager'
import { Text } from './Themed'
import { CardRelationManager } from '@/lib/CardRelationManager'

export default function AppDataProvider(props: Readonly<{ children: ReactNode }>) {
    const colorScheme = useColorScheme()
    const queryClient = useQueryClient()

    const failedQueries = Array<string>()

    const {
        error: errorLanguages,
        isLoading: isLoadingLanguages,
        isFetched: hasFetchedLanguages,
    } = useQuery({
        queryKey: [LanguageManager.tableName],
        queryFn: async () => {
            return await LanguageManager.fetchAllOrRetrieve()
        },
    })
    if (errorLanguages) {
        failedQueries.push(LanguageManager.tableName)
        console.warn(errorLanguages)
    }

    const { error: errorCategories, isLoading: isLoadingCategories } = useQuery({
        queryKey: [CategoryManager.tableName],
        queryFn: async () => {
            return await CategoryManager.fetchAllOrRetrieve()
        },
    })
    if (errorCategories) {
        failedQueries.push(CategoryManager.tableName)
        console.warn(errorCategories)
    }

    const { error: errorPacks, isLoading: isLoadingPacks } = useQuery({
        queryKey: [PackManager.tableName],
        queryFn: async () => {
            return await PackManager.fetchAllOrRetrieve()
        },
    })
    if (errorPacks) {
        failedQueries.push(PackManager.tableName)
        console.warn(errorPacks)
    }

    const { error: errorCards, isLoading: isLoadingCards } = useQuery({
        queryKey: [CardManager.tableName],
        queryFn: async () => {
            return await CardManager.fetchAllOrRetrieve()
        },
    })
    if (errorCards) {
        failedQueries.push(CardManager.tableName)
        console.warn(errorCards)
    }

    const { error: errorCardRelations, isLoading: isLoadingCardRelations } = useQuery({
        queryKey: [CardRelationManager.tableName],
        queryFn: async () => {
            return await CardRelationManager.fetchAllOrRetrieve()
        },
    })
    if (errorCardRelations) {
        failedQueries.push(CardRelationManager.tableName)
        console.warn(errorCardRelations)
    }

    const { error: errorLocalizations, isLoading: isLoadingLocalizatons } = useQuery({
        queryKey: [LocalizationManager.tableName],
        queryFn: async () => {
            return await LocalizationManager.fetchAllOrRetrieve()
        },
        enabled: hasFetchedLanguages,
    })
    if (errorLocalizations) {
        failedQueries.push(LocalizationManager.tableName)
        console.warn(errorLocalizations)
    }

    if (isLoadingLanguages || isLoadingCategories || isLoadingPacks || isLoadingCards || isLoadingCardRelations || isLoadingLocalizatons)
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
    if (failedQueries.length > 0)
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: Colors[colorScheme].background,
                }}
            >
                <Text>Failed to fetch data</Text>
                <Button
                    title={'Retry'}
                    color={Colors[colorScheme].accentColor}
                    onPress={() =>
                        queryClient.refetchQueries({
                            queryKey: failedQueries,
                        })
                    }
                />
            </View>
        )

    return props.children
}
