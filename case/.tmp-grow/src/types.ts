export interface Note {
  readonly id: string
  readonly text: string
  readonly createdAt: number
  readonly tags: readonly string[]
}
export interface NoteDraft {
  readonly text: string
  readonly createdAt: number
}
export type { RenderOptions } from './render'
