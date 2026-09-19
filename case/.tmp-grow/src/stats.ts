import type { Env } from './env'
import type { Note } from './types'

/** 统计面板。 */
export function renderStats(notes: readonly Note[], env: Env): string {
  const tags = new Set(notes.flatMap((n) => n.tags))
  return `<div class="sec">${notes.length} 条 · ${tags.size} 个标签 · ${env.options.bold ? '加粗开' : '加粗关'}</div>`
}
