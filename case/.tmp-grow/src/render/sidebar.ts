import type { AppState, Env, Handlers } from '../env'
import { renderNoteList } from './note-list'

export function renderSidebar(state: AppState, env: Env, handlers: Handlers): string {
  // 这一层只是把东西传下去，自己一个字段都没用
  return renderNoteList(state.notes, state.selectedId, env, handlers)
}
