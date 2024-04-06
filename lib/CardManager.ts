import { InsufficientCountError, NotFoundError } from '@/types/Errors'
import { supabase } from './supabase'
import { getRandom, shuffled } from './utils'
import { Pack } from './PackManager'

export type Card = Awaited<ReturnType<typeof CardManager.fetch>>

export abstract class CardManager {
    static readonly tableName = 'cards'
    static readonly playerTemplateRegex = /\{player\W*(\d+)\}/gi

    static getNextCardId(playedCardIds: string[], playlist: Pack[], players: Set<string>) {
        const cards = playlist.map((p) => p.cards).flat()
        const candidates = cards.filter(
            (c) => !playedCardIds.includes(c.id) && players.size >= this.getRequiredPlayerCount(c.content)
        )
        if (candidates.length === 0) return null
        return getRandom(candidates).id
    }

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

    private static cachedPlayerCounts: Map<string, number> = new Map()
    static getRequiredPlayerCount(cardContent: string) {
        if (this.cachedPlayerCounts.has(cardContent)) {
            return this.cachedPlayerCounts.get(cardContent)!
        }

        const matches = cardContent.matchAll(this.playerTemplateRegex)
        let highestIndex = -1
        for (const match of matches) {
            const index = parseInt(match[1])
            if (index > highestIndex) highestIndex = index
        }
        const requiredPlayerCount = highestIndex + 1
        this.cachedPlayerCounts.set(cardContent, requiredPlayerCount)

        return requiredPlayerCount
    }
}
