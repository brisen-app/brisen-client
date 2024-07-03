import { Text } from '@/components/utils/Themed'
import Colors from '@/constants/Colors'
import Color from '@/models/Color'
import { useQueryClient } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { SplashScreen } from 'expo-router'
import { useEffect } from 'react'
import { TouchableOpacity, ViewProps } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import useColorScheme from './utils/useColorScheme'

export type ErrorViewProps = {
  errors: Error[]
} & ViewProps

export default function FetchErrorView(props: Readonly<ErrorViewProps>) {
  const { errors, style } = props
  const colorScheme = useColorScheme()
  const queryClient = useQueryClient()

  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          padding: 16,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          backgroundColor: Colors[colorScheme].background,
        },
        style,
      ]}
      {...props}
    >
      <Text
        style={{
          fontSize: 48,
          fontWeight: '900',
          textAlign: 'center',
          marginTop: 16,
          // color: Colors[colorScheme].accentColor,
        }}
      >
        Ooops...
      </Text>

      {errors.map(error => (
        <Text
          key={error.message}
          style={{
            textAlign: 'center',
            color: Colors[colorScheme].secondaryText,
          }}
        >
          {error.message}
        </Text>
      ))}

      <TouchableOpacity
        onPress={() => queryClient.invalidateQueries()}
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 64,
          padding: 8,
          borderRadius: 8,
          backgroundColor: Colors[colorScheme].accentColor,
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            fontSize: 18,
            fontWeight: 'bold',
            color: Color.black.string,
          }}
        >
          Try again
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}
