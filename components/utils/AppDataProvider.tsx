import { CategoryManager } from '@/lib/CategoryManager'
import { LocalizationManager } from '@/lib/LocalizationManager'
import { useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { ActivityIndicator, View } from 'react-native'
import useColorScheme from './useColorScheme'
import Colors from '@/constants/Colors'

export default function AppDataProvider(props: Readonly<{ children: ReactNode }>) {
    const colorScheme = useColorScheme()

    const { isLoading: isLoadingCategories, error: errorCategories } = useQuery({
        queryKey: [CategoryManager.tableName],
        queryFn: async () => {
            return await CategoryManager.fetchAll()
        }
    })
    if (errorCategories) console.warn(errorCategories)

    const { isLoading: isLoadingLocalizations, error: errorLocalizations } = useQuery({
        queryKey: [LocalizationManager.tableName],
        queryFn: async () => {
            return await LocalizationManager.fetchAll()
        },
        enabled: true
    })
    if (errorLocalizations) console.warn(errorLocalizations)

    if (isLoadingCategories || isLoadingLocalizations)
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
