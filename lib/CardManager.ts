import { InsufficientCountError, NotFoundError } from '@/types/Errors'
import { supabase } from './supabase'
import { getRandom, shuffled } from './utils'
import { Pack } from './PackManager'

export type Card = Awaited<ReturnType<typeof CardManager.fetch>>
export type PlayedCard = {
    formattedContent: string | null
    minPlayers: number
    pack: Pack
    players: string[]
} & Card

export abstract class CardManager {
    static readonly tableName = 'cards'
    static readonly playerTemplateRegex = /\{player\W*(\d+)\}/gi

    static getNextCard(playedCards: PlayedCard[], playlist: Pack[], players: Set<string>): PlayedCard | null {
        const cards = playlist.map((p) => p.cards).flat()
        const playedIDs = playedCards.map((c) => c.id)
        const candidates = cards.filter(
            (c) => !playedIDs.includes(c.id) && players.size >= this.getRequiredPlayerCount(c)
        )

        if (candidates.length === 0) return null

        const shuffledPlayers = shuffled(players)
        const card = getRandom(candidates)

        return {
            ...card,
            formattedContent: this.insertPlayers(card.content, shuffledPlayers),
            minPlayers: this.getRequiredPlayerCount(card),
            pack: playlist.find((p) => p.cards.includes(card))!,
            players: shuffledPlayers,
        }
    }

    private static insertPlayers(cardContent: string, players: string[]) {
        const matches = cardContent.matchAll(this.playerTemplateRegex)
        if (!matches) return null

        let replacedContent = cardContent
        for (const match of matches) {
            const matchedString = match[0]
            const index = parseInt(match[1])
            if (index >= players.length)
                throw new InsufficientCountError(
                    `Not enough players (${players.length}) to insert ${matchedString} into card.`
                )
            replacedContent = replacedContent.replace(matchedString, players[index])
        }

        return replacedContent
    }

    private static cachedPlayerCounts: Map<string, number> = new Map()
    static getRequiredPlayerCount(card: Card) {
        if (this.cachedPlayerCounts.has(card.id)) {
            return this.cachedPlayerCounts.get(card.id)!
        }

        const matches = card.content.matchAll(this.playerTemplateRegex)
        let highestIndex = -1
        for (const match of matches) {
            const index = parseInt(match[1])
            if (index > highestIndex) highestIndex = index
        }
        const requiredPlayerCount = highestIndex + (card.is_group ? 1 : 2)
        this.cachedPlayerCounts.set(card.id, requiredPlayerCount)
        return requiredPlayerCount
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
}
