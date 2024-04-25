import { Text } from '@/components/utils/Themed'
import { CategoryManager } from '@/lib/CategoryManager'
import { LocalizationManager } from '@/lib/LocalizationManager'
import { useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'

export default function CategoryView() {
    const { categoryID } = useLocalSearchParams()

    const category = CategoryManager.get(categoryID as string)
    const title = LocalizationManager.get(CategoryManager.getTitle(category))?.value
    const description = LocalizationManager.get(CategoryManager.getDescription(category))?.value

    return (
        <View>
            <Text>{title}</Text>
            <Text>{description}</Text>
        </View>
    )
}
