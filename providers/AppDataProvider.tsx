import FetchErrorView from '@/components/FetchErrorView'
import Colors from '@/constants/Colors'
import { CardManager } from '@/managers/CardManager'
import { CardRelationManager } from '@/managers/CardRelationManager'
import { CategoryManager } from '@/managers/CategoryManager'
import { LanguageManager } from '@/managers/LanguageManager'
import { LocalizationManager } from '@/managers/LocalizationManager'
import { PackManager } from '@/managers/PackManager'
import SupabaseManager, { SupabaseItem } from '@/managers/SupabaseManager'
import { useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { ActivityIndicator, View } from 'react-native'
import useColorScheme from '../components/utils/useColorScheme'

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
  const colorScheme = useColorScheme()

  const languageResponse = useSupabase(LanguageManager)
  const categoryResponse = useSupabase(CategoryManager)
  const packResponse = useSupabase(PackManager)
  const cardResponse = useSupabase(CardManager)
  const cardRelationResponse = useSupabase(CardRelationManager)
  const Response = useSupabase(LocalizationManager, languageResponse.hasFetched)

  const hasFetched =
    languageResponse.hasFetched &&
    categoryResponse.hasFetched &&
    packResponse.hasFetched &&
    cardResponse.hasFetched &&
    cardRelationResponse.hasFetched &&
    Response.hasFetched

  const errors = [
    languageResponse.error,
    categoryResponse.error,
    packResponse.error,
    cardResponse.error,
    cardRelationResponse.error,
    Response.error,
  ].filter(e => !!e) as Error[]

  if (errors.length > 0) return <FetchErrorView errors={errors} />

  if (hasFetched) return props.children

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors[colorScheme].background,
      }}
    >
      <ActivityIndicator size='large' color={Colors[colorScheme].accentColor} />
    </View>
  )
}
