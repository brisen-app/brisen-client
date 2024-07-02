import { CardManager } from '@/lib/CardManager'
import { CardRelationManager } from '@/lib/CardRelationManager'
import { CategoryManager } from '@/lib/CategoryManager'
import { LanguageManager } from '@/lib/LanguageManager'
import { LocalizationManager } from '@/lib/LocalizationManager'
import { PackManager } from '@/lib/PackManager'
import SupabaseManager, { SupabaseItem } from '@/lib/SupabaseManager'
import { useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'

function useSupabase(manager: SupabaseManager<SupabaseItem>, enabled = true): boolean {
  const { data, error, isLoading, isPending, isFetched } = useQuery({
    queryKey: [manager.tableName],
    queryFn: async () => {
      return await manager.fetchAllOrRetrieve()
    },
    enabled: enabled,
  })
  if (error) console.warn(error)
  return !!data && !isLoading && !isPending && isFetched
}

export default function AppDataProvider(props: Readonly<{ children: ReactNode }>) {
  const hasFetchedLanguages = useSupabase(LanguageManager)
  const hasFetchedCategories = useSupabase(CategoryManager)
  const hasFetchedPacks = useSupabase(PackManager)
  const hasFetchedCards = useSupabase(CardManager)
  const hasFetchedCardRelations = useSupabase(CardRelationManager)
  const hasFetchedLocalizations = useSupabase(LocalizationManager, hasFetchedLanguages)

  if (
    !hasFetchedLanguages ||
    !hasFetchedCategories ||
    !hasFetchedPacks ||
    !hasFetchedCards ||
    !hasFetchedCardRelations ||
    !hasFetchedLocalizations
  )
    return null

  // TODO: Display error if any data is null
  return props.children
}
