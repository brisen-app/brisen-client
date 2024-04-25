import { CategoryManager } from '@/lib/CategoryManager'
import { LocalizationManager } from '@/lib/LocalizationManager'
import { useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { ActivityIndicator, View } from 'react-native'
import useColorScheme from './useColorScheme'
import Colors from '@/constants/Colors'
import { LanguageManager } from '@/lib/LanguageManager'

export default function AppDataProvider(props: Readonly<{ children: ReactNode }>) {
    const colorScheme = useColorScheme()

    const {
        error: errorLanguages,
        isLoading: isLoadingLanguages,
        isFetched: hasFetchedLanguages,
    } = useQuery({
        queryKey: [LanguageManager.tableName],
        queryFn: async () => {
            return await LanguageManager.fetchAll()
        },
    })
    if (errorLanguages) console.warn(errorLanguages)

    const { error: errorCategories, isLoading: isLoadingCategories } = useQuery({
        queryKey: [CategoryManager.tableName],
        queryFn: async () => {
            return await CategoryManager.fetchAll()
        },
    })
    if (errorCategories) console.warn(errorCategories)

    const { error: errorLocalizations, isLoading: isLoadingLocalizatons } = useQuery({
        queryKey: [LocalizationManager.tableName],
        queryFn: async () => {
            return await LocalizationManager.fetchAll()
        },
        enabled: hasFetchedLanguages,
    })
    if (errorLocalizations) console.warn(errorLocalizations)

    if (isLoadingLanguages || isLoadingCategories || isLoadingLocalizatons)
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
