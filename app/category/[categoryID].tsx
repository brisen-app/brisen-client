import { Text } from '@/components/utils/Themed'
import useColorScheme from '@/components/utils/useColorScheme'
import { CategoryManager } from '@/lib/CategoryManager'
import { LocalizationManager } from '@/lib/LocalizationManager'
import { useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'

export default function CategoryView() {
    const colorScheme = useColorScheme()
    const { categoryID } = useLocalSearchParams()

    const category = CategoryManager.get(categoryID as string)
    const title = LocalizationManager.get(CategoryManager.getTitleLocaleKey(category))?.value
    const description = LocalizationManager.get(CategoryManager.getDescLocaleKey(category))?.value

    return (
        <View>
            <Text>{title}</Text>
            <Text>{description}</Text>
        </View>
    )
}
