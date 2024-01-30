export class UUID extends String {
    private static uuidPattern = RegExp(/^[a-f0-9]{8}(-[a-f0-9]{4}){4}[a-f0-9]{8}$/)
    private static allUUIDs: Set<UUID> = new Set()

    get string(): string { return this.toString() }

    constructor(string: string) {
        if (!UUID.uuidPattern.test(string)) throw new TypeError(`Invalid UUID: '${string}'`)
        if (UUID.allUUIDs.has(string)) throw new TypeError(`Duplicate UUID: '${string}'`)
        super(string)
        UUID.allUUIDs.add(this)
    }
}
