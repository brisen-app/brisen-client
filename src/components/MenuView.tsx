import Colors from '@/src/constants/Colors'
import { FontStyles, SHEET_HANDLE_HEIGHT } from '@/src/constants/Styles'
import { formatName as prettifyString } from '@/src/lib/utils'
import { Category, CategoryManager } from '@/src/managers/CategoryManager'
import { LocalizationManager } from '@/src/managers/LocalizationManager'
import { PackManager } from '@/src/managers/PackManager'
import { useInAppPurchaseContext } from '@/src/providers/InAppPurchaseProvider'
import { AntDesign, Feather } from '@expo/vector-icons'
import {
  BottomSheetScrollView,
  BottomSheetScrollViewMethods,
  BottomSheetTextInput,
  TouchableOpacity,
  useBottomSheet,
} from '@gorhom/bottom-sheet'
import * as Application from 'expo-application'
import * as Clipboard from 'expo-clipboard'
import { Image } from 'expo-image'
import { openSettings, openURL } from 'expo-linking'
import React, { useMemo, useRef } from 'react'
import {
  Alert,
  Dimensions,
  Keyboard,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInputSubmitEditingEventData,
  View,
  ViewProps,
} from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  Extrapolation,
  FadeInUp,
  LinearTransition,
  ZoomOut,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ConfigurationManager } from '../managers/ConfigurationManager'
import Color from '../models/Color'
import { useAppContext, useAppDispatchContext } from '../providers/AppContextProvider'
import DevMenu from './DevMenu'
import MenuHudView from './MenuHudView'
import PackPosterView from './pack/PackPosterView'
import ScrollToBottomButton from './utils/ScrollToBottomButton'
import Tag from './utils/Tag'

const SHEET_TRASITION_POINT = 0.25

export default function MenuView() {
  const insets = useSafeAreaInsets()
  const bottomSheet = useBottomSheet()
  const scrollViewRef = useRef<BottomSheetScrollViewMethods>(null)

  const { playlist, players, categoryFilter } = useAppContext()
  const setContext = useAppDispatchContext()
  const showCollapseButton = playlist.size > 0

  const closedSheetHeight = ConfigurationManager.get('bottom_sheet_min_position')?.number ?? 64

  const sortedPlayers = useMemo(() => [...players].sort((a, b) => a.name.localeCompare(b.name)), [players])
  const sortedCategories = useMemo(() => CategoryManager.items, [CategoryManager.items])

  const onPressCategory = (category: Category) => {
    setContext({ action: 'toggleCategory', payload: category })
  }

  const hideOnBottomStyle = useAnimatedStyle(() => ({
    opacity: interpolate(bottomSheet.animatedIndex.value, [0, SHEET_TRASITION_POINT], [0, 1]),
  }))

  const hudStyle = useAnimatedStyle(() => ({
    opacity: interpolate(bottomSheet.animatedIndex.value, [0, SHEET_TRASITION_POINT], [1, 0]),
    height: interpolate(
      bottomSheet.animatedIndex.value,
      [0, SHEET_TRASITION_POINT],
      [closedSheetHeight - SHEET_HANDLE_HEIGHT, 0],
      Extrapolation.CLAMP
    ),
  }))

  return (
    <>
      <MenuHudView style={hudStyle} />
      <BottomSheetScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
        style={{ flex: 1, overflow: 'visible', marginHorizontal: 16 }}
      >
        <Animated.View style={[{ gap: 8 }, hideOnBottomStyle]}>
          <Header titleKey='players' descriptionKey='players_subtitle' />
          <AddPlayerField />

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

          <View
            style={{
              borderColor: Colors.stroke,
              borderTopWidth: StyleSheet.hairlineWidth,
              marginVertical: 8,
            }}
          />

          <LinksView />
          <AppDetailsView />
          <DevMenu />

          <View style={{ height: insets.bottom ? insets.bottom : 16 + 8 }} />
        </Animated.View>
      </BottomSheetScrollView>
      {showCollapseButton && (
        <ScrollToBottomButton
          text='Start'
          onPress={() => {
            Keyboard.dismiss()
            scrollViewRef.current?.scrollTo({ y: 0, animated: true })
            bottomSheet.collapse()
          }}
        />
      )}
    </>
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

  const sortedPacks = useMemo(() => {
    if (isSubscribed || !packs) return packs
    const packList = [...packs]

    return packList.sort((a, b) => {
      if (a.is_free === b.is_free) return 0
      return a.is_free ? -1 : 1
    })
  }, [packs])

  if (!packs) return undefined
  return (
    <View style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 16 }} {...props}>
      {sortedPacks?.map(pack => (
        <View key={pack.id}>
          <PackPosterView width={(packWidth - 48) / 2} pack={pack} />
        </View>
      ))}
    </View>
  )
}

function AddPlayerField(props: Readonly<ViewProps>) {
  const { style } = props
  const { players } = useAppContext()
  const setContext = useAppDispatchContext()
  const textInputRef = useRef<TextInput>(null)

  const handleAddPlayer = (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    e.preventDefault()
    if (e.nativeEvent.text.trim().length === 0) return

    const formattedText = prettifyString(e.nativeEvent.text)
    if (new Set([...players].map(p => p.name)).has(formattedText)) console.warn('Player already exists')
    else setContext({ action: 'togglePlayer', payload: { name: formattedText, playCount: 0 } })
    textInputRef.current?.clear()
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
        ref={textInputRef}
        placeholder={LocalizationManager.get('add_players')?.value ?? 'add_players'}
        placeholderTextColor={Colors.secondaryText}
        returnKeyType='done'
        enablesReturnKeyAutomatically
        autoCapitalize='words'
        autoComplete='off'
        maxLength={32}
        inputMode='text'
        submitBehavior='submit'
        onSubmitEditing={handleAddPlayer}
        selectionColor={Colors.accentColor}
        style={{ flex: 1, fontSize: 18, color: Colors.text }}
      />
    </Animated.View>
  )
}

function LinksView(props: Readonly<ViewProps>) {
  const { managementURL, isSubscribed } = useInAppPurchaseContext()
  const { style, ...viewProps } = props
  const storeURL =
    Platform.select({
      ios: ConfigurationManager.get('app_store_url')?.string,
      android: ConfigurationManager.get('play_store_url')?.string,
    }) ?? undefined

  const onShare = async () => {
    const shareTitle = LocalizationManager.get('app_name')?.value ?? 'app_name'
    const shareMsg = LocalizationManager.get('share_message')?.value ?? 'share_message'
    await Share.share(
      {
        title: shareTitle,
        url: storeURL,
        message: `${shareMsg} ${storeURL}`,
      },
      {
        dialogTitle: shareTitle,
        subject: shareMsg,
        tintColor: Colors.accentColor,
      }
    )
  }

  const settings: {
    show?: boolean
    titleKey: string
    iconName: keyof typeof Feather.glyphMap
    onPress: () => {}
  }[] = [
    {
      show: !!managementURL && isSubscribed,
      titleKey: 'manage_subscriptions',
      iconName: 'arrow-up-right',
      onPress: () => openURL(managementURL!),
    },
    {
      show: Platform.OS === 'ios',
      titleKey: 'change_language',
      iconName: 'arrow-up-right',
      onPress: () => openSettings(),
    },
    {
      show: !!storeURL,
      titleKey: 'share_app',
      iconName: 'share',
      onPress: () => onShare(),
    },
  ]

  return (
    <View
      style={[{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', gap: 4 }, style]}
      {...viewProps}
    >
      {settings
        .filter(s => s.show !== false)
        .map(setting => (
          <TouchableOpacity
            key={setting.titleKey}
            onPress={setting.onPress}
            style={{
              alignItems: 'center',
              flexDirection: setting.iconName === 'arrow-up-right' ? 'row-reverse' : 'row',
              gap: 4,
            }}
          >
            <Feather name={setting.iconName} size={18} color={Colors.secondaryText} />
            <Text key={setting.titleKey} style={{ color: Colors.secondaryText, fontWeight: '500' }}>
              {LocalizationManager.get(setting.titleKey)?.value ?? setting.titleKey}
            </Text>
          </TouchableOpacity>
        ))}
    </View>
  )
}

function AppDetailsView() {
  const { userId } = useInAppPurchaseContext()
  const appVersion = Application.nativeApplicationVersion

  const iconSize = 48
  const fontSize = 12

  const appName = LocalizationManager.get('app_name')?.value ?? 'app_name'
  const copiedTitle = LocalizationManager.get('copied_to_clipboard')?.value ?? 'copied_to_clipboard'

  const handleLongPress = () => {
    Clipboard.setStringAsync(userId ?? '')
    Alert.alert(copiedTitle, userId ?? '')
  }

  return (
    <Pressable style={{ alignItems: 'center', gap: 2 }} onLongPress={handleLongPress}>
      <Image
        source={require('../assets/images/app-icon/icon.png')}
        style={{ width: iconSize, aspectRatio: 1, borderRadius: iconSize / 4.4, marginVertical: 8 }}
      />
      <Text style={{ color: Colors.secondaryText, fontSize: fontSize }}>
        {appName} v{appVersion}
      </Text>
    </Pressable>
  )
}
