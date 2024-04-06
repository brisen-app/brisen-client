import { InsufficientCountError, NotFoundError } from '@/types/Errors'
import { supabase } from './supabase'
import { shuffled } from './utils'

export type Card = Awaited<ReturnType<typeof CardManager.fetch>>

export abstract class CardManager {
    static readonly tableName = 'cards'
    static readonly playerTemplateRegex = /\{player\W*(\d+)\}/gi

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

    static insertPlayers(cardContent: string, players: Iterable<string>) {
        const matches = cardContent.matchAll(this.playerTemplateRegex)
        if (!matches) return cardContent

        const shuffledPlayers = shuffled(players)
        let replacedContent = cardContent
        for (const match of matches) {
            const matchedString = match[0]
            const index = parseInt(match[1])
            if (index >= shuffledPlayers.length)
                throw new InsufficientCountError(
                    `Not enough players (${shuffledPlayers.length}) to insert ${matchedString} into card.`
                )
            replacedContent = replacedContent.replace(matchedString, shuffledPlayers[index])
        }

        return replacedContent
    }

    static getRequiredPlayerCount(cardContent: string) {
        const matches = cardContent.matchAll(this.playerTemplateRegex)
        let highestIndex = -1
        for (const match of matches) {
            const index = parseInt(match[1])
            if (index > highestIndex) highestIndex = index
        }
        return highestIndex + 1
    }
}
