export interface RenderOptions {
  inlineCode?: boolean
  bold?: boolean
  strike?: boolean
  link?: boolean
  quote?: boolean
  list?: boolean
}

export interface Rule {
  readonly name: keyof RenderOptions
  readonly label: string
  readonly apply: (html: string) => string
}

export const escapeHtml = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)

/** 数组顺序就是执行顺序：行内元素在前，块级在后。 */
export const rules: readonly Rule[] = [
  { name: 'inlineCode', label: '行内代码', apply: (h) => h.replace(/`(.+?)`/g, '<code>$1</code>') },
  { name: 'bold',       label: '加粗',     apply: (h) => h.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') },
  { name: 'strike',     label: '删除线',   apply: (h) => h.replace(/~~(.+?)~~/g, '<s>$1</s>') },
  { name: 'link',       label: '链接',     apply: (h) => h.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>') },
  { name: 'quote',      label: '引用',     apply: (h) => h.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>') },
  { name: 'list',       label: '列表',     apply: (h) => h.replace(/^- (.+)$/gm, '<li>$1</li>') },
]
