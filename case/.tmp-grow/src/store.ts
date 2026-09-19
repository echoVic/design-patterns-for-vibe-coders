import type { Note, NoteDraft } from './types'

/**
 * 由使用方定义的存储接口。
 *
 * 界面是它唯一的消费者。接口比任何实现都窄：它只提供
 * 「拿到全部」和「最近追加的在前」，不承诺同步，也不承诺一次写几条。
 *
 * 两个约定：
 *   - `all()` 返回的是快照，改它不该影响存储里的数据
 *   - `append` 是读-改-写，不支持并发调用（并发会丢）
 *
 * 第二个实现是 `MemoryNoteStore`，store.test.ts 在用。
 */
export interface NoteStore {
  /** 读出全部笔记，最近追加的在前。返回快照，不是内部引用。 */
  all(): Promise<Note[]>

  /** 追加一条。不要并发调用。 */
  append(note: Note): Promise<void>
}

const KEY = 'jot.notes'

/** 存进去的东西未必是我们写的：可能被别的版本、或者手动改过。 */
function looksLikeNote(v: unknown): v is Note {
  if (typeof v !== 'object' || v === null) return false
  const n = v as Record<string, unknown>
  return typeof n.id === 'string' && typeof n.text === 'string' && typeof n.createdAt === 'number'
}

/** 脏数据一律丢掉，不让它把整个列表带崩。 */
function readNotes(raw: string | null): Note[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(looksLikeNote).map((n) => ({ ...n, tags: Array.isArray(n.tags) ? n.tags : [] }))
  } catch {
    return []
  }
}

export class LocalNoteStore implements NoteStore {
  async all(): Promise<Note[]> {
    return readNotes(localStorage.getItem(KEY))
  }

  async append(note: Note): Promise<void> {
    const notes = await this.all()
    localStorage.setItem(KEY, JSON.stringify([note, ...notes]))
  }
}

/** 测试用。第二个实现是真实存在的，不是想象的。 */
export class MemoryNoteStore implements NoteStore {
  private notes: Note[] = []

  /** 返回快照：元素也复制一份，外部改它不该写穿到这里。 */
  async all(): Promise<Note[]> {
    return this.notes.map((n) => ({ ...n }))
  }

  async append(note: Note): Promise<void> {
    this.notes = [note, ...this.notes]
  }
}

export function createNote(draft: NoteDraft, tags: readonly string[]): Note {
  return { id: crypto.randomUUID(), text: draft.text, createdAt: draft.createdAt, tags }
}
