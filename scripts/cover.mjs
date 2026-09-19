#!/usr/bin/env node
/** 生成封面。视觉语言与 figures/ 一致。 */
import { writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'figures', 'cover.svg')
const C = { bg: '#FFFFFF', ink: '#1D1D1F', soft: 'rgba(60,60,67,.62)', faint: 'rgba(60,60,67,.28)',
            line: 'rgba(60,60,67,.14)', mint: '#00A69E', red: '#FF3B30' }
const F = '-apple-system,"SF Pro Text","PingFang SC","Helvetica Neue",sans-serif'

const W = 1200, H = 1600
const parts = []
const t = (x, y, s, o = {}) =>
  parts.push(`<text x="${x}" y="${y}" font-size="${o.fs ?? 22}" font-weight="${o.fw ?? 400}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? 'start'}" letter-spacing="${o.ls ?? 'normal'}">${s}</text>`)

// 三条曲线，作为封面的图形母题
const L = 140, R = 1060, TOP = 880, BOT = 1240
parts.push(`<path d="M${L},${TOP} L${L},${BOT} L${R},${BOT}" stroke="${C.line}" stroke-width="2" fill="none"/>`)
const P = (x, y) => `${x},${y}`
parts.push(`<path d="M${P(L + 30, BOT - 40)} C ${P(420, BOT - 34)} ${P(700, BOT - 140)} ${P(R - 60, BOT - 214)}" stroke="${C.mint}" stroke-width="3.5" fill="none"/>`)
parts.push(`<path d="M${P(L + 30, BOT - 250)} C ${P(450, BOT - 246)} ${P(700, BOT - 240)} ${P(R - 60, BOT - 234)}" stroke="${C.red}" stroke-width="3.5" fill="none" stroke-dasharray="10 7"/>`)
parts.push(`<path d="M${P(L + 30, BOT - 150)} C ${P(450, BOT - 154)} ${P(750, BOT - 158)} ${P(R - 60, BOT - 162)}" stroke="${C.ink}" stroke-width="3.5" fill="none"/>`)
t(R - 50, BOT - 220, 'v0.1', { fs: 20, fill: C.mint })
t(R - 50, BOT - 240, 'v0.2', { fs: 20, fill: C.red })
t(R - 50, BOT - 168, 'v1.1', { fs: 20, fill: C.ink })

// 标题区
t(140, 300, '给 Vibe Coder 的', { fs: 62, fw: 600, ls: '-1.5' })
t(140, 390, '设计模式', { fs: 92, fw: 700, ls: '-3' })
parts.push(`<path d="M140,440 L300,440" stroke="${C.mint}" stroke-width="4"/>`)
t(140, 520, 'AI 会写代码，', { fs: 30, fill: C.soft })
t(140, 566, '但不会判断结构值不值。', { fs: 30, fill: C.soft })
t(140, 680, '认出它 · 判断它 · 拆掉它', { fs: 26, fill: C.faint, ls: '1' })

// 底部
t(140, 1430, '青雲老哥', { fs: 32, fill: C.ink })
t(140, 1480, '17 章 + 2 附录', { fs: 24, fill: C.faint })
t(140, 1520, '一个速记应用：1 个文件长到 7 个，再拆回 6 个', { fs: 24, fill: C.faint })

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<title>给 Vibe Coder 的设计模式</title>
<rect width="${W}" height="${H}" fill="${C.bg}"/>
<g font-family='${F}'>${parts.join('')}</g>
</svg>`
await writeFile(OUT, svg)
console.log(`✓ figures/cover.svg  ${W}x${H}  ${svg.length}B`)
