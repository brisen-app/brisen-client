import Colors from '@/src/constants/Colors'
import Color from '@/src/models/Color'
import { useQueryClient } from '@tanstack/react-query'
import { SplashScreen } from 'expo-router'
import { useEffect } from 'react'
import { Text, TouchableOpacity, ViewProps } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export type ErrorViewProps = {
  errors: Error[]
} & ViewProps

export default function FetchErrorView(props: Readonly<ErrorViewProps>) {
  const { errors, style } = props
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
          backgroundColor: Colors.background,
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
        }}
      >
        Ooops...
      </Text>

      {errors.map(error => (
        <Text
          key={error.message}
          style={{
            textAlign: 'center',
            color: Colors.secondaryText,
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
          backgroundColor: Colors.accentColor,
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
