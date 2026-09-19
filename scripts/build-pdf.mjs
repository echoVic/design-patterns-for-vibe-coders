#!/usr/bin/env node
/**
 * 把 dist/book.html 打成 PDF。
 *
 * 用系统里的 Chrome 无头模式，不装任何依赖。
 * 排版由 build-html.mjs 里的 @media print 控制：目录和「回目录」在打印时隐藏，
 * 每章另起一页。
 *
 * 用法：node scripts/build-pdf.mjs
 * 产出：dist/book.pdf
 */
import { existsSync, statSync, unlinkSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'dist', 'book.html')
const out = join(root, 'dist', 'book.pdf')

const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
].find((p) => existsSync(p))

if (!CHROME) {
  console.error('✗ 找不到 Chrome / Chromium / Edge。装上其中一个再跑，或者直接把 dist/book.html 用浏览器打印成 PDF。')
  process.exit(1)
}
if (!existsSync(src)) {
  console.error('✗ 没有 dist/book.html，先跑 node scripts/build-html.mjs')
  process.exit(1)
}
if (existsSync(out)) unlinkSync(out)

execFileSync(CHROME, [
  '--headless',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--no-sandbox',
  '--virtual-time-budget=10000',   // 等 SVG 加载完再打，不然插图会缺
  `--print-to-pdf=${out}`,
  pathToFileURL(src).href,
], { stdio: ['ignore', 'ignore', 'pipe'], timeout: 180_000 })

if (!existsSync(out)) {
  console.error('✗ Chrome 没有产出 PDF')
  process.exit(1)
}
console.log(`✓ dist/book.pdf  ${(statSync(out).size / 1024 / 1024).toFixed(2)} MB`)
