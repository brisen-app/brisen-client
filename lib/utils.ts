export function blobToBase64(blob: Blob): Promise<string | null> {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(<string | null>reader.result)
        reader.readAsDataURL(blob)
    })
}

const emptyQuery = {
    queryKey: Array<string>(),
    queryFn: async () => {
        return null
    },
    enabled: false,
}

export { emptyQuery }
