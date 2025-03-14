import Colors from '@/src/constants/Colors'
import { FontStyles, SHEET_HANDLE_HEIGHT } from '@/src/constants/Styles'
import { formatName as prettifyString, useSheetHeight } from '@/src/lib/utils'
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
import { Picker } from '@react-native-picker/picker'
import { useQueryClient } from '@tanstack/react-query'
import * as Device from 'expo-device'
import { Image } from 'expo-image'
import { openSettings, openURL } from 'expo-linking'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
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
  SlideInRight,
  SlideOutRight,
  ZoomOut,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { appVersion } from '../constants/Constants'
import { ConfigurationManager } from '../managers/ConfigurationManager'
import { LanguageManager } from '../managers/LanguageManager'
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
  const showCollapseButton = playlist.length > 0

  const closedSheetHeight = useSheetHeight() - SHEET_HANDLE_HEIGHT

  const sortedPlayers = useMemo(() => [...players].sort((a, b) => a.name.localeCompare(b.name)), [players])
  const sortedCategories = useMemo(() => CategoryManager.items, [CategoryManager.items])

  const onPressCategory = (category: Category) => {
    setContext({ action: 'toggleCategory', payload: category })
  }

  const hideOnBottomStyle = useAnimatedStyle(() => ({
    opacity: interpolate(bottomSheet.animatedIndex.value, [0, SHEET_TRASITION_POINT], [0, 1], Extrapolation.CLAMP),
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

          {players.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {sortedPlayers.map(tag => (
                <Animated.View
                  key={tag.name}
                  layout={LinearTransition}
                  entering={FadeInUp.easing(Easing.out(Easing.quad))}
                  exiting={ZoomOut.easing(Easing.out(Easing.quad))}
                >
                  <Tag text={tag.name} onPress={() => setContext({ action: 'removePlayer', payload: tag.name })} />
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
                isSelected={!categoryFilter.includes(category.id)}
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

          {Platform.OS === 'android' && !LanguageManager.isSfwLanguage() && <LanguageSelector />}

          <LinksView />
          <AppDetailsView />
          <DevMenu />

          <View style={{ height: insets.bottom ? insets.bottom : 16 + 8 }} />
        </Animated.View>
      </BottomSheetScrollView>
      {showCollapseButton && (
        <ScrollToBottomButton
          text={LocalizationManager.get('start_game')?.value ?? 'Start'}
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
  const windowWidth = Dimensions.get('window').width
  const packs = useMemo(() => PackManager.items, [PackManager.items])
  const [packsPerRow, setPacksPerRow] = useState(2)
  const { isSubscribed } = useInAppPurchaseContext()

  useEffect(() => {
    Device.getDeviceTypeAsync().then(deviceType => {
      if (deviceType === Device.DeviceType.TABLET) setPacksPerRow(3)
    })
  }, [])

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
          <PackPosterView width={(windowWidth - 32 - 16 * (packsPerRow - 1)) / packsPerRow} pack={pack} />
        </View>
      ))}
    </View>
  )
}

function AddPlayerField(props: Readonly<ViewProps>) {
  const { style } = props
  const { players } = useAppContext()
  const playerCount = players.length
  const setContext = useAppDispatchContext()
  const textInputRef = useRef<TextInput>(null)

  const handleAddPlayer = (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    e.preventDefault()
    const formattedText = prettifyString(e.nativeEvent.text)
    if (formattedText.length === 0) return
    setContext({ action: 'addPlayer', payload: formattedText })
    textInputRef.current?.clear()
  }

  const handleClearPlayers = () => setContext({ action: 'clearPlayers' })

  return (
    <Animated.View layout={LinearTransition} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <View
        {...props}
        style={[
          {
            flex: 1,
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
      </View>

      {playerCount > 0 && (
        <Animated.View entering={SlideInRight} exiting={SlideOutRight}>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.accentColor,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 8,
            }}
            onPress={handleClearPlayers}
          >
            <Text style={[FontStyles.Button, { color: Colors.background }]} numberOfLines={1}>
              {LocalizationManager.get('clear')?.value ?? 'Clear'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  )
}

function LinksView(props: Readonly<ViewProps>) {
  const { managementURL, isSubscribed } = useInAppPurchaseContext()
  const { style, ...viewProps } = props
  const storeURL =
    Platform.select({
      ios: ConfigurationManager.getValue('app_store_url'),
      android: ConfigurationManager.getValue('play_store_url'),
    }) ?? undefined

  const onShare = async () => {
    const shareTitle = LocalizationManager.get('app_name')?.value ?? 'app_name'
    const shareMsg = LocalizationManager.get('share_message')?.value ?? 'share_message'
    await Share.share(
      {
        title: shareTitle,
        url: storeURL,
        message: Platform.select({
          ios: shareMsg,
          default: `${shareMsg} ${storeURL}`,
        }),
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

  const iconSize = 48
  const fontSize = 12

  const handleLongPress = () => {
    if (!userId) return
    Share.share({ message: userId })
  }

  return (
    <Pressable style={{ alignItems: 'center', gap: 2 }} onLongPress={handleLongPress}>
      <Image
        source={require('../assets/images/app-icon/icon-ios.png')}
        style={{ width: iconSize, aspectRatio: 1, borderRadius: iconSize / 4.4, marginVertical: 8 }}
      />
      <Text style={{ color: Colors.secondaryText, fontSize: fontSize }}>v{appVersion}</Text>
    </Pressable>
  )
}

function LanguageSelector() {
  const queryClient = useQueryClient()

  const selectedLanguage = LanguageManager.getLanguage()
  const languages = LanguageManager.getAvailableLanguages()

  function handleLanguageChange(language: string) {
    console.log('Language changed to:', language)
    LanguageManager.setUserSelectedLanguage(language)
    queryClient.invalidateQueries()
  }

  return (
    <Picker
      dropdownIconColor={Colors.accentColor}
      selectedValue={selectedLanguage.id}
      onValueChange={handleLanguageChange}
      mode={Picker.MODE_DROPDOWN}
      placeholder='Select language'
    >
      {[...languages].map(language => (
        <Picker.Item
          style={{ backgroundColor: Colors.secondaryBackground }}
          key={language.id}
          label={`${language.icon} ${language.name}`}
          value={language.id}
          color={Colors.text}
        />
      ))}
    </Picker>
  )
}
