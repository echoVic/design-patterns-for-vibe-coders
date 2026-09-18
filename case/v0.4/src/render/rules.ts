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

/** 属性值里的引号要单独挡：URL 拼进 href="..."，一个引号就能加出新属性。 */
const escapeAttr = (s: string): string => s.replace(/"/g, '&quot;')

/** 只放行 http(s)。 */
const isSafeUrl = (s: string): boolean => /^https?:\/\//i.test(s.trim())

/** 规则的唯一来源。加一种语法在这里加一行。 */
export const rules = [
  { name: 'inlineCode', apply: (h: string) => h.replace(/`(.+?)`/g, '<code>$1</code>') },
  { name: 'bold',       apply: (h: string) => h.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') },
  { name: 'strike',     apply: (h: string) => h.replace(/~~(.+?)~~/g, '<s>$1</s>') },
  {
    name: 'link',
    apply: (h: string) =>
      h.replace(/\[(.+?)\]\((.+?)\)/g, (whole, text, url) =>
        isSafeUrl(url) ? `<a href="${escapeAttr(url)}">${text}</a>` : whole),
  },
  // 注意匹配的是转义后的 &gt;：render 先转义再套规则
  { name: 'quote',      apply: (h: string) => h.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>') },
  { name: 'list',       apply: (h: string) => h.replace(/^- (.+)$/gm, '<li>$1</li>') },
] as const satisfies readonly Rule[]

/** 开关名从表推导，不会再和规则表脱节。 */
export type RuleName = (typeof rules)[number]['name']

export type RenderOptions = Partial<Record<RuleName, boolean>>

const ALL_ON: RenderOptions = Object.fromEntries(rules.map((r) => [r.name, true]))

/** 渲染入口。加一种语法只改这个文件里的表。 */
export function renderWith(text: string, options: RenderOptions = ALL_ON): string {
  return rules
    .filter((rule) => options[rule.name])
    .reduce((html, rule) => rule.apply(html), escapeHtml(text))
}
