import type { Note, NoteDraft } from '../types'

/** 负责把草稿变成一条完整的笔记。 */
export class NoteFactory {
  create(draft: NoteDraft): Note {
    return {
      id: crypto.randomUUID(),
      text: draft.text,
      createdAt: draft.createdAt,
    }
  }
}
