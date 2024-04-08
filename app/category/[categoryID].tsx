import { Text } from '@/components/utils/Themed'
import useColorScheme from '@/components/utils/useColorScheme'
import { useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'

export default function CategoryView() {
    const colorScheme = useColorScheme()
    const { categoryID } = useLocalSearchParams()

    return (
        <View>
            <Text>{categoryID}</Text>
        </View>
    )
}
