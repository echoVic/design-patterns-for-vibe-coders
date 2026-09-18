/**
 * 同一个东西，用函数表达。
 *
 * 这不是「简化版」——表达力完全相同，只是少了两层类型声明。
 */

/** 渲染一段正文为 HTML。 */
export type Render = (text: string) => string

const escape = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)

export const renderPlain: Render = (text) => escape(text)

export const renderMarkdown: Render = (text) =>
  escape(text)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
