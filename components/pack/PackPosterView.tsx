import Colors from '@/constants/Colors'
import { Pack, PackManager } from '@/managers/PackManager'
import { useQuery } from '@tanstack/react-query'
import { Image, ImageProps } from 'expo-image'
import { useCallback } from 'react'
import { DimensionValue, StyleSheet, View, ViewProps } from 'react-native'
import { useAppContext, useAppDispatchContext } from '../../providers/AppContextProvider'
import { Text } from '../utils/Themed'
import useColorScheme from '../utils/useColorScheme'
import { Styles } from '@/constants/Styles'

export type PackViewProps = {
  pack: Pack
}

export type PackPosterViewProps = {
  hideImage?: boolean
  width?: number
}

export default function PackPosterView(props: Readonly<PackPosterViewProps & PackViewProps & ViewProps>) {
  const { pack, hideImage, style } = props
  const colorScheme = useColorScheme()
  const { playlist } = useAppContext()
  const setContext = useAppDispatchContext()
  const isSelected = playlist.has(pack)
  const width = props.width ?? 256

  const { data: image, isLoading, error } = useQuery(PackManager.getImageQuery(pack.image, !hideImage))
  if (error) console.warn(error)

  const PackImage = useCallback((props: ImageProps) => <Image {...props} source={image} transition={256} />, [image])

  // if (isLoading) return <PackPosterViewPlaceholder hideImage={hideImage} {...props} />

  return (
    <View
      {...props}
      style={[
        {
          width: width,
          alignItems: 'center',
          gap: 8,
        },
        style,
      ]}
    >
      <View
        style={{
          flex: 1,
          // flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <PackImage
          style={{
            width: width,
            aspectRatio: 1,
            borderRadius: 16,
            borderColor: Colors[colorScheme].stroke,
            borderWidth: StyleSheet.hairlineWidth,
          }}
        />

        <View style={{ width: width }}>
          <Text numberOfLines={1} style={[styles.text, styles.header]}>
            {pack.name}
          </Text>

          <Text numberOfLines={2} style={{ ...styles.text, color: Colors[colorScheme].secondaryText }}>
            {pack.description ? pack.description : pack.cards.size + ' cards'}
          </Text>
        </View>
      </View>

      {/* <Switch
        value={isSelected}
        onValueChange={() => setContext({ type: 'togglePack', payload: pack })}
        trackColor={{ false: Colors[colorScheme].placeholder, true: Colors[colorScheme].accentColor }}
        thumbColor={Colors[colorScheme].background}
      /> */}
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    userSelect: 'none',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
  },
})
