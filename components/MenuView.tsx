import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { LocalizedText } from './utils/LocalizedText'
import { PackManager } from '@/lib/PackManager'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import PackFeaturedView from './pack/PackFeaturedView'
import PackListView from './pack/PackListView'
import Colors from '@/constants/Colors'
import useColorScheme from './utils/useColorScheme'
import { FontStyles } from '@/constants/Styles'
import Color from '@/types/Color'
import { MaterialIcons } from '@expo/vector-icons'
import { useRef, useState } from 'react'

export default function MenuView() {
    const insets = useSafeAreaInsets()

    return (
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
            <View style={{ gap: 16 }}>
                <PlayerSection />
                <PackSection />
            </View>
            <View style={{ height: insets.bottom ?? 16 }} />
        </BottomSheetScrollView>
    )
}

function PackSection() {
    const colorScheme = useColorScheme()

    const { data: packs, error } = useQuery(PackManager.getFetchAllQuery())
    if (error) console.warn(error)

    return (
        <>
            <View style={{ marginHorizontal: 16, marginBottom: 8 }}>
                <LocalizedText id="packs" style={FontStyles.Header} placeHolderStyle={{ height: 28, width: 128 }} />
                <LocalizedText
                    id="no_pack_selected_description"
                    style={FontStyles.Subheading}
                    placeHolderStyle={{ height: 28, width: 128 }}
                />
            </View>

            {packs
                ? packs.map((pack, index) =>
                      index === -1 ? (
                          <PackFeaturedView
                              key={pack.id}
                              pack={pack}
                              style={{ marginHorizontal: 16, marginBottom: 16 }}
                          />
                      ) : (
                          <View key={pack.id}>
                              <PackListView pack={pack} style={{ height: 80, marginHorizontal: 16 }} />
                              {index < packs.length - 1 ? (
                                  <View
                                      style={{
                                          borderTopColor: Colors[colorScheme].stroke,
                                          borderTopWidth: StyleSheet.hairlineWidth,
                                          marginVertical: 8,
                                          marginLeft: 80 + 8 + 16,
                                      }}
                                  />
                              ) : null}
                          </View>
                      )
                  )
                : null}
        </>
    )
}

function PlayerSection() {
    const colorScheme = useColorScheme()
    const [text, setText] = useState('')

    return (
        <>
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    backgroundColor: Colors[colorScheme].accentColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 8,
                    padding: 8,
                    marginHorizontal: 16,
                    gap: 4,
                }}
            >
                <MaterialIcons name="add" size={24} color={Color.black.string} />
                <LocalizedText id="add_players" style={[{ color: Color.black.string }, FontStyles.Button]} />
            </TouchableOpacity>
            <BottomSheetTextInput
                value={text}
                onChangeText={setText}
                placeholder="Enter player name"
                keyboardAppearance={colorScheme}
                returnKeyType="done"
                enablesReturnKeyAutomatically
                autoCapitalize='words'
                autoComplete='off'
                maxLength={32}
                inputMode='text'
                style={{
                    backgroundColor: Colors[colorScheme].background,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: Colors[colorScheme].stroke,
                    borderRadius: 8,
                    padding: 8,
                    marginHorizontal: 16,
                    fontSize: 16,
                    color: Colors[colorScheme].text,
                }}
            />
        </>
    )
}
