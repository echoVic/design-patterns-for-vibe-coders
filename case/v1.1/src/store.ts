import type { Note, NoteDraft } from './types'

/**
 * 由使用方定义的存储接口。
 *
 * 三个消费者：界面、导出、统计。接口比任何实现都窄——
 * 它提供「拿到全部」和「追加一条」，不承诺同步，也不承诺一次写几条。
 */
export interface NoteStore {
  /** 读出全部笔记，按时间倒序。 */
  all(): Promise<Note[]>

  /** 追加一条。 */
  append(note: Note): Promise<void>
}

const KEY = 'jot.notes'

export class LocalNoteStore implements NoteStore {
  async all(): Promise<Note[]> {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Note[]
    } catch {
      return []
    }
  }

  async append(note: Note): Promise<void> {
    const notes = await this.all()
    localStorage.setItem(KEY, JSON.stringify([note, ...notes]))
  }
}

/** 测试用。第二个实现是真实存在的，不是想象的。 */
export class MemoryNoteStore implements NoteStore {
  private notes: Note[] = []
  async all(): Promise<Note[]> { return [...this.notes] }
  async append(note: Note): Promise<void> { this.notes = [note, ...this.notes] }
}

export function createNote(draft: NoteDraft, tags: readonly string[]): Note {
  return { id: crypto.randomUUID(), text: draft.text, createdAt: draft.createdAt, tags }
}
