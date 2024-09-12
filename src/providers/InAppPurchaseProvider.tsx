import { ConfigurationManager } from '@/src/managers/ConfigurationManager'
import { Dispatch, ReactNode, createContext, useContext, useEffect, useReducer } from 'react'
import { Modal, Platform } from 'react-native'
import Purchases, { CustomerInfo } from 'react-native-purchases'
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

  Purchases.getCustomerInfo()
    .then(customerInfo => {
      setContext({ action: 'setCustomerInfo', payload: customerInfo })
      Purchases.addCustomerInfoUpdateListener(customerInfo => {
        setContext({ action: 'setCustomerInfo', payload: customerInfo })
      })
    })
    .catch(console.error)
}

type InAppPurchaseContextType = {
  customerInfo: CustomerInfo | undefined
  showStore: boolean
  product: Pack | undefined
}

type InAppPurchaseContextActionType =
  | { action: 'hideStore' }
  | { action: 'displayStore'; payload: Pack }
  | { action: 'setCustomerInfo'; payload: CustomerInfo }

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
      return { ...state, customerInfo: payload }
    }

    default:
      throw new Error(`Unhandled action type: '${type}'`)
  }
}

const InAppPurchaseContext = createContext<InAppPurchaseContextType | undefined>(undefined)
const InAppPurchaseDispatchContext = createContext<Dispatch<InAppPurchaseContextActionType> | undefined>(undefined)

export function useInAppPurchaseContext() {
  const context = useContext(InAppPurchaseContext)
  if (!context) throw new Error('useInAppPurchaseContext must be used within an InAppPurchaseContext')

  if (!context?.customerInfo) {
    console.info('Customer info not fetched')
    return { isSubscribed: false }
  }

  const brisenPlusId = ConfigurationManager.get('brisen_plus_id')?.string
  if (!brisenPlusId) console.warn('Missing Brisen Plus ID')
  const brisenPlusEntitlement = !brisenPlusId ? undefined : context.customerInfo.entitlements.active[brisenPlusId]

  return {
    isSubscribed: brisenPlusEntitlement?.isActive === true,
  }
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
    showStore: false,
    product: undefined,
  })

  useEffect(() => {
    initInAppPurchases(setContext)
  }, [])

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
