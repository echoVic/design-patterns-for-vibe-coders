import type { Renderer } from './renderer'

/** 支持 **加粗** 和 `行内代码` 两种标记。 */
export class MarkdownRenderer implements Renderer {
  render(text: string): string {
    return text
      .replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
  }
}
