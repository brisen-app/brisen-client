import { ConfigurationManager } from '@/src/managers/ConfigurationManager'
import { Dispatch, ReactNode, createContext, useContext, useEffect, useReducer } from 'react'
import { Modal, Platform } from 'react-native'
import Purchases, { CustomerInfo } from 'react-native-purchases'
import ActivityIndicatorView from '../components/ActivityIndicatorView'
import FetchErrorView from '../components/FetchErrorView'
import StoreView from '../components/StoreView'
import { Pack } from '../managers/PackManager'

function initInAppPurchases(setContext: Dispatch<InAppPurchaseContextActionType>) {
  const iosKey = process.env.EXPO_PUBLIC_RC_KEY_APPLE
  const androidKey = process.env.EXPO_PUBLIC_RC_KEY_GOOGLE

  Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG)

  if (!iosKey) throw new Error('Missing Apple API key')
  if (!androidKey) throw new Error('Missing Google API key')

  if (Platform.OS === 'ios') Purchases.configure({ apiKey: iosKey })
  if (Platform.OS === 'android') Purchases.configure({ apiKey: androidKey })

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
  customerInfo: CustomerInfo | undefined
  customerInfoError: Error | undefined
  showStore: boolean
  product: Pack | undefined
}

type InAppPurchaseContextActionType =
  | { action: 'hideStore' }
  | { action: 'displayStore'; payload: Pack }
  | { action: 'setCustomerInfo'; payload: CustomerInfo }
  | { action: 'setCustomerInfoError'; payload: Error }

function InAppPurchaseContextReducer(state: InAppPurchaseContextType, action: InAppPurchaseContextActionType) {
  const { action: type } = action

  switch (type) {
    case 'hideStore': {
      return { ...state, showStore: false }
    }

    case 'displayStore': {
      const { payload } = action
      return { ...state, showStore: true, product: payload }
    }

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

  const brisenPlusId = ConfigurationManager.get('brisen_plus_id')?.string
  if (!brisenPlusId) {
    console.warn('Missing Brisen Plus ID')
    return false
  }

  const brisenPlusEntitlement = customerInfo.entitlements.active[brisenPlusId]
  const isSubscribed = brisenPlusEntitlement?.isActive === true
  console.log('Brisen+ subscription status:', isSubscribed ? 'Active' : 'Inactive')
  return isSubscribed
}

export function useInAppPurchaseDispatchContext() {
  const context = useContext(InAppPurchaseDispatchContext)
  if (!context) throw new Error('useInAppPurchaseDispatchContext must be used within an InAppPurchaseContext')
  return {
    hideStore: () => context({ action: 'hideStore' }),
    displayStore: (product: Pack) => context({ action: 'displayStore', payload: product }),
  }
}

export default function InAppPurchaseProvider(props: Readonly<{ children: ReactNode }>) {
  const [context, setContext] = useReducer(InAppPurchaseContextReducer, {
    customerInfo: undefined,
    customerInfoError: undefined,
    showStore: false,
    product: undefined,
  } as InAppPurchaseContextType)

  useEffect(() => {
    initInAppPurchases(setContext)
  }, [])

  if (context.customerInfoError)
    return <FetchErrorView errors={[context.customerInfoError]} onRetry={() => initInAppPurchases(setContext)} />

  if (!context.customerInfo) return <ActivityIndicatorView />

  return (
    <InAppPurchaseContext.Provider value={context}>
      <InAppPurchaseDispatchContext.Provider value={setContext}>
        <Modal
          animationType='slide'
          presentationStyle='pageSheet'
          statusBarTranslucent
          visible={context.showStore}
          onRequestClose={() => {
            setContext({ action: 'hideStore' })
          }}
        >
          <StoreView dismiss={() => setContext({ action: 'hideStore' })} />
        </Modal>
        {props.children}
      </InAppPurchaseDispatchContext.Provider>
    </InAppPurchaseContext.Provider>
  )
}
