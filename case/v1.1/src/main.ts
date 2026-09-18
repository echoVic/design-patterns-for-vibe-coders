import { LocalNoteStore, createNote, type NoteStore } from './store'
import { render } from './render'
import { parseTags } from './tags'
import type { Note, NoteDraft } from './types'

const DEFAULT_OPTIONS = { inlineCode: true, bold: true, strike: true, link: true, quote: true, list: true }

/** 界面和存储在这里接上。全程序只有这一个地方创建具体实现。 */
export interface AppDeps {
  store: NoteStore
  options?: typeof DEFAULT_OPTIONS
}

export function createApp({ store, options = DEFAULT_OPTIONS }: AppDeps) {
  const input = document.querySelector<HTMLTextAreaElement>('#input')!
  const list = document.querySelector<HTMLElement>('#list')!
  const count = document.querySelector<HTMLElement>('#count')!

  let notes: Note[] = []
  let timer: number | undefined

  // 唯一的渲染入口。派生值在这里算，不存在第二份。
  function renderAll(): void {
    count.textContent = `${notes.length} 条`
    list.innerHTML = notes
      .map((n) => {
        const time = new Date(n.createdAt).toTimeString().slice(0, 5)
        // 早前版本写入的笔记没有 tags 字段，读的时候要兜住
        const tags = (n.tags ?? []).map((t) => `<span class="tag">${t}</span>`).join('')
        return `<div class="note"><time>${time}</time>${render(n.text, options)}${tags}</div>`
      })
      .join('')
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
      const draft: NoteDraft = { text, createdAt: Date.now() }
      await store.append(createNote(draft, tags))
      input.value = ''
      await refresh()
    }, 400)
  })

  return { refresh }
}

// 组装：只有这一行知道用的是哪个实现
const app = createApp({ store: new LocalNoteStore() })
void app.refresh()
