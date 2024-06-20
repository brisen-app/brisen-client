import { CardManager } from '@/lib/CardManager'
import { CycleError } from './Errors'

class Graph<T> {
  readonly items: Set<T>
  readonly hasCycle: boolean

  private readonly roots: Set<T>
  private readonly _parents: Map<T, Set<T>>
  private readonly _children: Map<T, Set<T>>

  constructor(parents: Map<T, Set<T>>, children: Map<T, Set<T>>) {
    this._parents = parents
    this._children = children
    this.items = new Set([...this._parents.keys(), ...this._children.keys()])
    this.roots = new Set([...this.items].filter((item) => !this._parents.has(item)))
    this.hasCycle = this.detectCycle(this.roots)
  }

  protected detectCycle(roots: Set<T>) {
    try {
      for (const root of roots) {
        this.traverse(
          root,
          'both',
          () => {},
          () => {
            throw new CycleError()
          }
        )
      }
    } catch (error) {
      if (error instanceof CycleError) return true
      throw error
    }
    return false
  }

  protected traverse(
    from: T,
    direction: 'parents' | 'children' | 'both' = 'children',
    forEach: (item: T) => void = () => {},
    onCycle: (item: T) => void = () => {},
    visited: Set<T> = new Set<T>()
  ) {
    forEach(from)
    visited.add(from)

    if (direction === 'both' || direction === 'parents') {
      for (const parent of this._parents.get(from) ?? []) {
        if (visited.has(parent)) {
          if (direction !== 'both') onCycle(from)
          continue
        }
        this.traverse(parent, direction, forEach, onCycle, visited)
      }
    }

    if (direction === 'both' || direction === 'children') {
      for (const child of this._children.get(from) ?? []) {
        if (visited.has(child)) {
          if (direction !== 'both') onCycle(from)
          continue
        }
        this.traverse(child, direction, forEach, onCycle, visited)
      }
    }
  }
}

export default class CardRelationGraph extends Graph<string> {
  readonly minPlayers: number = 0

  constructor(parents: Map<string, Set<string>>, children: Map<string, Set<string>>) {
    super(parents, children)

    for (const item of this.items) {
      this.minPlayers = Math.max(this.minPlayers, CardManager.getRequiredPlayerCount(CardManager.get(item)!))
    }
  }
}
