import { useLocalSearchParams } from 'expo-router'
import { Text } from '@/components/utils/Themed'
import { Pack } from '@/lib/PackManager'
import { View } from 'react-native'

export type PackViewProps = {
    pack: Pack
}

export default function PackView() {
    const { slug: packID } = useLocalSearchParams()

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'red' }}>
            <Text>{packID}</Text>
        </View>
    )
}
