import type { Env, Handlers } from '../env'
import type { Note } from '../types'
import { render, escapeHtml } from './index'

export function renderNoteList(
  notes: readonly Note[], selectedId: string | null, env: Env, handlers: Handlers,
): string {
  return notes.map((n) => {
    const tags = (n.tags ?? []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')
    const cls = n.id === selectedId ? 'note on' : 'note'
    return `<div class="${cls}" data-id="${n.id}">${render(n.text, env.options)}${tags}` +
           `<button data-del="${n.id}">删</button></div>`
  }).join('')
}
