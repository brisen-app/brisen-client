import Colors from '@/constants/Colors'
import { Pack, PackManager } from '@/lib/PackManager'
import Color from '@/models/Color'
import { MaterialIcons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Image, ImageProps } from 'expo-image'
import { useCallback } from 'react'
import {
  ActivityIndicator,
  DimensionValue,
  Pressable,
  PressableProps,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import { useAppContext, useAppDispatchContext } from '../utils/AppContextProvider'
import Placeholder from '../utils/Placeholder'
import { Text } from '../utils/Themed'
import useColorScheme from '../utils/useColorScheme'

export type PackViewProps = {
  pack: Pack
}

export type PackListViewProps = {
  hideImage?: boolean
}

const height: DimensionValue = 80

export default function PackListView(props: Readonly<PackListViewProps & PackViewProps & ViewProps>) {
  const { pack, hideImage, style } = props
  const colorScheme = useColorScheme()
  const { playlist } = useAppContext()
  const setContext = useAppDispatchContext()
  const isSelected = playlist.has(pack)

  const { data: image, isLoading, error } = useQuery(PackManager.getImageQuery(pack.image, !hideImage))
  if (error) console.warn(error)

  const PackImage = useCallback((props: ImageProps) => <Image {...props} source={image} transition={256} />, [image])

  if (isLoading) return <PackListViewPlaceholder hideImage={hideImage} {...props} />

  return (
    <View
      {...props}
      style={[
        {
          height: height,
          borderRadius: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {!hideImage && (
          <PackImage
            style={{
              aspectRatio: 1,
              height: '100%',
              borderRadius: 16,
              borderColor: Colors[colorScheme].stroke,
              borderWidth: StyleSheet.hairlineWidth,
            }}
          />
        )}

        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={[styles.text, styles.header]}>
            {pack.name}
          </Text>

          <Text numberOfLines={2} style={{ ...styles.text, color: Colors[colorScheme].secondaryText }}>
            {pack.description ? pack.description : pack.cards.size + ' cards'}
          </Text>
        </View>
      </TouchableOpacity>

      <Switch
        value={isSelected}
        onValueChange={() => setContext({ type: 'togglePack', payload: pack })}
        trackColor={{ false: Colors[colorScheme].placeholder, true: Colors[colorScheme].accentColor }}
        thumbColor={Colors[colorScheme].background}
      />
    </View>
  )
}

export function PackListViewPlaceholder(props: PackListViewProps & PressableProps) {
  const { hideImage } = props
  const colorScheme = useColorScheme()
  return (
    <Pressable
      style={{
        height: height,
        borderRadius: 16,
      }}
      {...props}
      onPress={() => {}}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {!hideImage && (
          <View
            style={{
              aspectRatio: 1,
              height: '100%',
              borderRadius: 16,
              borderColor: Colors[colorScheme].stroke,
              borderWidth: StyleSheet.hairlineWidth,
              justifyContent: 'center',
              backgroundColor: Color.white.alpha(0.05).string,
            }}
          >
            <ActivityIndicator color={Colors[colorScheme].secondaryText} />
          </View>
        )}

        <View style={{ flex: 1, gap: 4, justifyContent: 'center' }}>
          <Placeholder width='25%' height={18} />
          <Placeholder width='75%' height={18} />
        </View>
        <MaterialIcons size={28} name={'more-horiz'} color={Colors[colorScheme].placeholder} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  text: {
    userSelect: 'none',
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})
