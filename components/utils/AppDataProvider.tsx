import { CategoryManager } from '@/lib/CategoryManager'
import { LocalizationManager } from '@/lib/LocalizationManager'
import { useIsFetching, useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { ActivityIndicator, View } from 'react-native'
import useColorScheme from './useColorScheme'
import Colors from '@/constants/Colors'
import { LanguageManager } from '@/lib/LanguageManager'

export default function AppDataProvider(props: Readonly<{ children: ReactNode }>) {
    const colorScheme = useColorScheme()
    const isFetching = useIsFetching()

    const { error: errorLanguages, isFetched: isFetchedLanguages } = useQuery({
        queryKey: [LanguageManager.tableName],
        queryFn: async () => {
            return await LanguageManager.fetchAll()
        },
    })
    if (errorLanguages) console.warn(errorLanguages)

    const { error: errorCategories } = useQuery({
        queryKey: [CategoryManager.tableName],
        queryFn: async () => {
            return await CategoryManager.fetchAll()
        },
    })
    if (errorCategories) console.warn(errorCategories)

    const { error: errorLocalizations } = useQuery({
        queryKey: [LocalizationManager.tableName],
        queryFn: async () => {
            return await LocalizationManager.fetchAll()
        },
        enabled: isFetchedLanguages,
    })
    if (errorLocalizations) console.warn(errorLocalizations)

    if (isFetching)
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
