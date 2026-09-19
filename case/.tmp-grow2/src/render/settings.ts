import type { Handlers } from '../env'
import { rules } from './index'

export function renderSettings(handlers: Handlers): string {
  return '<div class="sec">' + rules.map((r) =>
    `<label><input type="checkbox" data-syn="${r.name}" checked> ${r.name}</label>`).join('') + '</div>'
}
