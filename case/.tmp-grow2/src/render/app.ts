import type { AppState, Env, Handlers } from '../env'
import { makeNoteList } from './note-list'
import { renderSettings } from './settings'

/** 环境在创建时传一次，之后被闭包接住。 */
export function createViews(env: Env) {
  const renderNoteList = makeNoteList(env)

  function renderSidebar(state: AppState, handlers: Handlers): string {
    return renderNoteList(state.notes, state.selectedId, handlers)
  }

  return {
    renderApp(state: AppState, handlers: Handlers): string {
      return renderSidebar(state, handlers) + renderSettings(handlers)
    },
  }
}
