import { ConfigurationManager } from '@/src/managers/ConfigurationManager'
import * as Crypto from 'expo-crypto'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function blobToBase64(blob: Blob): Promise<string | null> {
  return new Promise(resolve => {
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
  return name.trim().replace(/\s{2,}/g, ' ')
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
    const j = Math.floor((Crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff) * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Generates a random percentage.
 * @returns A random value between 0 and 1.
 */
export function getRandomPercent(): number {
  return Crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff
}

export function getRandom<T>(collection: Iterable<T>): T | null {
  if (collection instanceof Array) {
    if (collection.length === 0) return null
    return collection[
      Math.floor((Crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff) * collection.length) % collection.length
    ]
  }

  let array = null
  if (collection instanceof Array) array = collection
  else array = Array.from(collection)
  if (array.length === 0) return null
  return array[Math.floor((Crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff) * array.length) % array.length]
}

export function useSheetHeight() {
  const inset = useSafeAreaInsets().bottom
  const constant = ConfigurationManager.getValue('bottom_sheet_min_position') ?? 64
  return inset > 0 ? inset + constant : 16 + constant
}

const emptyQuery = {
  queryKey: Array<string>(),
  queryFn: async () => {
    return null
  },
  enabled: false,
}

export { emptyQuery }

export type Serializable<T> = T extends Set<infer U>
  ? U[]
  : T extends Map<infer K, infer V>
  ? [K, V][]
  : T extends Array<infer U>
  ? Serializable<U>[]
  : T extends object
  ? { [K in keyof T]: Serializable<T[K]> }
  : T
