//#region Imports
import Colors from '@/src/constants/Colors'
import { FontStyles, SHEET_HANDLE_HEIGHT } from '@/src/constants/Styles'
import { formatName as prettifyString, useSheetBottomInset } from '@/src/lib/utils'
import { LocalizationManager } from '@/src/managers/LocalizationManager'
import { PackManager } from '@/src/managers/PackManager'
import { presentPaywall, useInAppPurchaseContext } from '@/src/providers/InAppPurchaseProvider'
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons'
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
import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
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
import PackPosterView, { IconTag } from './pack/PackPosterView'
import HoverButtons from './utils/HoverButtons'
import Tag from './utils/Tag'

//#endregion

const SHEET_TRASITION_POINT = 0.25

//#region MenuView

export default function MenuView() {
  const insets = useSafeAreaInsets()
  const bottomSheet = useBottomSheet()
  const scrollViewRef = useRef<BottomSheetScrollViewMethods>(null)
  const textInputRef = useRef<TextInput>(null)

  const { playlist, players, playedIds } = useAppContext()
  const setContext = useAppDispatchContext()

  const closedSheetHeight = useSheetBottomInset() - SHEET_HANDLE_HEIGHT

  const sortedPlayers = useMemo(() => [...players].sort((a, b) => a.name.localeCompare(b.name)), [players])

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
          <AddPlayerField textInputRef={textInputRef} />

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
          <PackSection scrollViewRef={scrollViewRef} textInputRef={textInputRef} />

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
      {(playlist.length > 0 || playedIds.size > 0) && (
        <HoverButtons
          buttons={[
            {
              icon: 'reload',
              onPress: () => setContext({ action: 'restartGame' }),
              foregroundColor: Colors.yellow.light,
              backgroundColor: Colors.yellow.dark,
            },
            {
              icon: 'chevron-down',
              text: LocalizationManager.get('start_game')?.value,
              onPress: () => {
                Keyboard.dismiss()
                scrollViewRef.current?.scrollTo({ y: 0, animated: true })
                bottomSheet.collapse()
              },
            },
          ]}
        />
      )}
    </>
  )
}

//#endregion

//#region Header

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

//#endregion

//#region PackSection

function PackSection(
  props: Readonly<
    ViewProps & { scrollViewRef: RefObject<BottomSheetScrollViewMethods>; textInputRef: RefObject<TextInput> }
  >
) {
  const { scrollViewRef, textInputRef, ...viewProps } = props
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

    return [...packs]
      .filter(p => p.availability.isAvailable || p.availability.start?.soon)
      .sort((a, b) => {
        if (isSubscribed || a.is_free === b.is_free) return 0
        return a.is_free ? -1 : 1
      })
  }, [packs])

  if (!packs) return undefined
  return (
    <>
      <View style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 16 }} {...viewProps}>
        {sortedPacks?.map(pack => (
          <View key={pack.id}>
            <PackPosterView
              width={(windowWidth - 32 - 16 * (packsPerRow - 1)) / packsPerRow}
              pack={pack}
              onAddPlayersConfirm={() => {
                scrollViewRef.current?.scrollTo({ y: 0, animated: true })
                textInputRef.current?.focus()
              }}
            />
          </View>
        ))}
      </View>

      <Header titleKey='info' descriptionKey='info_subtitle' />

      <View style={{ gap: 16 }}>
        <IconInfo
          icon='checkmark-circle'
          content={LocalizationManager.get('icon_info_selected')?.value ?? 'icon_info_selected'}
          foregroundColor={Colors.yellow.light}
          backgroundColor={Colors.yellow.dark}
        />

        <IconInfo
          icon='people'
          content={LocalizationManager.get('pack_unplayable_msg')?.value ?? 'pack_unplayable_msg'}
          foregroundColor={Colors.orange.light}
          backgroundColor={Colors.orange.dark}
        />

        {packs?.some(p => p.availability.end?.soon) && (
          <IconInfo
            icon='hourglass'
            content={LocalizationManager.get('leaving_soon_about')?.value ?? 'leaving_soon_about'}
            foregroundColor={Colors.yellow.light}
            backgroundColor={Colors.yellow.dark}
          />
        )}

        {packs?.some(p => p.availability.start?.soon) && (
          <IconInfo
            icon='hourglass'
            content={LocalizationManager.get('coming_soon_about')?.value ?? 'coming_soon_about'}
            foregroundColor={Colors.blue.light}
            backgroundColor={Colors.blue.dark}
          />
        )}

        {!isSubscribed && (
          <TouchableOpacity onPress={() => presentPaywall()}>
            <IconInfo
              icon='cart'
              content={LocalizationManager.get('icon_info_purchase')?.value ?? 'icon_info_purchase'}
              foregroundColor={Colors.green.light}
              backgroundColor={Colors.green.dark}
            />
          </TouchableOpacity>
        )}

        <IconInfo
          icon='reload'
          content={LocalizationManager.get('icon_info_restart')?.value ?? 'icon_info_restart'}
          foregroundColor={Colors.yellow.light}
          backgroundColor={Colors.yellow.dark}
        />
      </View>
    </>
  )
}

function IconInfo(
  props: Readonly<{
    icon?: keyof typeof Ionicons.glyphMap
    content: string
    foregroundColor?: string
    backgroundColor?: string
  }>
) {
  const { icon, content, foregroundColor = Colors.text, backgroundColor = Colors.secondaryBackground } = props
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      {icon && <IconTag icon={icon} color={foregroundColor} backgroundColor={backgroundColor} />}
      <Text style={{ flex: 1, color: Colors.text }}>{content}</Text>
    </View>
  )
}

//#endregion

//#region AddPlayerField

function AddPlayerField(props: Readonly<ViewProps & { textInputRef: React.RefObject<TextInput> }>) {
  const { textInputRef, style } = props
  const { players } = useAppContext()
  const playerCount = players.length
  const setContext = useAppDispatchContext()

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
              backgroundColor: Colors.yellow.light,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 8,
            }}
            onPress={handleClearPlayers}
          >
            <Text style={[FontStyles.Button, { color: Colors.yellow.dark }]} numberOfLines={1}>
              {LocalizationManager.get('clear')?.value ?? 'Clear'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  )
}

//#endregion

//#region LinksView

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

//#endregion

//#region AppDetailsView

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

//#endregion

//#region LanguageSelector

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

//#endregion
