#!/usr/bin/env node
/**
 * 量一遍第 13 章用的那几个数字。
 *
 * 用法（在 case/measurements/grow-to-three-modules/ 下）：
 *   node measure.mjs
 *
 * 只做文本扫描，不跑代码：数每个函数签名里有没有 env: Env，
 * 再数函数体里 env 的字段被读了几次、env 只是被原样传了几次。
 */
import { readFile, readdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))

/** 把「函数体」粗切成从函数头到下一个同文件里的顶格函数。 */
function bodyOf(source, fnName) {
  const start = source.indexOf(`function ${fnName}(`)
  if (start < 0) return ''
  const rest = source.slice(start + 10)
  const next = rest.search(/\n(?:export )?function /)
  return next < 0 ? rest : rest.slice(0, next)
}

async function scan(dir) {
  const rows = []
  const walk = async (d) => {
    for (const e of await readdir(d, { withFileTypes: true })) {
      const p = join(d, e.name)
      if (e.isDirectory()) await walk(p)
      else if (e.name.endsWith('.ts')) {
        const src = await readFile(p, 'utf8')
        for (const m of src.matchAll(/(?:export )?function (\w+)\(([\s\S]*?)\)\s*:/g)) {
          const [, name, params] = m
          if (!params.includes('env: Env')) continue
          const body = bodyOf(src, name)
          const used = (body.match(/\benv\.\w+/g) ?? []).length
          const carried = (body.match(/\benv\b(?!\s*:)/g) ?? []).length - used
          rows.push({ name, params: params.replace(/\s+/g, ' ').trim(), used, carried })
        }
      }
    }
  }
  await walk(dir)
  return rows
}

function report(label, rows) {
  console.log(`\n${label}`)
  console.log(`  ${'函数'.padEnd(18)} ${'env 字段被用'.padStart(10)} ${'只是往下搬'.padStart(10)}`)
  for (const r of rows) {
    console.log(`  ${r.name.padEnd(18)} ${String(r.used).padStart(10)} ${String(r.carried).padStart(10)}`)
  }
  const u = rows.reduce((a, r) => a + r.used, 0)
  const c = rows.reduce((a, r) => a + r.carried, 0)
  console.log(`  ${'合计'.padEnd(18)} ${String(u).padStart(10)} ${String(c).padStart(10)}`)
  const mid = rows.find((r) => r.name === 'renderSidebar')
  if (mid) console.log(`  中间层签名：renderSidebar(${mid.params})  → 用到的 env 字段 ${mid.used} 个`)
}

const a = await scan(join(root, 'variant-a-pass-env'))
const b = await scan(join(root, 'variant-b-inject-once'))
report('变体 A：env 一路传下去', a)
report('变体 B：env 创建时注入一次', b)

console.log('\n书里的说法：环境字段被用 3 次，变体 A 搬 6 次、变体 B 搬 3 次。')
