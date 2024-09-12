import { AntDesign } from '@expo/vector-icons'
import { BottomSheetScrollView, BottomSheetTextInput, useBottomSheet } from '@gorhom/bottom-sheet'
import { Category, CategoryManager } from '@/src/managers/CategoryManager'
import { Dimensions, StyleSheet, Text, View, ViewProps } from 'react-native'
import { FontStyles } from '@/src/constants/Styles'
import { formatName as prettifyString } from '@/src/lib/utils'
import { LocalizationManager } from '@/src/managers/LocalizationManager'
import { PackManager } from '@/src/managers/PackManager'
import { useAppContext, useAppDispatchContext } from '../providers/AppContextProvider'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  Easing,
  FadeInUp,
  interpolate,
  LinearTransition,
  useAnimatedStyle,
  ZoomOut,
} from 'react-native-reanimated'
import Colors from '@/src/constants/Colors'
import PackPosterView from './pack/PackPosterView'
import React, { useMemo, useState } from 'react'
import Tag from './utils/Tag'
import { useInAppPurchaseContext } from '@/src/providers/InAppPurchaseProvider'
import Color from '../models/Color'

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
    <BottomSheetScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
      style={{ flex: 1, overflow: 'visible', marginHorizontal: 16 }}
    >
      <AddPlayerField />

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
                <Tag text={tag.name} onPress={() => setContext({ action: 'togglePlayer', payload: tag })} />
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
  const { isSubscribed } = useInAppPurchaseContext()
  const sortedPacks =
    useMemo(
      () => (isSubscribed ? packs : [...(packs ?? [])].sort((a, b) => (a.is_free === b.is_free ? 0 : -1))),
      [packs]
    ) ?? []

  if (!packs) return undefined
  return (
    <View style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 16 }} {...props}>
      {sortedPacks.map(pack => (
        <View key={pack.id}>
          <PackPosterView width={(packWidth - 48) / 2} pack={pack} />
        </View>
      ))}
    </View>
  )
}

function AddPlayerField(props: Readonly<ViewProps>) {
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
          backgroundColor: Color.hex(Colors.background).alpha(0.5).string,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: Colors.stroke,
          alignItems: 'center',
          borderRadius: 12,
          padding: 8,
          gap: 4,
        },
        style,
      ]}
    >
      <AntDesign name='plus' size={18} color={Colors.secondaryText} />
      <BottomSheetTextInput
        value={text}
        onChangeText={setText}
        placeholder={LocalizationManager.get('add_players')?.value ?? 'add_players'}
        placeholderTextColor={Colors.secondaryText}
        returnKeyType='done'
        enablesReturnKeyAutomatically
        autoCapitalize='words'
        autoComplete='off'
        maxLength={32}
        inputMode='text'
        blurOnSubmit={false}
        onSubmitEditing={handleAddPlayer}
        selectionColor={Colors.accentColor}
        style={{ flex: 1, fontSize: 18, color: Colors.text }}
      />
    </Animated.View>
  )
}
