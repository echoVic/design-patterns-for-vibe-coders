#!/usr/bin/env node
/**
 * 按顺序把所有产物重新生成一遍。
 *
 * 为什么需要它：这几个脚本有依赖关系——PDF 是从 book.html 打的，
 * 改了正文只跑 build-pdf 会打出一份旧的。这里把顺序固定下来，
 * 并且每一步都从源码重新算，不依赖上一次的产物。
 *
 * 用法：node scripts/build-all.mjs
 */
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const steps = [
  ['figures.mjs', '插图'],
  ['cover.mjs', '封面'],
  ['build-book.mjs', '整本 markdown'],
  ['build-html.mjs', 'HTML'],
  ['build-pdf.mjs', 'PDF'],
  ['check-claims.mjs', '核对数字断言'],
]

for (const [script, label] of steps) {
  process.stdout.write(`\n── ${label} ──\n`)
  execFileSync(process.execPath, [join(root, 'scripts', script)], { stdio: 'inherit' })
}
console.log('\n✓ 全部完成。改完案例代码记得再跑一次 case/ 下的测试。')
