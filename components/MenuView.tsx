import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { LocalizedText } from './utils/LocalizedText'
import { PackManager } from '@/lib/PackManager'
import { StyleSheet, View, ViewProps } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import PackFeaturedView from './pack/PackFeaturedView'
import PackListView from './pack/PackListView'
import Colors from '@/constants/Colors'
import useColorScheme from './utils/useColorScheme'
import { FontStyles } from '@/constants/Styles'
import { useContext, useMemo, useState } from 'react'
import { LocalizationManager } from '@/lib/LocalizationManager'
import Color from '@/types/Color'
import { PlayerListContext } from './utils/AppContext'
import TagList from './utils/TagList'
import { formatName as prettifyString } from '@/lib/utils'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'

export default function MenuView() {
    const insets = useSafeAreaInsets()
    const { players, setPlayers } = useContext(PlayerListContext)

    const sortedPlayers = useMemo(() => [...players].sort((a, b) => a.localeCompare(b)), [players])

    const onPressPlayer = (player: string) => {
        setPlayers(new Set([...players].filter((p) => p !== player)))
    }

    return (
        <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ rowGap: 8 }}>
            {/* <View style={{ height: insets.top ?? 16 }} /> */}
            <AddPlayerField />
            {players.size > 0 && (
                <TagList tags={sortedPlayers} onPress={onPressPlayer} style={{ marginHorizontal: 16 }} />
            )}

            <Header titleKey="packs" descriptionKey="no_pack_selected_description" />
            <PackSection />
            <View style={{ height: insets.bottom ?? 16 }} />
        </BottomSheetScrollView>
    )
}

function Header(props: Readonly<{ titleKey: string; descriptionKey?: string }>) {
    const { titleKey, descriptionKey } = props

    return (
        <View style={{ marginHorizontal: 16, paddingTop: 16 }}>
            <LocalizedText id={titleKey} style={FontStyles.Header} placeHolderStyle={{ height: 28, width: 128 }} />
            {descriptionKey && (
                <LocalizedText
                    id={descriptionKey}
                    style={FontStyles.Subheading}
                    placeHolderStyle={{ height: 28, width: 128 }}
                />
            )}
        </View>
    )
}

function PackSection(props: Readonly<ViewProps>) {
    const colorScheme = useColorScheme()

    const { data: packs, error } = useQuery(PackManager.getFetchAllQuery())
    if (error) console.warn(error)

    return (
        <View {...props}>
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
        </View>
    )
}

function AddPlayerField() {
    const colorScheme = useColorScheme()
    const [text, setText] = useState<string>('')
    const { players, setPlayers } = useContext(PlayerListContext)

    const { data: placeholderText, error } = useQuery(LocalizationManager.getFetchQuery('add_players'))
    if (error) console.warn(error)

    const handleAddPlayer = () => {
        if (text.trim().length === 0) return

        const formattedText = prettifyString(text)
        if (players.has(formattedText)) console.warn('Player already exists') // TODO: Show error message to user
        else setPlayers(new Set([...players, formattedText]))
        setText('')
    }

    return (
        <View
            style={{
                flexDirection: 'row',
                backgroundColor: Colors[colorScheme].background,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: Colors[colorScheme].stroke,
                alignItems: 'center',
                borderRadius: 12,
                padding: 8,
                marginHorizontal: 16,
                gap: 4,
            }}
        >
            <AntDesign name="plus" size={18} color={Color.brightness(1 / 3).string} />
            <BottomSheetTextInput
                value={text}
                onChangeText={setText}
                placeholder={placeholderText?.value ?? ''}
                keyboardAppearance={colorScheme}
                returnKeyType="done"
                enablesReturnKeyAutomatically
                autoCapitalize="words"
                autoComplete="off"
                maxLength={32}
                inputMode="text"
                blurOnSubmit={false}
                onSubmitEditing={handleAddPlayer}
                selectionColor={Colors[colorScheme].accentColor}
                style={{ flex: 1, fontSize: 18, color: Colors[colorScheme].text }}
            />
        </View>
    )
}
