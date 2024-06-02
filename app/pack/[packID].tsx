import { Link, useLocalSearchParams } from 'expo-router'
import { Text } from '@/components/utils/Themed'
import { Pack, PackManager } from '@/lib/PackManager'
import { ActivityIndicator, TouchableOpacity, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import useColorScheme from '@/components/utils/useColorScheme'
import { LinearGradient } from 'expo-linear-gradient'
import Colors from '@/constants/Colors'
import { FontStyles, Styles } from '@/constants/Styles'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { LocalizationManager } from '@/lib/LocalizationManager'

export type PackViewProps = {
  pack: Pack
}

export default function PackView() {
  const colorScheme = useColorScheme()
  const { packID } = useLocalSearchParams()
  const { top } = useSafeAreaInsets()

  if (packID instanceof Array) throw new Error('packID is an array')

  const pack = PackManager.get(packID)

  const {
    data: image,
    isLoading: isLoadingImage,
    error: errorImage,
  } = useQuery(PackManager.getImageQuery(pack?.image, !!pack?.image))
  if (errorImage) console.warn(errorImage)

  if (isLoadingImage)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    )
  if (!pack) throw new Error('Pack not found')

  // TODO: [BUG] Add loading view skeleton for PackView

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: '50%' }}>
        <Image source={image} transition={256} style={Styles.absoluteFill} />

        <View style={[Styles.absoluteFill, { justifyContent: 'space-between' }]}>
          <LinearGradient
            colors={['transparent', Colors[colorScheme].background].reverse()}
            style={{ height: '25%', opacity: 0.75 }}
          />

          <LinearGradient colors={['transparent', Colors[colorScheme].background]} style={{ height: '33%' }} />
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            marginHorizontal: 16,
            marginTop: top ?? 16,
          }}
        >
          <Link href=".." asChild>
            <TouchableOpacity style={{ alignItems: 'flex-start' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 6,
                  paddingHorizontal: 8,
                  borderRadius: 32,
                  backgroundColor: Colors[colorScheme].background,
                }}
              >
                <MaterialIcons name="chevron-left" size={24} color={Colors[colorScheme].accentColor} />
                <Text style={{ paddingRight: 10, color: Colors[colorScheme].accentColor }}>
                  {LocalizationManager.get('back')?.value}
                </Text>
              </View>
            </TouchableOpacity>
          </Link>
          <Text style={[FontStyles.LargeTitle, Styles.shadow]}>{pack.name}</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ color: Colors[colorScheme].secondaryText }}>{pack?.description}</Text>
      </View>
    </View>
  )
}
