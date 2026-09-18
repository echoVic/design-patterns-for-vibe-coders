import type { StorageProvider } from './storage-provider'
import type { Note } from '../types'

const KEY = 'jot.notes'

/** 基于 localStorage 的实现。 */
export class LocalStorageProvider implements StorageProvider {
  constructor(private readonly key: string = KEY) {}

  load(): Note[] {
    try {
      return JSON.parse(localStorage.getItem(this.key) ?? '[]') as Note[]
    } catch {
      return []
    }
  }

  save(notes: readonly Note[]): void {
    localStorage.setItem(this.key, JSON.stringify(notes))
  }
}
