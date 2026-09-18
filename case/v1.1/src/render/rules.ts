/**
 * 六种语法的差异只有三件事：叫什么、匹配什么、换成什么。
 * 写成一张表，顺序就是执行顺序，开关就是行的 name。
 */
export interface Rule {
  /** 规则名，同时也是开关名。 */
  readonly name: string
  readonly apply: (html: string) => string
}

export const escapeHtml = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)

/**
 * 规则的唯一来源。加一种语法在这里加一行。
 *
 * 顺序是行为的一部分：行内规则在前，块级在后。
 */
export const rules = [
  { name: 'inlineCode', apply: (h: string) => h.replace(/`(.+?)`/g, '<code>$1</code>') },
  { name: 'bold',       apply: (h: string) => h.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') },
  { name: 'strike',     apply: (h: string) => h.replace(/~~(.+?)~~/g, '<s>$1</s>') },
  { name: 'link',       apply: (h: string) => h.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>') },
  { name: 'quote',      apply: (h: string) => h.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>') },
  { name: 'list',       apply: (h: string) => h.replace(/^- (.+)$/gm, '<li>$1</li>') },
] as const satisfies readonly Rule[]

/** 开关名从表推导，不会再和规则表脱节。 */
export type RuleName = (typeof rules)[number]['name']

export type RenderOptions = Partial<Record<RuleName, boolean>>
