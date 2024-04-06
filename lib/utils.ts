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

const emptyQuery = {
    queryKey: Array<string>(),
    queryFn: async () => {
        return null
    },
    enabled: false,
}

export { emptyQuery }
