/**
 * 同样的功能，把分支变成数据。
 *
 * 顺序、集合、开关，三件事都在数组里看得见。
 */
import type { RenderOptions } from './branches'

export interface Rule {
  /** 名字，也是开关的键。 */
  readonly name: keyof RenderOptions
  readonly apply: (html: string) => string
}

const escape = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)

/** 顺序就是数组顺序——行内元素在前，块级在后。 */
export const rules: readonly Rule[] = [
  { name: 'inlineCode', apply: (h) => h.replace(/`(.+?)`/g, '<code>$1</code>') },
  { name: 'bold',       apply: (h) => h.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') },
  { name: 'strike',     apply: (h) => h.replace(/~~(.+?)~~/g, '<s>$1</s>') },
  { name: 'link',       apply: (h) => h.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>') },
  { name: 'quote',      apply: (h) => h.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>') },
  { name: 'list',       apply: (h) => h.replace(/^- (.+)$/gm, '<li>$1</li>') },
]

export function renderWith(text: string, options: RenderOptions): string {
  return rules
    .filter((rule) => options[rule.name])
    .reduce((html, rule) => rule.apply(html), escape(text))
}
