/**
 * 差异化对拍：整理后的 render 和原来的 branches.ts，输出必须逐字节一致。
 *
 * 三种跑法，覆盖「顺序」和「开关」这两个容易改坏的地方：
 *   1. 固定样例 × 全部 64 种开关组合
 *   2. 随机拼出来的文本 × 随机开关组合
 *   3. 全开、全关两个极端
 *
 * 运行：esbuild parity.ts --bundle --outfile=parity.mjs --format=esm --platform=node && node parity.mjs
 */
import { render as originalRender } from '../../v0.4/src/render/branches'
import { RULES, render, type RenderOptions } from './index'

const SAMPLES = [
  '普通文本',
  '**加粗** 和 `行内代码`',
  '~~删除~~ 和 [链接](https://example.com)',
  '> 引用\n- 列表项一\n- 列表项二',
  '混合：**粗**里的`代码`，还有[链](http://a.b)和~~删~~',
  '未闭合的 **标记 和 `反引号',
  '<script>alert(1)</script>',
  '空字符串以外的边界：\n\n多段\n\n> 引用',
  '',
]

/** 第 n 种开关组合：n 的二进制位对应 RULES 里开着的规则。 */
function optionsFromMask(mask: number): RenderOptions {
  const options: RenderOptions = {}
  RULES.forEach((rule, i) => {
    options[rule.name] = (mask & (1 << i)) !== 0
  })
  return options
}

/** 固定种子的伪随机，跑多少次结果都一样。 */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TOKENS = [
  '**', '`', '~~', '[', ']', '(', ')', '>', '- ', ' ', '\n', '文本', 'a', 'http://a.b', '<b>', '&',
]

function randomText(rand: () => number): string {
  const length = Math.floor(rand() * 12)
  let out = ''
  for (let i = 0; i < length; i++) out += TOKENS[Math.floor(rand() * TOKENS.length)]
  return out
}

let checked = 0
let failed = 0

function compare(text: string, options: RenderOptions, label: string): void {
  const expected = originalRender(text, options)
  const actual = render(text, options)
  checked++
  if (expected !== actual) {
    failed++
    if (failed <= 5) {
      console.log(`✗ ${label}`)
      console.log(`   输入:   ${JSON.stringify(text)}`)
      console.log(`   开关:   ${JSON.stringify(options)}`)
      console.log(`   原实现: ${expected}`)
      console.log(`   新实现: ${actual}`)
    }
  }
}

// 1. 固定样例 × 全部开关组合
for (let mask = 0; mask < 1 << RULES.length; mask++) {
  const options = optionsFromMask(mask)
  for (const text of SAMPLES) compare(text, options, `样例 × mask=${mask}`)
}

// 2. 随机文本 × 随机开关组合
const rand = mulberry32(20240919)
for (let i = 0; i < 2000; i++) {
  compare(randomText(rand), optionsFromMask(Math.floor(rand() * 64)), `随机第 ${i} 条`)
}

// 3. 两个极端
for (const text of SAMPLES) {
  compare(text, optionsFromMask(0), '全关')
  compare(text, optionsFromMask((1 << RULES.length) - 1), '全开')
}

if (failed > 0) throw new Error(`✗ ${failed} / ${checked} 组输出不一致`)
console.log(`✓ ${checked} 组输入，整理后的实现与原实现输出逐字节一致`)
