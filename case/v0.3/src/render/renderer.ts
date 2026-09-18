/** 把笔记正文渲染成 HTML。 */
export interface Renderer {
  render(text: string): string
}
