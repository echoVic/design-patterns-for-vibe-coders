import type { NoteStore } from './store'
import type { RenderOptions } from './render'

/** 环境：整个程序里同一个，和这次调用无关。 */
export interface Env {
  readonly store: NoteStore
  readonly options: RenderOptions
  readonly logger: { info(msg: string): void }
}

/** 数据：每次调用都不一样，必须显式传。 */
export interface AppState {
  readonly notes: readonly import('./types').Note[]
  readonly selectedId: string | null
}

/** 回调。 */
export interface Handlers {
  readonly select: (id: string) => void
  readonly remove: (id: string) => void
  readonly toggleSyntax: (name: string, on: boolean) => void
}
