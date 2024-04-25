import { Category } from './CategoryManager'
import { getRandom, shuffled } from './utils'
import { InsufficientCountError, NotFoundError } from '@/types/Errors'
import { Pack } from './PackManager'
import { Tables } from '@/types/supabase'
import SupabaseManager from './SupabaseManager'
import { supabase } from './supabase'

const tableName = 'cards'
const select = '*, cards(id)'
const playerTemplateRegex = /\{player\W*(\d+)\}/gi
export type Card = Awaited<ReturnType<typeof fetch>>
export type PlayedCard = {
    formattedContent: string | null
    minPlayers: number
    pack: Pack
    players: string[]
} & Card

async function fetch(id: string) {
    const { data } = await supabase.from(tableName).select(select).eq('id', id).single().throwOnError()
    if (!data) throw new NotFoundError(`No data found in table '${tableName}'`)
    return data
}

class CardManagerSingleton extends SupabaseManager<Card> {
    constructor() {
        super(tableName)
    }

    /**
     * Retrieves the next card to be played based on the given parameters.
     *
     * @param playedCards - An array of previously played cards.
     * @param playlist - An array of packs containing cards.
     * @param players - A set of strings representing player names.
     * @param categoryFilter - A set of categories to exclude from the card selection.
     * @returns The next card to be played, or null if no valid card is available.
     */
    getNextCard(
        playedCards: PlayedCard[],
        playlist: Set<Pack>,
        players: Set<string>,
        categoryFilter: Set<Category>
    ): PlayedCard | null {
        const cards = [...playlist]
            .map((p) => p.cards)
            .flat()
            .map((c) => this.get(c.id)!)

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
    private insertPlayers(cardContent: string, players: string[]) {
        const matches = cardContent.matchAll(playerTemplateRegex)

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

    private cachedPlayerCounts: Map<string, number> = new Map()
    /**
     * Calculates the required player count based on the card's content.
     * The method is memoized to avoid recalculating the same card multiple times.
     *
     * @param card - The card for which to retrieve the required player count.
     * @returns The required player count for the card.
     */
    getRequiredPlayerCount(card: Card) {
        if (this.cachedPlayerCounts.has(card.id)) {
            return this.cachedPlayerCounts.get(card.id)!
        }

        const matches = card.content.matchAll(playerTemplateRegex)
        let highestIndex = -1
        for (const match of matches) {
            const index = parseInt(match[1])
            if (index > highestIndex) highestIndex = index
        }
        const requiredPlayerCount = highestIndex + 1
        this.cachedPlayerCounts.set(card.id, requiredPlayerCount)
        return requiredPlayerCount
    }

    async fetch(id: string) {
        const item = await fetch(id)
        this.push(item)
        return item
    }

    async fetchAll(): Promise<Card[]> {
        const { data } = await supabase.from(tableName).select(select).throwOnError()
        if (!data || data.length === 0) throw new NotFoundError(`No data found in table '${this.tableName}'`)
        this.set(data)
        return data
    }
}

export const CardManager = new CardManagerSingleton()
