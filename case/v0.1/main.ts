const KEY = 'jot.notes'

interface Note {
  id: string
  text: string
  createdAt: number
}

let notes: Note[] = JSON.parse(localStorage.getItem(KEY) ?? '[]')

const input = document.querySelector<HTMLTextAreaElement>('#input')!
const list = document.querySelector<HTMLElement>('#list')!
const count = document.querySelector<HTMLElement>('#count')!

function render(): void {
  count.textContent = `${notes.length} 条`
  list.innerHTML = notes
    .map((n) => {
      const time = new Date(n.createdAt).toTimeString().slice(0, 5)
      return `<div class="note"><time>${time}</time>${escapeHtml(n.text)}</div>`
    })
    .join('')
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)
}

let timer: number | undefined

// 输入即保存：停手 400ms 后落一次盘
input.addEventListener('input', () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    const text = input.value.trim()
    if (!text) return
    notes.unshift({ id: crypto.randomUUID(), text, createdAt: Date.now() })
    localStorage.setItem(KEY, JSON.stringify(notes))
    input.value = ''
    render()
  }, 400)
})

render()
