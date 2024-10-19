import { useQueryClient } from '@tanstack/react-query'
import { ColorValue, Text, TouchableOpacity, View } from 'react-native'
import Colors from '../constants/Colors'
import { FontStyles } from '../constants/Styles'
import env from '../lib/env'
import { useInAppPurchaseContext } from '../providers/InAppPurchaseProvider'
import { LanguageManager } from '../managers/LanguageManager'

export default function DevMenu() {
  const { userId } = useInAppPurchaseContext()
  const queryClient = useQueryClient()
  const language = LanguageManager.getDisplayLanguage()
  const { isProd, environment } = env

  if (isProd) return null

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
      }}
    >
      <Text style={[{ paddingBottom: 8 }, FontStyles.Header]}>Dev Menu</Text>
      <InfoRow title='Environment:' value={environment} />
      <InfoRow title='Language:' value={`${language.icon} ${language.name} (${language.id})`} />
      <InfoRow title='RevenueCat ID:' value={userId} />
      <View />
      <Text style={[{ paddingBottom: 8 }, FontStyles.Title]}>Tools</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        <FunctionButton title='Invalidates queries' onPress={() => queryClient.invalidateQueries()} />
      </View>
    </View>
  )
}

function InfoRow(props: Readonly<{ title: string; value?: string }>) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
      <Text style={{ color: Colors.text }}>{props.title}</Text>
      <Text style={{ maxWidth: '66%', color: Colors.secondaryText, textAlign: 'right' }}>{props.value ?? 'N/A'}</Text>
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
