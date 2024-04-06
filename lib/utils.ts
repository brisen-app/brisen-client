export function blobToBase64(blob: Blob): Promise<string | null> {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(<string | null>reader.result)
        reader.readAsDataURL(blob)
    })
}

/**
 * Formats the given name by removing leading and trailing whitespace and replacing multiple spaces with a single space.
 *
 * @param name - The name to be formatted.
 * @returns The formatted name.
 */
export function formatName(name: string) {
    return name.trim().replace(/\s+/g, ' ')
}

/**
 * Shuffles the elements in the given array using the Fisher-Yates algorithm.
 *
 * @param collection - The array to be shuffled.
 * @returns A new array with the elements shuffled.
 */
export function shuffled<T>(collection: Iterable<T>): T[] {
    const shuffled = Array.from(collection)
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor((crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff) * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

const emptyQuery = {
    queryKey: Array<string>(),
    queryFn: async () => {
        return null
    },
    enabled: false,
}

export { emptyQuery }
