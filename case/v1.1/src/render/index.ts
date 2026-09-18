import { escapeHtml, rules, type RenderOptions } from './rules'

const ALL_ON: RenderOptions = Object.fromEntries(rules.map((r) => [r.name, true]))

/** 唯一的渲染入口。加一种语法只改 rules.ts 一行。 */
export function render(text: string, options: RenderOptions = ALL_ON): string {
  return rules
    .filter((rule) => options[rule.name])
    .reduce((html, rule) => rule.apply(html), escapeHtml(text))
}

export { rules, escapeHtml }
export type { RenderOptions }
