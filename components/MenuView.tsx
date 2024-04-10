import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { FontStyles } from '@/constants/Styles'
import { formatName as prettifyString } from '@/lib/utils'
import { LocalizationManager } from '@/lib/LocalizationManager'
import { LocalizedText } from './utils/LocalizedText'
import { PackManager } from '@/lib/PackManager'
import { PlayerListContext } from './utils/AppContext'
import { ScrollView, StyleSheet, View, ViewProps } from 'react-native'
import { useContext, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Color from '@/types/Color'
import Colors from '@/constants/Colors'
import PackFeaturedView from './pack/PackFeaturedView'
import PackListView from './pack/PackListView'
import useColorScheme from './utils/useColorScheme'
import Tag from './utils/Tag'
import { Category, CategoryManager } from '@/lib/CategoryManager'

export default function MenuView() {
    const insets = useSafeAreaInsets()
    const { players, setPlayers } = useContext(PlayerListContext)
    const [categoryFilter, setCategoryFilter] = useState<Set<Category>>(new Set())
    const { data: categories, isLoading, error } = useQuery(CategoryManager.getFetchAllQuery())
    if (error) console.warn(error)

    const sortedPlayers = useMemo(() => [...players].sort((a, b) => a.localeCompare(b)), [players])
    const sortedCategories = useMemo(() => categories?.sort((a, b) => a.id.localeCompare(b.id)), [categories])

    const onPressPlayer = (player: string) => {
        setPlayers(new Set([...players].filter((p) => p !== player)))
    }

    const onPressCategory = (category: Category) => {
        if (categoryFilter.has(category)) categoryFilter.delete(category)
        else categoryFilter.add(category)
        setCategoryFilter(new Set(categoryFilter))
    }

    return (
        <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ rowGap: 8 }}>
            <AddPlayerField />
            {players.size > 0 && (
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginHorizontal: 16 }}>
                    {sortedPlayers.map((tag) => (
                        <Tag key={tag} text={tag} onPress={() => onPressPlayer(tag)} />
                    ))}
                </View>
            )}

            <Header titleKey="packs" descriptionKey="no_pack_selected_description" />
            <ScrollView
                horizontal
                contentContainerStyle={{ gap: 8 }}
                style={{ flexDirection: 'row', overflow: 'visible', marginHorizontal: 16, marginTop: 8 }}
            >
                {sortedCategories?.map((category) => (
                    <CategoryTag
                        key={category.id}
                        category={category}
                        isSelected={!categoryFilter.has(category)}
                        onPress={onPressCategory}
                    />
                ))}
            </ScrollView>
            <PackSection />
            <View style={{ height: insets.bottom ?? 16 }} />
        </BottomSheetScrollView>
    )
}

function CategoryTag(
    props: Readonly<{ category: Category; isSelected: boolean; onPress: (category: Category) => void }>
) {
    const { category, isSelected, onPress } = props
    const colorScheme = useColorScheme()

    const titleKey = CategoryManager.getTitleLocaleKey(category)
    const { data: categoryText, error } = useQuery(LocalizationManager.getFetchQuery(titleKey))
    if (error) console.warn(error)

    if (!categoryText) return null
    return (
        <Tag
            text={category.icon + ' ' + categoryText.value}
            style={{
                opacity: isSelected ? 1 : 0.25,
                backgroundColor: category.gradient?.[0] ?? Colors[colorScheme].accentColor,
            }}
            onPress={() => onPress(category)}
        />
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
