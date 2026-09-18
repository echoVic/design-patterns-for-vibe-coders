import type { StorageProvider } from '../storage/storage-provider'
import type { Note } from '../types'

/** 笔记的读写入口，屏蔽底层存储的细节。 */
export class NoteRepository {
  constructor(private readonly storage: StorageProvider) {}

  findAll(): Note[] {
    return this.storage.load()
  }

  add(note: Note): void {
    this.storage.save([note, ...this.storage.load()])
  }
}
