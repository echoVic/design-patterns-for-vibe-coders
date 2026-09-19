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
 * 属性值里的引号也要挡掉。
 *
 * escapeHtml 只处理文本上下文，够不着属性：URL 是拼进 href="..." 的，
 * 一个 `"` 就能闭合引号，把后面的东西变成新属性。
 */
const escapeAttr = (s: string): string => s.replace(/"/g, '&quot;')

/** 只放行 http(s)，挡掉 javascript: 之类的伪协议。 */
const isSafeUrl = (s: string): boolean => /^https?:\/\//i.test(s.trim())

/**
 * 规则的唯一来源。加一种语法在这里加一行。
 *
 * 顺序是行为的一部分：行内规则在前，块级在后。
 */
export const rules = [
  { name: 'inlineCode', apply: (h: string) => h.replace(/`(.+?)`/g, '<code>$1</code>') },
  { name: 'bold',       apply: (h: string) => h.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') },
  { name: 'strike',     apply: (h: string) => h.replace(/~~(.+?)~~/g, '<s>$1</s>') },
  {
    name: 'link',
    apply: (h: string) =>
      h.replace(/\[(.+?)\]\((.+?)\)/g, (whole, text, url) =>
        // 方案不安全就原样留着，不生成链接
        isSafeUrl(url) ? `<a href="${escapeAttr(url)}">${text}</a>` : whole),
  },
    // 注意匹配的是转义后的 &gt;：render 先转义再套规则
  { name: 'quote',      apply: (h: string) => h.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>') },
  {
    name: 'list',
    // 连续几行 - 要包进一个 <ul> 才成列表，不然 <li> 是悬空的
    apply: (h: string) =>
      h.replace(/(?:^- .+$\n?)+/gm, (block) =>
        '<ul>' + block.trimEnd().split('\n').map((l) => `<li>${l.slice(2)}</li>`).join('') + '</ul>'),
  },
] as const satisfies readonly Rule[]

/** 开关名从表推导，不会再和规则表脱节。 */
export type RuleName = (typeof rules)[number]['name']

export type RenderOptions = Partial<Record<RuleName, boolean>>
