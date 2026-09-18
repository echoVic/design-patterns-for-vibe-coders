import type { NoteFactory } from './note-factory'
import type { NoteRepository } from './note-repository'
import type { Note, NoteDraft } from '../types'

/** 笔记相关的用例。 */
export class NoteService {
  constructor(
    private readonly repository: NoteRepository,
    private readonly factory: NoteFactory,
  ) {}

  list(): Note[] {
    return this.repository.findAll()
  }

  create(draft: NoteDraft): Note {
    const note = this.factory.create(draft)
    this.repository.add(note)
    return note
  }
}

/** 输入为空时不创建笔记。 */
export class EmptyNoteError extends Error {
  constructor() {
    super('笔记内容为空')
    this.name = 'EmptyNoteError'
  }
}
