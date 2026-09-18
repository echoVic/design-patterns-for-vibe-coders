import { LocalStorageProvider } from './storage/local-storage-provider'
import { NoteRepository } from './domain/note-repository'
import { NoteFactory } from './domain/note-factory'
import { NoteService, EmptyNoteError } from './domain/note-service'

const service = new NoteService(
  new NoteRepository(new LocalStorageProvider()),
  new NoteFactory(),
)

const input = document.querySelector<HTMLTextAreaElement>('#input')!
const list = document.querySelector<HTMLElement>('#list')!
const count = document.querySelector<HTMLElement>('#count')!

function render(): void {
  const notes = service.list()
  count.textContent = `${notes.length} 条`
  list.innerHTML = notes
    .map((n) => {
      const time = new Date(n.createdAt).toTimeString().slice(0, 5)
      return `<div class="note"><time>${time}</time>${n.text}</div>`
    })
    .join('')
}

let timer: number | undefined

input.addEventListener('input', () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    try {
      service.create({ text: input.value.trim(), createdAt: Date.now() })
      input.value = ''
      render()
    } catch (error) {
      if (error instanceof EmptyNoteError) return
      throw error
    }
  }, 400)
})

render()
