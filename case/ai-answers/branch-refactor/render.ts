import { RULES, type RenderOptions } from './rules'

const HTML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
}

/** 先转义原文，后面新生成的标签才不会被自己转义掉。 */
export const escapeHtml = (s: string): string =>
  s.replace(/[&<>]/g, (c) => HTML_ESCAPES[c] ?? c)

/**
 * 渲染正文：转义一次，再把开了的规则按表里的顺序依次叠上去。
 *
 * 这里的分支只有「开没开」这一处，跟有几种语法无关——加语法不用动这个文件。
 */
export function render(text: string, options: RenderOptions): string {
  return RULES.filter((rule) => options[rule.name]).reduce(
    (html, rule) => html.replace(rule.pattern, rule.replacement),
    escapeHtml(text),
  )
}
