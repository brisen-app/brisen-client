import { createContext, Dispatch, ReactNode, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import Purchases, { CustomerInfo } from 'react-native-purchases'

const apiKeys = {
  ios: process.env.EXPO_PUBLIC_RC_KEY_APPLE,
  android: process.env.EXPO_PUBLIC_RC_KEY_GOOGLE,
}

export const InAppContext = createContext<CustomerInfo | undefined>(undefined)
export const InAppDispatchContext = createContext<Dispatch<CustomerInfo | undefined> | undefined>(undefined)

export function isSubscribed(customerInfo: CustomerInfo | undefined) {
  if (!customerInfo) return false
  return customerInfo.entitlements.active['no.kallerud.brisen.plus'].isActive
}

export default function InAppPurchaseProvider(props: Readonly<{ children: ReactNode }>) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | undefined>(undefined)

  useEffect(() => {
    if (!apiKeys.ios) throw new Error('Missing Apple API key')
    if (!apiKeys.android) throw new Error('Missing Google API key')

    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG)

    if (Platform.OS === 'ios') Purchases.configure({ apiKey: apiKeys.ios })
    if (Platform.OS === 'android') Purchases.configure({ apiKey: apiKeys.android })
  }, [])

  return (
    <InAppContext.Provider value={customerInfo}>
      <InAppDispatchContext.Provider value={setCustomerInfo}>{props.children}</InAppDispatchContext.Provider>
    </InAppContext.Provider>
  )
}
