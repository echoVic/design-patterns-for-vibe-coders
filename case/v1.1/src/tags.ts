/** 从正文里抽出 #标签，并从文本中移除它们。 */
export interface ParsedText {
  text: string
  tags: string[]
}

/**
 * 标签的写法：前面是行首或空白，`#` 后面跟着不含标点的一段。
 *
 * 两个约束都是必要的：
 *   - 前面要求空白，`http://a.b#锚点` 和 `C#语言` 里的 `#` 才不会被当成标签
 *   - 内容不含标点，`#标签,` 才只取到「标签」，逗号留给正文
 */
const TAG = /(^|\s)#([^\s#,.!?;:()[\]{}，。！？、；：（）【】《》"'“”‘’]+)/g

export function parseTags(raw: string): ParsedText {
  const tags = [...raw.matchAll(TAG)].map((m) => m[2]!)
  // 用同样的正则切掉标签本身，把前面的空白留在原处。
  // 注意只能压同一行里的连续空格——压掉换行会毁掉列表和引用（它们靠行首匹配）。
  const text = raw
    .replace(TAG, '$1')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trimEnd())
    .join('\n')
    .trim()
  return { text, tags }
}
