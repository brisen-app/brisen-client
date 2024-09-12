import React, { useEffect } from 'react'
import { ActivityIndicator, Alert, TouchableOpacity, View } from 'react-native'
import Purchases, { PurchasesOfferings } from 'react-native-purchases'
import RevenueCatUI from 'react-native-purchases-ui'
import Colors from '../constants/Colors'
import { AntDesign } from '@expo/vector-icons'

export type StoreViewProps = {
  dismiss: () => void
}

export default function StoreView(props: Readonly<StoreViewProps>) {
  const { dismiss } = props
  const [offerings, setOfferings] = React.useState<PurchasesOfferings | undefined>(undefined)

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

  // If you need to display a specific offering:
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
          // Optional listener. Called when a restore has been completed.
          // This may be called even if no entitlements have been granted.
        }}
        onDismiss={() => {
          // Dismiss the paywall, i.e. remove the view, navigate to another screen, etc.
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        ></View>
      </RevenueCatUI.PaywallFooterContainerView>

      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 0,
          padding: 16,
        }}
        onPress={dismiss}
      >
        <AntDesign name='close' size={28} color={Colors.accentColor} />
      </TouchableOpacity>
    </>
  )
}
