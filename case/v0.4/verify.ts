/**
 * 第 06 章的核心断言：branches.ts 和 rules.ts 的输出逐字节一致。
 *
 * 如果这个断言不成立，那一章论证的「结构不同、行为相同」就站不住。
 *
 * 运行：npx tsx verify.ts
 */
import { render as branchRender } from './src/render/branches'
import { renderWith as ruleRender } from './src/render/rules'

const ALL_ON = {
  inlineCode: true, bold: true, strike: true, link: true, quote: true, list: true,
}

const samples = [
  '普通文本',
  '**加粗** 和 `行内代码`',
  '~~删除~~ 和 [链接](https://example.com)',
  '> 引用\n- 列表项一\n- 列表项二',
  '混合：**粗**里的`代码`，还有[链](http://a.b)和~~删~~',
  '未闭合的 **标记 和 `反引号',
  '<script>alert(1)</script>',
  '空字符串以外的边界：\n\n多段\n\n> 引用',
]

let failed = 0
for (const [i, text] of samples.entries()) {
  const a = branchRender(text, ALL_ON)
  const b = ruleRender(text, ALL_ON)
  if (a !== b) {
    failed++
    console.log(`✗ 样例 ${i + 1} 不一致`)
    console.log(`   输入: ${JSON.stringify(text)}`)
    console.log(`   分支版: ${a}`)
    console.log(`   数组版: ${b}`)
  }
}

// 开关组合也要一致
const optionSets = [
  { bold: true },
  { inlineCode: true, list: true },
  { quote: true, link: true },
  {},
  ALL_ON,
]
for (const opts of optionSets) {
  for (const text of samples) {
    if (branchRender(text, opts) !== ruleRender(text, opts)) {
      failed++
      console.log(`✗ 开关组合 ${JSON.stringify(opts)} 下样例不一致: ${JSON.stringify(text)}`)
    }
  }
}

// 光是「两版一致」不够——两版可能错得一模一样。
// 所以再断言一组期望输出。
const expected: [string, string][] = [
  ['**粗**', '<b>粗</b>'],
  ['`码`', '<code>码</code>'],
  ['~~删~~', '<s>删</s>'],
  ['[链](http://a.b)', '<a href="http://a.b">链</a>'],
  ['> 引用', '<blockquote>引用</blockquote>'],
  ['- 项', '<ul><li>项</li></ul>'],
  ['<script>', '&lt;script&gt;'],
]
for (const [input, want] of expected) {
  const got = branchRender(input, ALL_ON)
  if (got !== want) {
    failed++
    console.log(`✗ 期望输出不符：${JSON.stringify(input)}`)
    console.log(`   期望: ${want}`)
    console.log(`   实际: ${got}`)
  }
}

if (failed === 0) {
  console.log(`✓ ${samples.length} 个样例 × ${optionSets.length + 1} 组开关，输出全部一致；${expected.length} 组期望输出也相符`)
} else {
  // 抛异常而不是 process.exit，这样不需要 @types/node
  throw new Error(`✗ 共 ${failed} 处不一致`)
}
