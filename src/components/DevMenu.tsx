import { runtimeVersion } from '@/app.config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQueryClient } from '@tanstack/react-query'
import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application'
import { useState } from 'react'
import { ActivityIndicator, ColorValue, Text, TouchableOpacity, View } from 'react-native'
import Colors from '../constants/Colors'
import { appVersion } from '../constants/Constants'
import { FontStyles } from '../constants/Styles'
import env from '../lib/env'
import { LanguageManager } from '../managers/LanguageManager'
import { useInAppPurchaseContext } from '../providers/InAppPurchaseProvider'

export default function DevMenu() {
  const { userId, isSubscribed } = useInAppPurchaseContext()
  const queryClient = useQueryClient()
  const language = LanguageManager.getLanguage()
  const { environment } = env
  const [storage, setStorage] = useState<Awaited<ReturnType<typeof AsyncStorage.multiGet>> | null | undefined>(null)

  const readAsyncStorage = async () => {
    setStorage(undefined)
    const keys = await AsyncStorage.getAllKeys()
    if (!keys.length) {
      setStorage([])
      return
    }
    setStorage(await AsyncStorage.multiGet(keys))
  }

  if (environment === 'production') return undefined

  return (
    <View
      style={{
        justifyContent: 'center',
        borderColor: Colors.stroke,
        borderWidth: 4,
        borderRadius: 16,
        borderStyle: 'dashed',
        padding: 16,
        gap: 8,
        marginBottom: 64,
      }}
    >
      <Text style={[{ paddingBottom: 8 }, FontStyles.LargeTitle]}>Dev Menu</Text>
      <InfoRow title='Environment' value={environment} />
      <InfoRow title='Application version' value={nativeApplicationVersion ?? '-'} />
      <InfoRow title='Build version' value={nativeBuildVersion ?? '-'} />
      <InfoRow title='Bundle version' value={appVersion} />
      <InfoRow title='Runtime version' value={runtimeVersion} />
      <InfoRow title='Language' value={`${language.icon} ${language.name} (${language.id})`} />
      <InfoRow title='RevenueCat ID' value={userId} />
      <InfoRow title='Subscription status' value={isSubscribed ? 'Active' : 'Inactive'} />
      <View />
      <>
        <Text style={[{ paddingBottom: 8 }, FontStyles.Title]}>AsyncStorage</Text>
        {storage === undefined && <ActivityIndicator />}
        {storage === null && <Text style={{ color: Colors.secondaryText }}>Not read</Text>}
        {storage?.map(([key, value]) => (
          <InfoRow key={key} title={key} value={value ?? 'None'} />
        ))}
      </>
      <Text style={[{ paddingBottom: 8 }, FontStyles.Title]}>Tools</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        <FunctionButton title='Invalidates queries' onPress={() => queryClient.invalidateQueries()} />
        <FunctionButton title='Read AsyncStorage' onPress={() => readAsyncStorage()} />
        <FunctionButton
          title='Clear AsyncStorage'
          onPress={() => AsyncStorage.clear().then(() => readAsyncStorage())}
        />
      </View>
    </View>
  )
}

function InfoRow(props: Readonly<{ title: string; value?: string }>) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
      <Text style={{ color: Colors.text }}>{props.title}</Text>
      <Text numberOfLines={2} style={{ maxWidth: '66%', color: Colors.secondaryText, textAlign: 'right' }}>
        {props.value ?? 'N/A'}
      </Text>
    </View>
  )
}

function FunctionButton(props: Readonly<{ title: string; color?: ColorValue; onPress: () => void }>) {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={{
        backgroundColor: props.color ?? Colors.accentColor,
        borderRadius: Number.MAX_SAFE_INTEGER,
        padding: 8,
        paddingHorizontal: 16,
      }}
    >
      <Text style={{ color: 'black', fontWeight: 'bold' }}>{props.title}</Text>
    </TouchableOpacity>
  )
}
