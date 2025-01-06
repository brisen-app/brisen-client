import { ConfigurationManager } from '@/src/managers/ConfigurationManager'
import { Dispatch, ReactNode, createContext, useContext, useEffect, useReducer } from 'react'
import { Alert, Platform } from 'react-native'
import Purchases, { CustomerInfo } from 'react-native-purchases'
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui'
import ActivityIndicatorView from '../components/ActivityIndicatorView'
import FetchErrorView from '../components/FetchErrorView'
import env from '../lib/env'
import { LocalizationManager } from '../managers/LocalizationManager'

function initInAppPurchases(setContext: Dispatch<InAppPurchaseContextActionType>) {
  Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG)
  const { rcAppleKey, rcGoogleKey } = env

  if (Platform.OS === 'ios') Purchases.configure({ apiKey: rcAppleKey })
  if (Platform.OS === 'android') Purchases.configure({ apiKey: rcGoogleKey })

  console.log('InAppPurchases initialized')

  Purchases.getCustomerInfo()
    .then(customerInfo => {
      console.log('Fethced customer info:', customerInfo.originalAppUserId)
      setContext({ action: 'setCustomerInfo', payload: customerInfo })
      Purchases.addCustomerInfoUpdateListener(customerInfo => {
        console.log('Recieved customer info update:', customerInfo.originalAppUserId)
        setContext({ action: 'setCustomerInfo', payload: customerInfo })
      })
    })
    .catch(e => {
      setContext({ action: 'setCustomerInfoError', payload: e })
      console.error(e)
    })
}

type InAppPurchaseContextType = {
  customerInfo?: CustomerInfo
  customerInfoError?: Error
}

type InAppPurchaseContextActionType =
  | { action: 'setCustomerInfo'; payload: CustomerInfo }
  | { action: 'setCustomerInfoError'; payload: Error }

function InAppPurchaseContextReducer(
  state: InAppPurchaseContextType,
  action: InAppPurchaseContextActionType
): InAppPurchaseContextType {
  const { action: type } = action

  switch (type) {
    case 'setCustomerInfo': {
      const { payload } = action
      return { ...state, customerInfo: payload, customerInfoError: undefined }
    }

    case 'setCustomerInfoError': {
      const { payload } = action
      return { ...state, customerInfoError: payload }
    }

    default:
      throw new Error(`Unhandled action type: '${type}'`)
  }
}

const InAppPurchaseContext = createContext<InAppPurchaseContextType | undefined>(undefined)
const InAppPurchaseDispatchContext = createContext<Dispatch<InAppPurchaseContextActionType> | undefined>(undefined)

const inAppContextCache = new Map<string, { userId?: string; managementURL?: string; isSubscribed: boolean }>()
export function useInAppPurchaseContext() {
  const context = useContext(InAppPurchaseContext)
  if (!context) throw new Error('useInAppPurchaseContext must be used within an InAppPurchaseContext')

  const cacheKey = JSON.stringify(context.customerInfo)
  if (inAppContextCache.has(cacheKey)) return inAppContextCache.get(cacheKey)!

  const value = {
    userId: context.customerInfo?.originalAppUserId,
    managementURL: context.customerInfo?.managementURL ?? undefined,
    isSubscribed: isSubscribed(context.customerInfo),
  }

  inAppContextCache.set(cacheKey, value)
  return value
}

function isSubscribed(customerInfo: CustomerInfo | undefined) {
  if (!customerInfo) return false

  const brisenPlusId = ConfigurationManager.getValue('brisen_plus_id')
  if (!brisenPlusId) return false

  const brisenPlusEntitlement = customerInfo.entitlements.active[brisenPlusId]
  const isSubscribed = brisenPlusEntitlement?.isActive === true
  console.log('Brisen+ subscription status:', isSubscribed ? 'Active' : 'Inactive')
  return isSubscribed
}

export async function presentPaywall() {
  try {
    const result = await RevenueCatUI.presentPaywall()

    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
        presentAlert('purchase_complete_title', 'purchase_complete_msg')
        break
      case PAYWALL_RESULT.RESTORED:
        console.log('Purchases restored')
        break
      case PAYWALL_RESULT.ERROR:
        presentAlert('error_alert_title', 'purchase_error_msg')
        break
      default:
        console.log('Purchase canceled')
        break
    }
  } catch (e) {
    console.error(e)
    if (!(e instanceof Error)) throw e
    const message = LocalizationManager.get('error_alert_title')?.value
    Alert.alert(
      LocalizationManager.get('error_alert_title')?.value ?? 'Error',
      message ? `${message}\n(${e.message})` : e.message
    )
  }
  return
  function presentAlert(titleKey: string, messageKey: string) {
    Alert.alert(
      LocalizationManager.get(titleKey)?.value ?? titleKey,
      LocalizationManager.get(messageKey)?.value ?? messageKey
    )
  }
}

export default function InAppPurchaseProvider(props: Readonly<{ children: ReactNode }>) {
  const [context, setContext] = useReducer(InAppPurchaseContextReducer, {
    customerInfo: undefined,
    customerInfoError: undefined,
  } as InAppPurchaseContextType)

  useEffect(() => {
    initInAppPurchases(setContext)
  }, [])

  if (context.customerInfoError)
    return <FetchErrorView errors={[context.customerInfoError]} onRetry={() => initInAppPurchases(setContext)} />

  if (!context.customerInfo) return <ActivityIndicatorView />

  return (
    <InAppPurchaseContext.Provider value={context}>
      <InAppPurchaseDispatchContext.Provider value={setContext}>{props.children}</InAppPurchaseDispatchContext.Provider>
    </InAppPurchaseContext.Provider>
  )
}
