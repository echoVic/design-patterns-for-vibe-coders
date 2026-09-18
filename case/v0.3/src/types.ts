/** 一条笔记的唯一标识。 */
export type NoteId = string

/** 已经保存下来的笔记。 */
export interface Note {
  readonly id: NoteId
  readonly text: string
  readonly createdAt: number
}

/** 尚未落盘的新笔记。 */
export interface NoteDraft {
  readonly text: string
  readonly createdAt: number
}
