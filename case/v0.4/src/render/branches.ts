/**
 * 分支堆积版：每加一种语法，就多一个 if。
 * 六种语法的时候已经要看两遍才知道顺序。
 */
export interface RenderOptions {
  bold?: boolean
  inlineCode?: boolean
  strike?: boolean
  list?: boolean
  quote?: boolean
  link?: boolean
}

const escape = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)

/** 属性值里的引号要单独挡：URL 拼进 href="..."，一个引号就能加出新属性。 */
const escapeAttr = (s: string): string => s.replace(/"/g, '&quot;')

/** 只放行 http(s)。 */
const isSafeUrl = (s: string): boolean => /^https?:\/\//i.test(s.trim())

export function render(text: string, options: RenderOptions): string {
  let html = escape(text)

  if (options.inlineCode) html = html.replace(/`(.+?)`/g, '<code>$1</code>')
  if (options.bold) html = html.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  if (options.strike) html = html.replace(/~~(.+?)~~/g, '<s>$1</s>')
  if (options.link) {
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, (whole, text, url) =>
      isSafeUrl(url) ? `<a href="${escapeAttr(url)}">${text}</a>` : whole)
  }
  if (options.quote) html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
  if (options.list) html = html.replace(/^- (.+)$/gm, '<li>$1</li>')

  return html
}
