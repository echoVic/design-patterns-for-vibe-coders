import type { AppState, Env, Handlers } from '../env'
import { renderSidebar } from './sidebar'
import { renderSettings } from './settings'

export function renderApp(state: AppState, env: Env, handlers: Handlers): string {
  return renderSidebar(state, env, handlers) + renderSettings(env, handlers)
}
