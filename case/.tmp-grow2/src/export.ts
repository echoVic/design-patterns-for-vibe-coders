import type { Env } from './env'
import type { Note } from './types'

/** 导出成纯文本。 */
export function exportNotes(notes: readonly Note[], env: Env): string {
  env.logger.info(`导出 ${notes.length} 条`)
  return notes.map((n) => n.text + (n.tags.length ? ' ' + n.tags.map((t) => '#' + t).join(' ') : '')).join('\n')
}
