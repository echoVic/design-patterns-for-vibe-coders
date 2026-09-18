import type { Renderer } from './renderer'

/** 纯文本：只转义，不解析任何标记。 */
export class PlainRenderer implements Renderer {
  render(text: string): string {
    return text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)
  }
}
