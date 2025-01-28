import { CardManager } from '@/src/managers/CardManager'
import { CardRelationManager } from '@/src/managers/CardRelationManager'
import { CategoryManager } from '@/src/managers/CategoryManager'
import { ConfigurationManager } from '@/src/managers/ConfigurationManager'
import { LanguageManager } from '@/src/managers/LanguageManager'
import { LocalizationManager } from '@/src/managers/LocalizationManager'
import { PackManager } from '@/src/managers/PackManager'
import SupabaseManager, { SupabaseItem } from '@/src/managers/SupabaseManager'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ReactNode, useEffect, useState } from 'react'
import { AppState, Platform } from 'react-native'
import FetchErrorView from '../components/FetchErrorView'

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
  const [hasLoadedLanguage, setHasLoadedLanguage] = useState(false)

  const configResonse = useSupabase(ConfigurationManager)
  const languageResponse = useSupabase(LanguageManager, configResonse.isSuccess)
  const categoryResponse = useSupabase(CategoryManager)
  const cardResponse = useSupabase(CardManager)
  const cardRelationResponse = useSupabase(CardRelationManager)
  const packResponse = useSupabase(PackManager, hasLoadedLanguage)
  const localizationResponse = useSupabase(LocalizationManager, hasLoadedLanguage)

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
    if (!languageResponse.isSuccess) return
    LanguageManager.loadStoredLanguage().then(() => setHasLoadedLanguage(true))
  }, [languageResponse.isSuccess])

  useEffect(() => {
    // For Android: Handle user changing language in settings
    const stateListener = AppState.addEventListener('change', nextAppState => {
      if (
        Platform.OS === 'android' &&
        configResonse.isSuccess &&
        languageResponse.isSuccess &&
        LanguageManager.hasChangedLanguage()
      ) {
        LanguageManager.detectLanguage()
        queryClient.invalidateQueries({ queryKey: [PackManager.tableName] })
        queryClient.invalidateQueries({ queryKey: [LocalizationManager.tableName] })
      }

      console.log('AppState', nextAppState)
    })

    return () => stateListener.remove()
  }, [])

  if (responses.some(r => r.isError)) {
    const errors = responses.reduce((acc, r) => (r.error ? [...acc, r.error] : acc), new Array<Error>())
    return <FetchErrorView errors={errors} onRetry={() => queryClient.refetchQueries()} />
  }

  if (queryClient.isFetching() || responses.some(r => r.isPending)) return undefined
  return props.children
}
