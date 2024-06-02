import { AntDesign } from '@expo/vector-icons'
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { Category, CategoryManager } from '@/lib/CategoryManager'
import { FontStyles } from '@/constants/Styles'
import { formatName as prettifyString } from '@/lib/utils'
import { LocalizationManager } from '@/lib/LocalizationManager'
import { PackManager } from '@/lib/PackManager'
import { router } from 'expo-router'
import { ScrollView, StyleSheet, View, ViewProps } from 'react-native'
import { Text } from './utils/Themed'
import { useAppContext, useAppDispatchContext } from './utils/AppContextProvider'
import { useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Color from '@/models/Color'
import Colors from '@/constants/Colors'
import PackFeaturedView from './pack/PackFeaturedView'
import PackListView from './pack/PackListView'
import Tag from './utils/Tag'
import useColorScheme from './utils/useColorScheme'

export default function MenuView() {
  const insets = useSafeAreaInsets()

  const { players, categoryFilter } = useAppContext()
  const setContext = useAppDispatchContext()

  const sortedPlayers = useMemo(() => [...players].sort((a, b) => a.localeCompare(b)), [players])
  const sortedCategories = useMemo(() => CategoryManager.items, [CategoryManager.items])

  const onPressCategory = (category: Category) => {
    setContext({ type: 'toggleCategory', payload: category })
  }

  return (
    <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ rowGap: 8 }}>
      <AddPlayerField />
      {players.size > 0 && (
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginHorizontal: 16 }}>
          {sortedPlayers.map((tag) => (
            <Tag key={tag} text={tag} onPress={() => setContext({ type: 'togglePlayer', payload: tag })} />
          ))}
        </View>
      )}

      <Header titleKey="packs" descriptionKey="no_pack_selected_description" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
        style={{ flexDirection: 'row', overflow: 'visible', marginHorizontal: 16, marginTop: 8 }}
      >
        {sortedCategories?.map((category) => (
          <CategoryTag
            key={category.id}
            category={category}
            isSelected={!categoryFilter.has(category.id)}
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

  const title = CategoryManager.getTitle(category)

  return (
    <Tag
      text={category.icon + (title ? ` ${title}` : '')}
      style={{
        opacity: isSelected ? 1 : 0.25,
        backgroundColor: category.gradient?.[0] ?? Colors[colorScheme].accentColor,
      }}
      hideIcon
      onPress={() => onPress(category)}
      onLongPress={() => router.navigate(`/category/${category.id}`)}
    />
  )
}

function Header(props: Readonly<{ titleKey: string; descriptionKey?: string }>) {
  const { titleKey, descriptionKey } = props

  return (
    <View style={{ marginHorizontal: 16, paddingTop: 16 }}>
      <Text id={titleKey} style={FontStyles.Header}>
        {LocalizationManager.get(titleKey)?.value}
      </Text>
      {descriptionKey && (
        <Text id={descriptionKey} style={FontStyles.Subheading}>
          {LocalizationManager.get(descriptionKey)?.value}
        </Text>
      )}
    </View>
  )
}

function PackSection(props: Readonly<ViewProps>) {
  const colorScheme = useColorScheme()

  const packs = useMemo(() => PackManager.items, [PackManager.items])

  return (
    <View {...props}>
      {packs
        ? packs.map((pack, index) =>
            index === -1 ? (
              <PackFeaturedView key={pack.id} pack={pack} style={{ marginHorizontal: 16, marginBottom: 16 }} />
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
  const { players } = useAppContext()
  const setContext = useAppDispatchContext()

  const handleAddPlayer = () => {
    if (text.trim().length === 0) return

    const formattedText = prettifyString(text)
    if (players.has(formattedText)) console.warn('Player already exists') // TODO: [BUG] Show error message to user
    else setContext({ type: 'togglePlayer', payload: formattedText })
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
        placeholder={LocalizationManager.get('add_players')?.value ?? ''}
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
