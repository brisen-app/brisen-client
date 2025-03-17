export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class NotImplementedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotImplementedError'
  }
}

export class CycleError extends Error {
  constructor(public nodes: Array<string>) {
    super(`Cycle detected: ${nodes.join(' -> ')}`)
    this.name = 'CycleError'
  }
}
