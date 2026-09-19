import { LocalNoteStore, createNote } from './store'
import { parseTags } from './tags'
import { renderApp } from './render/app'
import { renderStats } from './stats'
import { exportNotes } from './export'
import type { AppState, Env, Handlers } from './env'
import type { Note, NoteDraft } from './types'
import type { NoteStore } from './store'
import type { RenderOptions } from './render'

export interface AppDeps {
  store: NoteStore
  options?: RenderOptions
}

export function createApp({ store, options = {} }: AppDeps) {
  const input = document.querySelector<HTMLTextAreaElement>('#input')!
  const list = document.querySelector<HTMLElement>('#list')!
  const count = document.querySelector<HTMLElement>('#count')!

  let notes: Note[] = []
  let selectedId: string | null = null
  let timer: number | undefined

  const env: Env = { store, options, logger: console }
  const handlers: Handlers = {
    select: (id) => { selectedId = id; renderAll() },
    remove: (id) => { notes = notes.filter((n) => n.id !== id); renderAll() },
    toggleSyntax: (name, on) => {
      options[name as keyof RenderOptions] = on
      renderAll()
    },
  }

  function renderAll(): void {
    const state: AppState = { notes, selectedId }
    count.textContent = `${notes.length} 条`
    list.innerHTML = renderApp(state, env, handlers) + renderStats(notes, env)
  }

  async function refresh(): Promise<void> {
    notes = await store.all()
    renderAll()
  }

  input.addEventListener('input', () => {
    clearTimeout(timer)
    timer = setTimeout(async () => {
      const raw = input.value.trim()
      if (!raw) return
      const { text, tags } = parseTags(raw)
      if (!text) return
      const draft: NoteDraft = { text, createdAt: Date.now() }
      await store.append(createNote(draft, tags))
      input.value = ''
      await refresh()
    }, 400)
  })

  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement
    if (t.dataset['del']) handlers.remove(t.dataset['del'])
    if (t.id === 'export') alert(exportNotes(notes, env))
  })

  return { refresh }
}

const app = createApp({ store: new LocalNoteStore() })
void app.refresh()
