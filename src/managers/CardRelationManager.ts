import { shuffled } from '@/src/lib/utils'
import { CycleError } from '@/src/models/Errors'
import { Tables } from '@/src/models/supabase'
import SupabaseManager from './SupabaseManager'

const tableName = 'card_dependencies'
export type CardRelation = { id: string } & Tables<typeof tableName>

// Parents are cards that must be drawn before the child can be drawn.
// A root is a card that has no parents, and at least one child.
// A leaf is a card that has no children, and at least one parent.
// A child can have multiple parents, and a parent can have multiple children.
// A graph can have multiple roots and multiple leaves.
// No cycles are allowed.
class CardRelationManagerSingleton extends SupabaseManager<CardRelation> {
  private readonly children: Map<string, Set<string>>
  private readonly parents: Map<string, Set<string>>

  constructor() {
    super(tableName)
    this.children = new Map()
    this.parents = new Map()
  }

  protected set(items: Array<CardRelation>) {
    for (const relation of items) {
      this.createEdge(this.children, relation.parent, relation.child)
      this.createEdge(this.parents, relation.child, relation.parent)
    }

    for (const root of this.parents.keys()) {
      this.detectCycle(root)
    }
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
  getUnplayedParent(cardId: string, unplayedCards: Set<string>): string | null {
    try {
      this.traverse(cardId, 'parents', item => {
        if (!unplayedCards.has(item)) return false
        if (this.isPlayable(item, unplayedCards)) throw item
        return true
      })
    } catch (item) {
      if (typeof item !== 'string') throw item
      return item
    }
    return null
  }

  hasUnplayedParent(cardId: string, unplayedCards: Set<string>) {
    for (const parent of this.parents.get(cardId) ?? []) {
      if (unplayedCards.has(parent)) return true
    }
    return false
  }

  getUnplayedChild(cardId: string, unplayedCards: Set<string>): string | null {
    for (const child of shuffled(this.children.get(cardId) ?? [])) {
      if (!unplayedCards.has(child)) return child
    }
    return null
  }

  hasUnplayedChild(cardId: string, unplayedCards: Set<string>) {
    for (const child of this.children.get(cardId) ?? []) {
      if (unplayedCards.has(child)) return true
    }
    return false
  }

  isPlayable(cardId: string, unplayedCards: Set<string>) {
    if (!unplayedCards.has(cardId)) return false
    for (const parent of this.parents.get(cardId) ?? []) {
      if (unplayedCards.has(parent)) return false
    }
    return true
  }

  getPlayedParent(cardId: string, playedIds: Set<string>): string | null {
    try {
      this.traverse(cardId, 'parents', item => {
        if (cardId !== item && playedIds.has(item)) throw item
        return true
      })
    } catch (item) {
      if (typeof item !== 'string') throw item
      return item
    }
    return null
  }

  private readonly cachedPlayerCounts: Map<string, number> = new Map()
  getRequiredPlayerCount(cardId: string): number {
    if (this.cachedPlayerCounts.has(cardId)) return this.cachedPlayerCounts.get(cardId)!
    const CardManager = require('./CardManager').CardManager

    const visited = new Set<string>()
    let highest = 0

    this.traverse(cardId, 'both', item => {
      const card = CardManager.get(item)
      if (!card) return false
      visited.add(item)
      highest = Math.max(highest, CardManager.getRequiredPlayerCount(card))
      return true
    })

    visited.forEach(item => {
      this.cachedPlayerCounts.set(item, highest)
    })
    return highest
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

  /**
   * Retrieves the parents of a card.
   *
   * @param cardId - The ID of the card.
   * @returns A set of IDs representing the parents of the card.
   */
  getParents(cardId: string) {
    return this.parents.get(cardId) ?? new Set()
  }

  hasDirectPlayedParent(cardId: string, playedIds: Set<string>) {
    return [...this.getParents(cardId)].some(parent => playedIds.has(parent))
  }

  async fetchAll() {
    return (await super.fetchAll()).map(relation => {
      return {
        ...relation,
        id: relation.child + ':' + relation.parent,
      }
    })
  }

  isItem(item: object): item is CardRelation {
    return (item as CardRelation).child !== undefined && (item as CardRelation).parent !== undefined
  }

  /**
   * Detects cycles in the card dependency graph.
   *
   * @param root - The ID of the root card.
   * @throws CycleError if a cycle is detected.
   */
  private detectCycle(root: string) {
    this.traverse(
      root,
      'children',
      () => true,
      path => {
        throw new CycleError(path)
      }
    )
  }

  /**
   * Traverses the card dependency graph.
   *
   * @param from - The ID of the card to start traversing from.
   * @param direction - The direction to traverse the graph (either 'parents', 'children', or 'both').
   * @param forEach - A function to be called for each card in the graph. The function should return true to continue traversing the graph, or false to stop. Throw and cath to get item.
   * @param onCycle - A function to be called if a cycle is detected.
   * @param path - A set of IDs representing the cards that have been visited.
   */
  private traverse(
    from: string,
    direction: 'parents' | 'children' | 'both' = 'children',
    forEach: (item: string) => boolean = () => true,
    onCycle: (path: Array<string>) => void = () => {},
    path: Array<string> = new Array<string>(),
    visited: Set<string> = new Set<string>()
  ) {
    if (!forEach(from)) return
    path.push(from)
    visited.add(from)

    if (direction === 'both' || direction === 'parents') {
      this.traverseAdjacent(from, this.parents, direction, forEach, onCycle, path, visited)
    }

    if (direction === 'both' || direction === 'children') {
      this.traverseAdjacent(from, this.children, direction, forEach, onCycle, path, visited)
    }

    path.pop()
  }

  /**
   * Helper function for traversing the adjacent nodes of a given node in a graph.
   * Traverses the adjacent nodes of a given node in a graph.
   */
  private traverseAdjacent(
    from: string,
    to: Map<string, Set<string>>,
    direction: 'parents' | 'children' | 'both' = 'children',
    forEach: (item: string) => boolean = () => true,
    onCycle: (path: Array<string>) => void = () => {},
    path: Array<string> = new Array<string>(),
    visited: Set<string> = new Set<string>()
  ) {
    for (const parent of to.get(from) ?? []) {
      if (path.includes(parent)) {
        if (direction !== 'both') onCycle([...path, parent])
        continue
      }
      if (visited.has(parent)) continue
      this.traverse(parent, direction, forEach, onCycle, path, visited)
    }
  }
}

export const CardRelationManager = new CardRelationManagerSingleton()
