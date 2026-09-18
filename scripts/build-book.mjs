#!/usr/bin/env node
/**
 * 把 manuscripts/ 下的章节按顺序拼成一本可以一次读完的书。
 *
 * 用法：node scripts/build-book.mjs
 * 产出：dist/book.md
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'manuscripts')
const out = join(root, 'dist')

const order = (name) => {
  const m = name.match(/^(\d{2})-/)
  if (m) return [0, m[1]]
  const a = name.match(/^附录([AB])-/)
  if (a) return [1, a[1]]
  return [2, name]
}
const cmp = (a, b) => {
  const [ga, ka] = order(a)
  const [gb, kb] = order(b)
  return ga - gb || (ka < kb ? -1 : ka > kb ? 1 : 0)
}

const files = (await readdir(src)).filter((f) => f.endsWith('.md')).sort(cmp)
if (files.length === 0) throw new Error('manuscripts/ 下没有章节')

const parts = []
for (const [i, f] of files.entries()) {
  parts.push((await readFile(join(src, f), 'utf8')).trim())
  if (i < files.length - 1) parts.push('\n\n---\n\n')
}

await mkdir(out, { recursive: true })
const book = parts.join('') + '\n'
await writeFile(join(out, 'book.md'), book)

console.log(`✓ dist/book.md  ${files.length} 章  ${book.replace(/\s/g, '').length} 字`)
for (const f of files) console.log(`    ${f}`)
