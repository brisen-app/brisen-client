import Colors from '@/src/constants/Colors'
import { Pack, PackManager } from '@/src/managers/PackManager'
import Color from '@/src/models/Color'
import { MaterialIcons } from '@expo/vector-icons'
import { Image, ImageProps } from 'expo-image'
import { useCallback } from 'react'
import {
  ActivityIndicator,
  DimensionValue,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'

export type PackViewProps = {
  pack: Pack
}

export type PackListViewProps = {
  hideImage?: boolean
}

const height: DimensionValue = 80

export default function PackListView(props: Readonly<PackListViewProps & PackViewProps & ViewProps>) {
  const { pack, hideImage, style } = props

  const { data: image, isLoading, error } = PackManager.useImageQuery(pack.image, !hideImage)
  if (error) console.warn(`Couldn't load image for pack ${pack.name}:`, error)

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
              borderColor: Colors.stroke,
              borderWidth: StyleSheet.hairlineWidth,
            }}
          />
        )}

        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={[styles.text, styles.header]}>
            {pack.name}
          </Text>

          <Text numberOfLines={2} style={{ ...styles.text, color: Colors.secondaryText }}>
            {pack.description ?? pack.cards.length + ' cards'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* <Switch
        value={isSelected}
        onValueChange={() => setContext({ action: 'togglePack', payload: pack })}
        trackColor={{ false: Colors.placeholder, true: Colors.accentColor }}
        thumbColor={Colors.background}
      /> */}
    </View>
  )
}

export function PackListViewPlaceholder(props: PackListViewProps & PressableProps) {
  const { hideImage } = props
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
              borderColor: Colors.stroke,
              borderWidth: StyleSheet.hairlineWidth,
              justifyContent: 'center',
              backgroundColor: Color.white.alpha(0.05).string,
            }}
          >
            <ActivityIndicator color={Colors.secondaryText} />
          </View>
        )}

        <View style={{ flex: 1, gap: 4, justifyContent: 'center' }} />
        <MaterialIcons size={28} name={'more-horiz'} color={Colors.placeholder} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  text: {
    color: Colors.text,
    userSelect: 'none',
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})
