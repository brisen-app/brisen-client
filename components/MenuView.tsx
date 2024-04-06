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

export default function MenuView() {
    const insets = useSafeAreaInsets()
    const { players, setPlayers } = useContext(PlayerListContext)

    const sortedPlayers = useMemo(() => [...players].sort((a, b) => a.localeCompare(b)), [players])

    const onPressPlayer = (player: string) => {
        setPlayers(new Set([...players].filter((p) => p !== player)))
    }

    return (
        <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ rowGap: 8 }}>
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
    const [isAdding, setIsAdding] = useState(false)
    const { players, setPlayers } = useContext(PlayerListContext)

    const { data: buttonText, error: buttonError } = useQuery(LocalizationManager.getFetchQuery('add_players_button'))
    if (buttonError) console.warn(buttonError)

    const { data: placeholderText, error: placeholderError } = useQuery(
        LocalizationManager.getFetchQuery('add_players_placeholder')
    )
    if (placeholderError) console.warn(placeholderError)

    const handleAddPlayer = () => {
        if (text.trim().length === 0) return

        const formattedText = prettifyString(text)
        if (players.has(formattedText)) console.warn('Player already exists') // TODO: Show error message to user
        else setPlayers(new Set([...players, formattedText]))
        setText('')
    }

    return (
        <BottomSheetTextInput
            value={text}
            onChangeText={setText}
            placeholder={(isAdding ? placeholderText?.value : buttonText?.value) ?? ''}
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
            placeholderTextColor={
                isAdding ? Color.hex(Colors[colorScheme].text).alpha(1 / 3).string : Colors[colorScheme].background
            }
            style={{
                backgroundColor: isAdding ? Colors[colorScheme].background : Colors[colorScheme].accentColor,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: Colors[colorScheme].stroke,
                borderRadius: 8,
                padding: 12,
                marginHorizontal: 16,
                fontSize: 16,
                color: Colors[colorScheme].text,
                textAlign: isAdding ? 'auto' : 'center',
                fontWeight: isAdding ? 'normal' : '600',
            }}
        />
    )
}
