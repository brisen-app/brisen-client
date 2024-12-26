import { CardManager } from '@/src/managers/CardManager'
import { CardRelationManager } from '@/src/managers/CardRelationManager'
import { CategoryManager } from '@/src/managers/CategoryManager'
import { ConfigurationManager } from '@/src/managers/ConfigurationManager'
import { LanguageManager } from '@/src/managers/LanguageManager'
import { LocalizationManager } from '@/src/managers/LocalizationManager'
import { PackManager } from '@/src/managers/PackManager'
import SupabaseManager, { SupabaseItem } from '@/src/managers/SupabaseManager'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ReactNode, useEffect, useRef } from 'react'
import { AppState, Platform, View, ViewProps } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import FetchErrorView from '../components/FetchErrorView'
import Colors from '../constants/Colors'
import Color from '../models/Color'

function useSupabase(manager: SupabaseManager<SupabaseItem>, enabled = true) {
  const response = useQuery({
    queryKey: [manager.tableName],
    queryFn: async () => {
      return await manager.fetchAllOrRetrieve()
    },
    enabled: enabled,
  })
  if (response.error) console.warn(response.error)
  return { ...response, key: manager.tableName }
}

export default function AppDataProvider(props: Readonly<{ children: ReactNode }>) {
  const queryClient = useQueryClient()
  const appState = useRef(AppState.currentState)

  const configResonse = useSupabase(ConfigurationManager)
  const languageResponse = useSupabase(LanguageManager, configResonse.isSuccess)
  const categoryResponse = useSupabase(CategoryManager)
  const cardResponse = useSupabase(CardManager)
  const cardRelationResponse = useSupabase(CardRelationManager)
  const packResponse = useSupabase(PackManager, languageResponse.isSuccess)
  const localizationResponse = useSupabase(LocalizationManager, languageResponse.isSuccess)

  const responses = [
    configResonse,
    languageResponse,
    categoryResponse,
    packResponse,
    cardResponse,
    cardRelationResponse,
    localizationResponse,
  ]

  useEffect(() => {
    // For Android: Handle user changing language in settings
    const stateListener = AppState.addEventListener('change', nextAppState => {
      if (
        Platform.OS === 'android' &&
        configResonse.isSuccess &&
        languageResponse.isSuccess &&
        LanguageManager.hasChangedLanguage()
      ) {
        LanguageManager.updateDisplayLanguage()
        queryClient.invalidateQueries({ queryKey: [PackManager.tableName] })
        queryClient.invalidateQueries({ queryKey: [LocalizationManager.tableName] })
      }

      appState.current = nextAppState
      console.log('AppState', appState.current)
    })

    return () => stateListener.remove()
  }, [])

  if (responses.some(r => r.isError)) {
    const errors = responses.reduce((acc, r) => (r.error ? [...acc, r.error] : acc), new Array<Error>())
    return <FetchErrorView errors={errors} onRetry={() => queryClient.refetchQueries()} />
  }

  if (queryClient.isFetching() || responses.some(r => r.isPending)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ProgressBar progress={responses.filter(r => !r.isPending).length / (responses.length - 2)} />
      </View>
    )
  }

  return props.children
}

function ProgressBar(props: Readonly<{ progress: number } & ViewProps>) {
  const { progress, style } = props
  const animationProgress = useSharedValue(progress)

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${animationProgress.value * 100}%`,
    }
  }, [progress])

  useEffect(() => {
    animationProgress.value = withTiming(Math.max(Math.min(progress, 1), 0), { duration: 50 })
  }, [progress])

  return (
    <View
      style={[
        {
          height: 8,
          width: '50%',
          backgroundColor: Color.hex(Colors.accentColor).alpha(0.25).string,
          borderRadius: Number.MAX_SAFE_INTEGER,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: Colors.accentColor,
          },
          animatedProgressStyle,
        ]}
      />
    </View>
  )
}
