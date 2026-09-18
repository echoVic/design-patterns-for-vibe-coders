#!/usr/bin/env node
/**
 * 核对书里的数字断言。
 *
 * 起因：书里引用了 v1.1 的行数，改代码之后行数变了，书里没跟着改。
 * 这种漂移不会有任何报错，只有读者去数才发现。
 *
 * 用法：node scripts/check-claims.mjs
 */
import { readFile, readdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

async function countTs(dir, exclude = []) {
  const out = []
  const walk = async (d) => {
    for (const e of await readdir(d, { withFileTypes: true })) {
      const p = join(d, e.name)
      if (e.isDirectory()) await walk(p)
      else if (e.name.endsWith('.ts') && !exclude.some((x) => e.name.startsWith(x))) out.push(p)
    }
  }
  await walk(dir)
  let lines = 0
  for (const p of out) lines += (await readFile(p, 'utf8')).split('\n').length - 1
  return { files: out.length, lines }
}

const answers = {}
for (const d of ['branch-refactor', 'editor-refactor']) {
  answers[d] = await countTs(join(root, 'case', 'ai-answers', d))
}

const versions = {}
for (const v of ['v0.1', 'v0.2', 'v0.3', 'v0.4', 'v1.1']) {
  versions[v] = await countTs(join(root, 'case', v), ['attempt-', 'verify.'])
}

// 书里出现的、需要核对的数字
const claims = [
  { text: 'v0.1', kind: 'lines', version: 'v0.1' },
  { text: 'v0.2', kind: 'lines', version: 'v0.2' },
  { text: 'v0.2', kind: 'files', version: 'v0.2' },
  { text: 'v1.1', kind: 'files', version: 'v1.1' },
]

const docs = []
for (const f of await readdir(join(root, 'manuscripts'))) {
  if (f.endsWith('.md')) docs.push(join(root, 'manuscripts', f))
}
docs.push(join(root, 'README.md'), join(root, 'CHAPTERS.md'))

let bad = 0
const seen = new Set()
for (const d of docs) {
  const text = await readFile(d, 'utf8')
  for (const m of text.matchAll(/(\d+)\s*行/g)) {
    const n = Number(m[1])
    if (n < 20) continue
    const hits = [...Object.entries(versions), ...Object.entries(answers)].filter(([, v]) => v.lines === n)
    const known = [versions['v0.2'].lines - versions['v0.1'].lines, 107, 62, 39, 23, 12, 95]
    if (hits.length === 0 && !known.includes(n)) {
      const key = `${d}:${n}`
      if (!seen.has(key)) { seen.add(key); console.log(`  ✗ ${d.replace(root + '/', '')} 说「${n} 行」，没有哪个版本是这个数`); bad++ }
    }
  }
}

console.log('\n  案例各版本：')
for (const [v, s] of Object.entries(versions)) console.log(`    ${v}  ${s.files} 文件  ${s.lines} 行`)
console.log('\n  实验原件：')
for (const [k, s2] of Object.entries(answers)) console.log(`    ${k}  ${s2.files} 文件  ${s2.lines} 行`)
if (bad === 0) console.log('\n✓ 书里的行数断言全部对得上')
else { console.log(`\n✗ ${bad} 处对不上`); process.exitCode = 1 }
