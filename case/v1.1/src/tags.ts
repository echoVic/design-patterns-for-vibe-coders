/** 从正文里抽出 #标签，并从文本中移除它们。 */
export interface ParsedText {
  text: string
  tags: string[]
}

export function parseTags(raw: string): ParsedText {
  const tags = [...raw.matchAll(/#([^\s#]+)/g)].map((m) => m[1]!)
  return { text: raw.replace(/#[^\s#]+/g, '').trim(), tags }
}
