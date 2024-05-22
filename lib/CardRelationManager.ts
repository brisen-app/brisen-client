import { Tables } from '@/models/supabase'
import SupabaseManager from './SupabaseManager'
import { CycleError } from '@/models/Errors'

const tableName = 'card_dependencies'
export type CardRelation = { id: string } & Tables<typeof tableName>

// Parents are cards that must be drawn before the child can be drawn.
// A root is a card that has no parents, and at least one child.
// A leaf is a card that has no children, and at least one parent.
// A child can have multiple parents, and a parent can have multiple children.
// A graph can have multiple roots and multiple leaves.
// No cycles are allowed.
class CardRelationManagerSingleton extends SupabaseManager<CardRelation> {
    private children: Map<string, Set<string>>
    private parents: Map<string, Set<string>>

    constructor() {
        super(tableName)
        this.children = new Map()
        this.parents = new Map()
    }

    protected set(items: Iterable<CardRelation>) {
        for (const relation of items) {
            this.createEdge(this.children, relation.parent, relation.child)
            this.createEdge(this.parents, relation.child, relation.parent)
        }
        var nodeInCycle = this.hasCycle()
        if (nodeInCycle)
            throw new CycleError('The card dependency graph has a cycle including card: ' + nodeInCycle, nodeInCycle)
    }

    private createEdge(map: Map<string, Set<string>>, from: string, to: string) {
        if (!map.has(from)) map.set(from, new Set())
        map.get(from)!.add(to)
    }

    /**
     * Retrieves an unplayed parent of a card recursively.
     *
     * @param cardId - The ID of the card.
     * @param playedCards - A set of IDs representing the cards that have been played.
     * @param checkedCards - A set of IDs representing the cards that have been checked.
     * @returns The ID of the unplayed parent card, or `null` if there is no unplayed parent.
     */
    getUnplayedParent(cardId: string, candidates: Set<string>, checkedCards: Set<string> = new Set()): string | null {
        if (!candidates.has(cardId) || checkedCards.has(cardId)) return null
        checkedCards.add(cardId)

        const parents = this.parents.get(cardId)
        if (!parents) return cardId

        const unmetParents = [...parents].filter((parent) => candidates.has(parent) && !checkedCards.has(parent))

        for (const parent of unmetParents) {
            const result = this.getUnplayedParent(parent, candidates, checkedCards)
            if (result) return result
        }
        return cardId
    }

    getRequiredPlayerCount(cardId: string, visited: Set<string> = new Set<string>()): number {
        const CardManager = require('./CardManager').CardManager

        const card = CardManager.get(cardId)
        if (!card || visited.has(cardId)) return 0

        visited.add(cardId)
        let highestRequiredPlayers = CardManager.getRequiredPlayerCount(card)

        const parents = this.parents.get(cardId) ?? []
        const children = this.children.get(cardId) ?? []

        for (const parent of parents) {
            highestRequiredPlayers = Math.max(highestRequiredPlayers, this.getRequiredPlayerCount(parent, visited))
        }

        for (const child of children) {
            highestRequiredPlayers = Math.max(highestRequiredPlayers, this.getRequiredPlayerCount(child, visited))
        }

        return highestRequiredPlayers
    }

    /**
     * Retrieves the children of a card.
     *
     * @param cardId - The ID of the card.
     * @returns A set of IDs representing the children of the card.
     */
    getChildren(cardId: string) {
        return this.children.get(cardId) ?? null
    }

    async fetchAll() {
        return (await super.fetchAll()).map((relation) => {
            return {
                ...relation,
                id: relation.child + ':' + relation.parent,
            }
        })
    }

    private hasCycle(): string | null {
        const visited = new Set<string>()
        const recStack = new Set<string>()

        const dfs = (node: string): string | null => {
            if (!visited.has(node)) {
                visited.add(node)
                recStack.add(node)

                const children = this.children.get(node)
                if (children) {
                    for (const child of children) {
                        if (recStack.has(child) || (!visited.has(child) && dfs(child))) return child
                    }
                }
            }
            recStack.delete(node)
            return null
        }

        for (const node of this.children.keys()) {
            if (dfs(node)) return node
        }
        return null
    }
}

export const CardRelationManager = new CardRelationManagerSingleton()
