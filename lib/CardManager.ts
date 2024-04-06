import { InsufficientCountError, NotFoundError } from '@/types/Errors'
import { supabase } from './supabase'
import { shuffled } from './utils'

export type Card = Awaited<ReturnType<typeof CardManager.fetch>>

export abstract class CardManager {
    static readonly tableName = 'cards'

    static getFetchQuery(id: string) {
        return {
            queryKey: [this.tableName, id],
            queryFn: async () => {
                return await this.fetch(id)
            },
        }
    }

    static getFetchAllQuery() {
        return {
            queryKey: [this.tableName],
            queryFn: async () => {
                return await this.fetchAll()
            },
        }
    }

    static async fetch(id: string) {
        const { data } = await supabase.from(this.tableName).select().eq('id', id).single().throwOnError()
        if (!data) throw new NotFoundError(`No data found in table '${this.tableName}'`)
        return data
    }

    static async fetchAll() {
        const { data } = await supabase.from(this.tableName).select().throwOnError()
        if (!data || data.length === 0) throw new NotFoundError(`No data found in table '${this.tableName}'`)
        return data
    }

    static insertPlayers(card: Card, players: Iterable<string>) {
        const shuffledPlayers = shuffled(players)
        const regex = /\{player-(\d+)\}/gi
        const matches = card.content.matchAll(regex)
        if (!matches) return card.content

        let replacedContent = card.content
        for (const match of matches) {
            const matchedString = match[0]
            const index = parseInt(match[1]) - 1
            if (index >= shuffledPlayers.length)
                throw new InsufficientCountError(
                    `Not enough players (${shuffledPlayers.length}) to insert ${matchedString} into card.`
                )
            replacedContent = replacedContent.replace(matchedString, shuffledPlayers[index])
        }

        return replacedContent
    }
}
