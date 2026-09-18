import { escapeHtml, rules, type RenderOptions } from './rules'

/** 唯一的渲染入口。加一种语法改两处：rules.ts 加一行，main.ts 的默认开关加一项。 */
export function render(text: string, options: RenderOptions): string {
  return rules
    .filter((rule) => options[rule.name])
    .reduce((html, rule) => rule.apply(html), escapeHtml(text))
}

export { rules, escapeHtml }
export type { RenderOptions }
