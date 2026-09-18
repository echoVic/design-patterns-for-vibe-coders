import { MarkdownRenderer } from './markdown-renderer'
import { PlainRenderer } from './plain-renderer'
import type { Renderer } from './renderer'

/** 默认用 Markdown 渲染。 */
export function createRenderer(): Renderer {
  return new MarkdownRenderer()
}

export { PlainRenderer, MarkdownRenderer }
export type { Renderer }
