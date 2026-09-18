import { escapeHtml, rules, type RenderOptions } from './rules'

/** 渲染入口。第 05 章比较过类版和函数版，这里是函数版的延续。 */
export function render(text: string, options: RenderOptions = ALL_ON): string {
  return rules
    .filter((rule) => options[rule.name])
    .reduce((html, rule) => rule.apply(html), escapeHtml(text))
}

const ALL_ON: RenderOptions = {
  inlineCode: true, bold: true, strike: true, link: true, quote: true, list: true,
}

export { rules }
export type { RenderOptions }
