import Colors from '@/constants/Colors'
import { FontStyles } from '@/constants/Styles'
import { formatName as prettifyString } from '@/lib/utils'
import { Category, CategoryManager } from '@/managers/CategoryManager'
import { LocalizationManager } from '@/managers/LocalizationManager'
import { PackManager } from '@/managers/PackManager'
import Color from '@/models/Color'
import { AntDesign } from '@expo/vector-icons'
import { BottomSheetScrollView, BottomSheetTextInput, useBottomSheet } from '@gorhom/bottom-sheet'
import { router } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { Dimensions, StyleSheet, View, ViewProps } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Animated, { interpolate, LinearTransition, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppContext, useAppDispatchContext } from '../providers/AppContextProvider'
import PackPosterView from './pack/PackPosterView'
import Tag from './utils/Tag'
import { Text } from './utils/Themed'
import useColorScheme from './utils/useColorScheme'

export default function MenuView() {
  const insets = useSafeAreaInsets()
  const bottomSheet = useBottomSheet()

  const { players, categoryFilter } = useAppContext()
  const setContext = useAppDispatchContext()

  const sortedPlayers = useMemo(() => [...players].sort((a, b) => a.name.localeCompare(b.name)), [players])
  const sortedCategories = useMemo(() => CategoryManager.items, [CategoryManager.items])

  const onPressCategory = (category: Category) => {
    setContext({ action: 'toggleCategory', payload: category })
  }

  const hideOnBottomStyle = useAnimatedStyle(() => ({
    opacity: interpolate(bottomSheet.animatedIndex.value, [0, 1], [0, 1]),
  }))

  return (
    <BottomSheetScrollView showsVerticalScrollIndicator={false} style={{ overflow: 'visible' }}>
      <AddPlayerField />

      <Animated.View style={[{ gap: 8 }, hideOnBottomStyle]}>
        {players.size > 0 && (
          <View style={{ flexDirection: 'row', marginTop: 8, gap: 8, flexWrap: 'wrap', marginHorizontal: 16 }}>
            {sortedPlayers.map(tag => (
              <Animated.View key={tag.name} layout={LinearTransition}>
                <Tag text={tag.name} onPress={() => setContext({ action: 'togglePlayer', payload: tag })} />
              </Animated.View>
            ))}
          </View>
        )}

        <Header titleKey='packs' descriptionKey='packs_subtitle' />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          style={{ flexDirection: 'row', overflow: 'visible', marginHorizontal: 16, marginTop: 8 }}
        >
          {sortedCategories?.map(category => (
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
      </Animated.View>
    </BottomSheetScrollView>
  )
}

function CategoryTag(
  props: Readonly<{ category: Category; isSelected: boolean; onPress: (category: Category) => void }>
) {
  const { category, isSelected, onPress } = props
  const title = CategoryManager.getTitle(category)

  return (
    <Tag
      text={category.icon + (title ? ` ${title}` : '')}
      style={{
        opacity: isSelected ? 1 : 0.25,
      }}
      hideIcon
      onPress={() => onPress(category)}
      onLongPress={() => router.navigate(`/category/${category.id}`)}
    />
  )
}

export function Header(props: Readonly<{ titleKey: string; descriptionKey?: string }>) {
  const { titleKey, descriptionKey } = props

  return (
    <View style={{ marginHorizontal: 16, paddingTop: 16, gap: 4 }}>
      <Text id={titleKey} style={FontStyles.Header}>
        {LocalizationManager.get(titleKey)?.value ?? titleKey}
      </Text>

      {descriptionKey && (
        <Text id={descriptionKey} style={FontStyles.Subheading}>
          {LocalizationManager.get(descriptionKey)?.value ?? descriptionKey}
        </Text>
      )}
    </View>
  )
}

function PackSection(props: Readonly<ViewProps>) {
  const packWidth = Dimensions.get('window').width
  const packs = useMemo(() => PackManager.items, [PackManager.items])

  return (
    <View style={{ flexWrap: 'wrap', flexDirection: 'row', marginHorizontal: 16, gap: 16 }} {...props}>
      {packs
        ? packs.map(pack => (
            <View key={pack.id}>
              <PackPosterView width={(packWidth - 48) / 2} pack={pack} />
            </View>
          ))
        : null}
    </View>
  )
}

function AddPlayerField(props: Readonly<ViewProps>) {
  const colorScheme = useColorScheme()
  const { style } = props
  const [text, setText] = useState<string>('')
  const { players } = useAppContext()
  const setContext = useAppDispatchContext()

  const handleAddPlayer = () => {
    if (text.trim().length === 0) return

    const formattedText = prettifyString(text)
    if (new Set([...players].map(p => p.name)).has(formattedText)) console.warn('Player already exists')
    else setContext({ action: 'togglePlayer', payload: { name: formattedText, playCount: 0 } })
    setText('')
  }

  return (
    <View
      {...props}
      style={[
        {
          flexDirection: 'row',
          backgroundColor: Colors[colorScheme].secondaryBackground,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: Colors[colorScheme].stroke,
          alignItems: 'center',
          borderRadius: 12,
          padding: 8,
          marginHorizontal: 16,
          gap: 4,
        },
        style,
      ]}
    >
      <AntDesign name='plus' size={18} color={Colors[colorScheme].secondaryText} />
      <BottomSheetTextInput
        value={text}
        onChangeText={setText}
        placeholder={LocalizationManager.get('add_players')?.value ?? 'add_players'}
        keyboardAppearance={colorScheme}
        returnKeyType='done'
        enablesReturnKeyAutomatically
        autoCapitalize='words'
        autoComplete='off'
        maxLength={32}
        inputMode='text'
        blurOnSubmit={false}
        onSubmitEditing={handleAddPlayer}
        selectionColor={Colors[colorScheme].accentColor}
        style={{ flex: 1, fontSize: 18, color: Colors[colorScheme].text }}
      />
    </View>
  )
}
