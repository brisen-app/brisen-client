import { ConfigurationManager } from '@/src/managers/ConfigurationManager'
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import Purchases, { CustomerInfo } from 'react-native-purchases'

function initInAppPurchases(setCustomerInfo: Dispatch<SetStateAction<CustomerInfo | undefined>>) {
  const iosKey = process.env.EXPO_PUBLIC_RC_KEY_APPLE
  const androidKey = process.env.EXPO_PUBLIC_RC_KEY_GOOGLE

  Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG)

  if (!iosKey) throw new Error('Missing Apple API key')
  if (!androidKey) throw new Error('Missing Google API key')

  if (Platform.OS === 'ios') Purchases.configure({ apiKey: iosKey })
  if (Platform.OS === 'android') Purchases.configure({ apiKey: androidKey })

  Purchases.getCustomerInfo()
    .then(customerInfo => {
      setCustomerInfo(customerInfo)
      Purchases.addCustomerInfoUpdateListener(setCustomerInfo)
    })
    .catch(console.error)
}

const InAppPurchaseContext = createContext<CustomerInfo | undefined>(undefined)

export function useInAppPurchaseContext() {
  const customerInfo = useContext(InAppPurchaseContext)
  if (!customerInfo) {
    console.info('Customer info not fetched')
    return { isSubscribed: false }
  }

  const brisenPlusId = ConfigurationManager.get('brisen_plus_id')?.string
  if (!brisenPlusId) console.warn('Missing Brisen Plus ID')
  const brisenPlusEntitlement = !brisenPlusId ? undefined : customerInfo.entitlements.active[brisenPlusId]

  return {
    isSubscribed: brisenPlusEntitlement?.isActive === true,
  }
}

export default function InAppPurchaseProvider(props: Readonly<{ children: ReactNode }>) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | undefined>(undefined)

  useEffect(() => {
    initInAppPurchases(setCustomerInfo)
  }, [])

  if (!customerInfo) return null
  return <InAppPurchaseContext.Provider value={customerInfo}>{props.children}</InAppPurchaseContext.Provider>
}
