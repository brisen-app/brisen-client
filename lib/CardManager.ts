import { InsufficientCountError, NotFoundError } from '@/types/Errors'
import { supabase } from './supabase'
import { getRandom, shuffled } from './utils'
import { Pack } from './PackManager'
import { Category } from './CategoryManager'

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

    /**
     * Retrieves the next card to be played based on the given parameters.
     *
     * @param playedCards - An array of previously played cards.
     * @param playlist - An array of packs containing cards.
     * @param players - A set of players.
     * @returns The next card to be played, or null if no valid card is available.
     */
    static getNextCard(
        playedCards: PlayedCard[],
        playlist: Set<Pack>,
        players: Set<string>,
        categoryFilter: Set<Category>
    ): PlayedCard | null {
        const cards = [...playlist].map((p) => p.cards).flat()
        const playedIDs = playedCards.map((c) => c.id)
        const categoryFilterIDs = [...categoryFilter].map((c) => c.id)
        const candidates = cards.filter(
            (c) =>
                !playedIDs.includes(c.id) &&
                players.size >= this.getRequiredPlayerCount(c) &&
                !categoryFilterIDs.includes(c.category ?? '')
        )

        if (candidates.length === 0) return null

        const shuffledPlayers = shuffled(players)
        const card = getRandom(candidates)

        return {
            ...card,
            formattedContent: this.insertPlayers(card.content, shuffledPlayers),
            minPlayers: this.getRequiredPlayerCount(card),
            pack: [...playlist].find((p) => p.cards.includes(card))!,
            players: shuffledPlayers,
        }
    }

    /**
     * Inserts the names of players into the card content.
     * Formats the card content by replacing `{player-#}` with the name of the player at the corresponding index.
     * `{player-0}` will always be the targeted player if `is_group` is `false`.
     *
     * @param cardContent - The original card content.
     * @param players - An array of player names.
     * @returns The modified card content with player names inserted, or `null` if no replacements were made.
     * @throws InsufficientCountError if there are not enough players to insert into the card.
     */
    private static insertPlayers(cardContent: string, players: string[]) {
        const matches = cardContent.matchAll(this.playerTemplateRegex)

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

        return replacedContent === cardContent ? null : replacedContent
    }

    private static cachedPlayerCounts: Map<string, number> = new Map()
    /**
     * Calculates the required player count based on the card's content.
     * The method is memoized to avoid recalculating the same card multiple times.
     *
     * @param card - The card for which to retrieve the required player count.
     * @returns The required player count for the card.
     */
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
        const requiredPlayerCount = highestIndex + 1
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
