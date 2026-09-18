import { escapeHtml, renderWith, rules } from './rules'
import type { RenderOptions } from './rules'

/** 应用实际用的入口。实现和对照版都在 rules.ts 里。 */
export function render(text: string, options?: RenderOptions): string {
  return renderWith(text, options)
}

export { rules, escapeHtml }
export type { RenderOptions }
