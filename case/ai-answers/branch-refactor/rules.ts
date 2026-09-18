/**
 * 六种语法的差异只有三件事：叫什么、匹配什么、换成什么。
 *
 * 所以它们不是六段代码，是一张六行的表。表的顺序就是执行顺序，
 * 行的 name 就是那个开关——没有第二处需要同步的地方。
 */

/** 一条规则，从左往右读就是一次 String.replace。 */
export interface Rule {
  /** 规则名，同时也是 RenderOptions 里的开关名。 */
  readonly name: string
  /** 匹配用的正则，需要带 g。 */
  readonly pattern: RegExp
  /** 替换成的 HTML，用 $1 $2 引用捕获组。 */
  readonly replacement: string
}

/**
 * 规则的唯一来源。
 *
 * 顺序是行为的一部分，不是排版：行内规则先跑，块级规则后跑，
 * 例如 `**`x`**` 先被认成行内代码才能被包进 <b>。调整顺序会改变输出。
 *
 * 要加一种语法，就在这张表里加一行——开关类型会自动跟着长出来。
 */
export const RULES = [
  { name: 'inlineCode', pattern: /`(.+?)`/g,            replacement: '<code>$1</code>' },
  { name: 'bold',       pattern: /\*\*(.+?)\*\*/g,      replacement: '<b>$1</b>' },
  { name: 'strike',     pattern: /~~(.+?)~~/g,          replacement: '<s>$1</s>' },
  { name: 'link',       pattern: /\[(.+?)\]\((.+?)\)/g, replacement: '<a href="$2">$1</a>' },
  { name: 'quote',      pattern: /^> (.+)$/gm,          replacement: '<blockquote>$1</blockquote>' },
  { name: 'list',       pattern: /^- (.+)$/gm,          replacement: '<li>$1</li>' },
] as const satisfies readonly Rule[]

/** 有哪几种语法，由 RULES 说了算，不另外维护一份名单。 */
export type RuleName = (typeof RULES)[number]['name']

/** 每种语法一个开关，没写就是关。 */
export type RenderOptions = Partial<Record<RuleName, boolean>>
