import FetchErrorView from '@/src/components/FetchErrorView'
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
import { AppState, Platform } from 'react-native'
import ActivityIndicatorView from '../components/ActivityIndicatorView'

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

  useEffect(() => {
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

  const isSuccess =
    configResonse.isSuccess &&
    languageResponse.isSuccess &&
    categoryResponse.isSuccess &&
    packResponse.isSuccess &&
    cardResponse.isSuccess &&
    cardRelationResponse.isSuccess &&
    localizationResponse.isSuccess

  const failedResponses = [
    configResonse,
    languageResponse,
    categoryResponse,
    packResponse,
    cardResponse,
    cardRelationResponse,
    localizationResponse,
  ].filter(response => !!response.error) as { error: Error }[]

  if (failedResponses.length > 0)
    return <FetchErrorView errors={failedResponses.map(r => r.error)} onRetry={() => queryClient.invalidateQueries()} />

  if (!isSuccess || queryClient.isFetching())
    return <ActivityIndicatorView text={LocalizationManager.get('loading')?.value} />
  return props.children
}
