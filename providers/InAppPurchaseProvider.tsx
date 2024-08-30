import { ReactNode, useEffect } from 'react'
import { Platform } from 'react-native'
import Purchases from 'react-native-purchases'

const apiKeys = {
  ios: process.env.EXPO_PUBLIC_RC_KEY_APPLE,
  android: process.env.EXPO_PUBLIC_RC_KEY_GOOGLE,
}

export default function InAppPurchaseProvider(props: Readonly<{ children: ReactNode }>) {
  useEffect(() => {
    if (!apiKeys.ios) throw new Error('Missing Apple API key')
    if (!apiKeys.android) throw new Error('Missing Google API key')

    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG)

    if (Platform.OS === 'ios') Purchases.configure({ apiKey: apiKeys.ios })
    if (Platform.OS === 'android') Purchases.configure({ apiKey: apiKeys.android })
  })

  return props.children
}
