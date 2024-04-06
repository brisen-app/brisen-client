import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { LocalizedText } from './utils/LocalizedText'
import { PackManager } from '@/lib/PackManager'
import { StyleSheet, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import PackFeaturedView from './pack/PackFeaturedView'
import PackListView from './pack/PackListView'
import Colors from '@/constants/Colors'
import useColorScheme from './utils/useColorScheme'
import { FontStyles } from '@/constants/Styles'
import { useState } from 'react'
import { LocalizationManager } from '@/lib/LocalizationManager'

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
    const [isAdding, setIsAdding] = useState(false)

    const addPlayersKey = 'add_players'
    const { data: placeHolderText, error } = useQuery(LocalizationManager.getFetchQuery(addPlayersKey))
    if (error) console.warn(error)

    const handleAddPlayer = () => {
        if (text.length > 0) {
            console.log('Adding player:', text)
            setText('')
        }
    }

    return (
        <BottomSheetTextInput
            value={text}
            onChangeText={setText}
            placeholder={placeHolderText?.value ?? addPlayersKey}
            keyboardAppearance={colorScheme}
            returnKeyType="done"
            enablesReturnKeyAutomatically
            autoCapitalize="words"
            autoComplete="off"
            maxLength={32}
            inputMode="text"
            blurOnSubmit={false}
            onSubmitEditing={handleAddPlayer}
            onFocus={() => setIsAdding(true)}
            onBlur={() => {
                setIsAdding(false)
                setText('')
            }}
            selectionColor={Colors[colorScheme].accentColor}
            placeholderTextColor={Colors[colorScheme].background}
            style={{
                backgroundColor: isAdding ? Colors[colorScheme].background : Colors[colorScheme].accentColor,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: Colors[colorScheme].stroke,
                borderRadius: 8,
                padding: 8,
                marginHorizontal: 16,
                fontSize: 16,
                color: Colors[colorScheme].text,
                textAlign: isAdding ? 'auto' : 'center',
                fontWeight: isAdding ? 'normal' : '600',
            }}
        />
    )
}
