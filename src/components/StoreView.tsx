import { AntDesign } from '@expo/vector-icons'
import React, { useEffect } from 'react'
import { ActivityIndicator, Alert, TouchableOpacity, View } from 'react-native'
import Purchases, { PurchasesOfferings } from 'react-native-purchases'
import RevenueCatUI from 'react-native-purchases-ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '../constants/Colors'
import { LocalizationManager } from '../managers/LocalizationManager'

export type StoreViewProps = {
  dismiss: () => void
}

export default function StoreView(props: Readonly<StoreViewProps>) {
  const { dismiss } = props
  const insets = useSafeAreaInsets()
  const [offerings, setOfferings] = React.useState<PurchasesOfferings | undefined>(undefined)

  const localizations = {
    purchase_complete_msg: LocalizationManager.get('purchase_complete_msg')?.value ?? 'purchase_complete_msg',
    purchase_complete_title: LocalizationManager.get('purchase_complete_title')?.value ?? 'purchase_complete_title',
    restore_completed_msg_fail:
      LocalizationManager.get('restore_completed_msg_fail')?.value ?? 'restore_completed_msg_fail',
    restore_completed_msg_success:
      LocalizationManager.get('restore_completed_msg_success')?.value ?? 'restore_completed_msg_success',
    restore_completed_title: LocalizationManager.get('restore_completed_title')?.value ?? 'restore_completed_title',
  }

  useEffect(() => {
    Purchases.getOfferings()
      .then(offerings => setOfferings(offerings))
      .catch(e => {
        console.error(e)
        Alert.alert('Alert Title', 'My Alert Msg')
        dismiss()
      })
  }, [])

  if (!offerings) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size='large' color={Colors.text} />
      </View>
    )
  }

  return (
    <>
      <RevenueCatUI.PaywallFooterContainerView
        style={{
          backgroundColor: Colors.secondaryBackground,
        }}
        options={{
          offering: offerings.current,
        }}
        onRestoreCompleted={({ customerInfo }) => {
          // This may be called even if no entitlements have been granted.
          console.log('restore completed', customerInfo)
          if (customerInfo.activeSubscriptions.length > 0) {
            Alert.alert(localizations.restore_completed_title, localizations.restore_completed_msg_success)
            dismiss()
          } else {
            Alert.alert(localizations.restore_completed_title, localizations.restore_completed_msg_fail)
          }
        }}
        onPurchaseCompleted={({ customerInfo, storeTransaction }) => {
          console.log('purchase completed', customerInfo, storeTransaction)
          Alert.alert(localizations.purchase_complete_title, localizations.purchase_complete_msg)
          dismiss()
        }}
        onDismiss={dismiss}
      ></RevenueCatUI.PaywallFooterContainerView>

      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 0,
          right: insets.right,
          padding: 16,
        }}
        onPress={dismiss}
      >
        <AntDesign name='close' size={28} color={Colors.accentColor} />
      </TouchableOpacity>
    </>
  )
}
