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
import { AppState } from 'react-native'
import ActivityIndicatorView from '../components/ActivityIndicatorView'

function useSupabase(manager: SupabaseManager<SupabaseItem>, enabled = true) {
  const { data, error, isLoading, isPending, isFetched } = useQuery({
    queryKey: [manager.tableName],
    queryFn: async () => {
      return await manager.fetchAllOrRetrieve()
    },
    enabled: enabled,
  })
  if (error) console.warn(error)
  return { hasFetched: !!data && !isLoading && !isPending && isFetched, error }
}

export default function AppDataProvider(props: Readonly<{ children: ReactNode }>) {
  const queryClient = useQueryClient()
  const appState = useRef(AppState.currentState)

  useEffect(() => {
    const stateListener = AppState.addEventListener('change', nextAppState => {
      if (LanguageManager.hasUserChangedLanguage()) {
        console.log('User has changed language')
        queryClient.invalidateQueries({
          queryKey: [LanguageManager.tableName, LocalizationManager.tableName, PackManager.tableName],
        })
      }

      appState.current = nextAppState
      console.log('AppState', appState.current)
    })

    return () => {
      stateListener.remove()
    }
  }, [])

  const configResonse = useSupabase(ConfigurationManager)
  const languageResponse = useSupabase(LanguageManager, configResonse.hasFetched)
  const categoryResponse = useSupabase(CategoryManager)
  const cardResponse = useSupabase(CardManager)
  const cardRelationResponse = useSupabase(CardRelationManager)
  const packResponse = useSupabase(PackManager, languageResponse.hasFetched)
  const localizationResponse = useSupabase(LocalizationManager, languageResponse.hasFetched)

  const hasFetched =
    configResonse.hasFetched &&
    languageResponse.hasFetched &&
    categoryResponse.hasFetched &&
    packResponse.hasFetched &&
    cardResponse.hasFetched &&
    cardRelationResponse.hasFetched &&
    localizationResponse.hasFetched

  const errors = [
    configResonse.error,
    languageResponse.error,
    categoryResponse.error,
    packResponse.error,
    cardResponse.error,
    cardRelationResponse.error,
    localizationResponse.error,
  ].filter(e => !!e) as Error[]

  if (errors.length > 0) return <FetchErrorView errors={errors} onRetry={() => queryClient.invalidateQueries()} />

  if (hasFetched) return props.children

  return <ActivityIndicatorView text={LocalizationManager.get('loading')?.value} />
}
