import { AntDesign } from '@expo/vector-icons'
import { BottomSheetScrollView, BottomSheetTextInput, useBottomSheet } from '@gorhom/bottom-sheet'
import { Category, CategoryManager } from '@/managers/CategoryManager'
import { Dimensions, StyleSheet, View, ViewProps } from 'react-native'
import { FontStyles } from '@/constants/Styles'
import { formatName as prettifyString } from '@/lib/utils'
import { LocalizationManager } from '@/managers/LocalizationManager'
import { PackManager } from '@/managers/PackManager'
import { Text } from './utils/Themed'
import { useAppContext, useAppDispatchContext } from '../providers/AppContextProvider'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  Easing,
  FadeInUp,
  interpolate,
  interpolateColor,
  LinearTransition,
  useAnimatedStyle,
  ZoomOut,
} from 'react-native-reanimated'
import Colors from '@/constants/Colors'
import PackPosterView from './pack/PackPosterView'
import React, { useMemo, useState } from 'react'
import Tag from './utils/Tag'
import useColorScheme from './utils/useColorScheme'

export default function MenuView() {
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const bottomSheet = useBottomSheet()

  const { players, categoryFilter } = useAppContext()
  const setContext = useAppDispatchContext()

  const sortedPlayers = useMemo(() => [...players].sort((a, b) => a.name.localeCompare(b.name)), [players])
  const sortedCategories = useMemo(() => CategoryManager.items, [CategoryManager.items])

  const onPressCategory = (category: Category) => {
    setContext({ action: 'toggleCategory', payload: category })
  }

  const secondaryBackgroundColorStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      bottomSheet.animatedIndex.value,
      [2, 1],
      [Colors[colorScheme].secondaryBackground, Colors[colorScheme].background]
    ),
  }))

  const hideOnBottomStyle = useAnimatedStyle(() => ({
    opacity: interpolate(bottomSheet.animatedIndex.value, [0, 1], [0, 1]),
  }))

  return (
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
      style={{ flex: 1, overflow: 'visible', marginHorizontal: 16 }}
    >
      <AddPlayerField style={secondaryBackgroundColorStyle} />

      <Animated.View style={[{ gap: 8 }, hideOnBottomStyle]}>
        {players.size === 0 && (
          <Text style={FontStyles.Subheading}>
            {LocalizationManager.get('players_subtitle')?.value ?? 'players_subtitle'}
          </Text>
        )}
        {players.size > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {sortedPlayers.map(tag => (
              <Animated.View
                key={tag.name}
                layout={LinearTransition}
                entering={FadeInUp.easing(Easing.out(Easing.quad))}
                exiting={ZoomOut.easing(Easing.out(Easing.quad))}
              >
                <Tag
                  text={tag.name}
                  onPress={() => setContext({ action: 'togglePlayer', payload: tag })}
                  style={secondaryBackgroundColorStyle}
                />
              </Animated.View>
            ))}
          </View>
        )}

        <Header titleKey='packs' descriptionKey='packs_subtitle' />
        <PackSection />

        <Header titleKey='categories' descriptionKey='categories_subtitle' />
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {sortedCategories?.map(category => (
            <CategoryTag
              key={category.id}
              style={secondaryBackgroundColorStyle}
              category={category}
              isSelected={!categoryFilter.has(category.id)}
              onPress={onPressCategory}
            />
          ))}
        </View>

        <View style={{ height: insets.bottom ? insets.bottom : 16 + 8 }} />
      </Animated.View>
    </BottomSheetScrollView>
  )
}

function CategoryTag(
  props: Readonly<{ category: Category; isSelected: boolean; onPress: (category: Category) => void } & ViewProps>
) {
  const { category, isSelected, onPress, style } = props
  const title = CategoryManager.getTitle(category)

  return (
    <Tag
      {...props}
      text={category.icon + (title ? ` ${title}` : '')}
      style={[
        {
          opacity: isSelected ? 1 : 0.25,
        },
        style,
      ]}
      hideIcon
      onPress={() => onPress(category)}
    />
  )
}

export function Header(props: Readonly<{ titleKey?: string; descriptionKey?: string }>) {
  const { titleKey, descriptionKey } = props

  return (
    <View style={{ paddingTop: 16, gap: 4 }}>
      {titleKey && (
        <Text id={titleKey} style={FontStyles.Header}>
          {LocalizationManager.get(titleKey)?.value ?? titleKey}
        </Text>
      )}

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
    <View style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 16 }} {...props}>
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
    <Animated.View
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
    </Animated.View>
  )
}
