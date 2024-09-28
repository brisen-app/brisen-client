import Colors from '@/src/constants/Colors'
import Color from '@/src/models/Color'
import { SplashScreen } from 'expo-router'
import { useEffect } from 'react'
import { GestureResponderEvent, Text, TouchableOpacity, ViewProps } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FontStyles } from '../constants/Styles'
import { LocalizationManager } from '../managers/LocalizationManager'

export type ErrorViewProps = {
  errors: Error[]
  onRetry?: (event: GestureResponderEvent) => void
} & ViewProps

export default function FetchErrorView(props: Readonly<ErrorViewProps>) {
  const { errors, onRetry, style } = props

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
      <Text style={FontStyles.LargeTitle}>{LocalizationManager.get('error_alert_title')?.value ?? 'Ooops...'}</Text>

      {errors.map(error => (
        <Text key={error.message} style={FontStyles.Subheading}>
          {error.message}
        </Text>
      ))}

      <TouchableOpacity
        onPress={onRetry}
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
          paddingHorizontal: 32,
          marginTop: 32,
          borderRadius: Number.MAX_SAFE_INTEGER,
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
