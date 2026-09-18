export type NoteId = string

export interface Note {
  readonly id: NoteId
  readonly text: string
  readonly createdAt: number
  readonly tags: readonly string[]
}

export interface NoteDraft {
  readonly text: string
  readonly createdAt: number
}
