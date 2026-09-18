#!/usr/bin/env node
/**
 * 生成书里的插图。
 *
 * 视觉语言沿用 design/note-app.html 那套：Apple 语义色、发丝线、克制留白。
 * 关键约束：SVG 的 height 必须由布局结果推导，不能手填。
 * （手填过一次，三张图错两张，内容被裁掉。）
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'figures')

const C = {
  page: '#FFFFFF',
  ink: '#1D1D1F',
  soft: 'rgba(60,60,67,.60)',
  faint: 'rgba(60,60,67,.30)',
  line: 'rgba(60,60,67,.20)',
  card: '#F5F5F7',
  mint: '#00C7BE',
  mintInk: '#00A69E',
  mintBg: 'rgba(0,199,190,.10)',
  red: '#FF3B30',
  redBg: 'rgba(255,59,48,.08)',
}
const FONT = '-apple-system,"SF Pro Text","PingFang SC","Helvetica Neue",sans-serif'
const MONO = '"SF Mono",ui-monospace,Menlo,monospace'
const LH = 1.5

class Fig {
  constructor(w, title) { this.w = w; this.title = title; this.body = []; this.maxY = 0 }
  box(x, y, w, lines, o = {}) {
    const fs = o.fs ?? 15, pad = o.pad ?? 14
    const h = o.h ?? Math.round(pad * 2 + lines.length * fs * LH)
    const fill = o.fill ?? C.card
    const stroke = o.stroke ?? 'none'
    this.body.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx ?? 10}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`)
    lines.forEach((l, i) => {
      const ly = y + pad + i * fs * LH + fs * 0.78
      const x0 = o.center ? x + w / 2 : x + pad
      const anchor = o.center ? 'middle' : 'start'
      const cls = o.mono ? ` font-family="${MONO}"` : ''
      const col = (o.colors && o.colors[i]) ?? o.color ?? C.ink
      this.body.push(`<text x="${x0.toFixed(0)}" y="${ly.toFixed(0)}" font-size="${fs}" fill="${col}" text-anchor="${anchor}"${cls}>${l}</text>`)
    })
    this.maxY = Math.max(this.maxY, y + h)
    return h
  }
  note(x, y, text, o = {}) {
    const fs = o.fs ?? 13
    this.body.push(`<text x="${x}" y="${y}" font-size="${fs}" fill="${o.color ?? C.soft}" text-anchor="${o.anchor ?? 'start'}" font-family="${o.mono ? MONO : FONT}">${text}</text>`)
    this.maxY = Math.max(this.maxY, y + fs * 0.5)
    return y + fs * LH
  }
  arrow(x1, y1, x2, y2, o = {}) {
    const dash = o.dashed ? ' stroke-dasharray="4 4"' : ''
    this.body.push(`<path d="M${x1},${y1} L${x2},${y2}" stroke="${o.color ?? C.faint}" stroke-width="1.5" fill="none" marker-end="url(#ah)"${dash}/>`)
  }
  circle(cx, cy, r, fill) { this.body.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`) }
  async save(name, pad = 28) {
    const h = Math.round(this.maxY + pad)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${this.w}" height="${h}" viewBox="0 0 ${this.w} ${h}">
<title>${this.title}</title>
<defs><marker id="ah" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
<path d="M0,0 L7,3.5 L0,7" fill="none" stroke="${C.faint}" stroke-width="1.4"/></marker></defs>
<rect width="${this.w}" height="${h}" fill="${C.page}"/>
<g font-family='${FONT}'>${this.body.join('')}</g>
</svg>`
    await writeFile(join(OUT, name), svg)
    console.log(`  ✓ ${name}  ${this.w}x${h}  ${svg.length}B`)
  }
}

await mkdir(OUT, { recursive: true })

// ── 图 3-1：同一件事的两条路（第 01 章）─────────────────────
{
  const f = new Fig(760, '同一件事的两条路')
  f.note(24, 34, 'v0.1　保存一条笔记', { fs: 14, color: C.soft })
  f.box(24, 46, 300, ['main.ts'], { fill: C.mintBg, stroke: C.mint, center: true, h: 46 })
  f.note(24, 118, '1 个文件', { fs: 13, color: C.mintInk })
  f.note(24, 140, '跳转 0 次', { fs: 13, color: C.mintInk })

  f.note(420, 34, 'v0.2　保存一条笔记', { fs: 14, color: C.soft })
  const steps = ['main.ts', 'note-service.ts', 'note-repository.ts', 'local-storage-provider.ts']
  let y = 46
  steps.forEach((s, i) => {
    f.box(420, y, 300, [s], { fill: C.card, center: true, h: 40, mono: true, fs: 14 })
    if (i < steps.length - 1) f.arrow(570, y + 40, 570, y + 58)
    y += 58
  })
  f.note(420, y + 4, '4 个文件', { fs: 13, color: C.ink })
  f.note(420, y + 26, '跳转 3 次', { fs: 13, color: C.ink })
  await f.save('fig-01-two-paths.svg')
}

// ── 图 3-2：v0.2 的调用图，标出直通节点（第 03 章）────────────
{
  const f = new Fig(760, 'v0.2 的调用图')
  const B = 40
  f.box(300, 20, 160, ['main.ts'], { fill: C.mintBg, stroke: C.mint, center: true, h: B, mono: true, fs: 14 })
  f.arrow(380, 60, 380, 84)

  f.box(300, 84, 160, ['note-service.ts'], { fill: C.card, stroke: C.line, center: true, h: B, mono: true, fs: 13 })
  f.arrow(380, 124, 380, 148)
  f.arrow(300, 104, 190, 104)
  f.arrow(190, 104, 190, 148)

  f.box(300, 148, 160, ['note-repository.ts'], { fill: C.card, stroke: C.line, center: true, h: B, mono: true, fs: 13 })
  f.arrow(380, 188, 380, 212)
  f.box(300, 212, 160, ['storage-provider'], { fill: '#FFFFFF', stroke: C.line, center: true, h: B, mono: true, fs: 13, color: C.soft })
  f.arrow(380, 252, 380, 276)
  f.box(300, 276, 160, ['local-storage...'], { fill: C.card, center: true, h: B, mono: true, fs: 13 })

  f.box(110, 148, 160, ['note-factory.ts'], { fill: C.card, stroke: C.line, center: true, h: B, mono: true, fs: 13 })

  f.note(500, 104, '消费者只有一个', { fs: 12.5, color: C.faint })
  f.note(500, 168, 'add() 只调了 load 和 save', { fs: 12.5, color: C.ink })
  f.note(500, 186, '自己没做任何决定', { fs: 12.5, color: C.ink })
  f.note(500, 232, '接口，没有代码', { fs: 12.5, color: C.faint })
  f.note(500, 296, '唯一的实现', { fs: 12.5, color: C.faint })
  await f.save('fig-03-call-graph.svg')
}

// ── 图 16-1：抽象的收益曲线（第 16 章）──────────────────────
{
  const W = 760, TOP = 70, BOT = 330, L = 60, R = 700
  const f = new Fig(W, '抽象的收益曲线')
  // 轴标签横排放在左上，不占轴的空间
  f.note(L, 30, '加一个功能的成本', { fs: 13, color: C.faint })
  f.note(L, 52, '低 → 高', { fs: 12, color: C.faint })
  // 坐标轴
  f.body.push(`<path d="M${L},${TOP} L${L},${BOT} L${R},${BOT}" stroke="${C.line}" stroke-width="1.5" fill="none"/>`)

  const P = (x, y) => `${x},${y}`
  // v0.1 起点最低，但涨得最快，到右端仍低于 v0.2
  f.body.push(`<path d="M${P(L + 20, BOT - 20)} C ${P(280, BOT - 16)} ${P(430, BOT - 90)} ${P(R - 40, BOT - 150)}" stroke="${C.mintInk}" stroke-width="2.2" fill="none"/>`)
  // v0.2 起点就高，几乎不降
  f.body.push(`<path d="M${P(L + 20, BOT - 120)} C ${P(300, BOT - 116)} ${P(450, BOT - 112)} ${P(R - 40, BOT - 108)}" stroke="${C.red}" stroke-width="2.2" fill="none" stroke-dasharray="6 4"/>`)
  // v1.1 起点中等，最平
  f.body.push(`<path d="M${P(L + 20, BOT - 68)} C ${P(300, BOT - 70)} ${P(500, BOT - 72)} ${P(R - 40, BOT - 74)}" stroke="${C.ink}" stroke-width="2.2" fill="none"/>`)

  f.note(R - 32, BOT - 158, 'v0.1', { fs: 13, color: C.mintInk })
  f.note(R - 32, BOT - 116, 'v0.2', { fs: 13, color: C.red })
  f.note(R - 32, BOT - 82, 'v1.1', { fs: 13, color: C.ink })

  // 轴名与三行说明分层，不叠
  f.note((L + R) / 2, BOT + 26, '功能数量 →', { fs: 12.5, color: C.faint, anchor: 'middle' })
  f.note(L + 20, BOT + 56, '起点低，涨得快', { fs: 12.5, color: C.mintInk })
  f.note(310, BOT + 56, '起点就高，而且不降', { fs: 12.5, color: C.red })
  f.note(520, BOT + 56, '起点中等，最平', { fs: 12.5, color: C.ink })
  await f.save('fig-16-cost-curve.svg', 40)
}

// ── 图 06-1：六个 if 对六条规则（第 06 章）──────────────────
{
  const f = new Fig(760, '六个 if 与六条规则')
  f.note(24, 30, '分支版：顺序只存在于代码的行序里', { fs: 13.5, color: C.soft })
  const ifs = ['if (options.inlineCode)', 'if (options.bold)', 'if (options.strike)',
               'if (options.link)', 'if (options.quote)', 'if (options.list)']
  ifs.forEach((t, i) => {
    f.box(24, 44 + i * 34, 300, [t], { fill: C.card, h: 28, pad: 6, mono: true, fs: 12.5, rx: 6, color: C.soft })
  })
  f.note(24, 44 + 6 * 34 + 6, '加一条：要在中间找个位置插进去', { fs: 12.5, color: C.red })

  f.note(420, 30, '数组版：顺序就是数组顺序', { fs: 13.5, color: C.soft })
  const rules = ['inlineCode', 'bold', 'strike', 'link', 'quote', 'list']
  rules.forEach((t, i) => {
    f.box(420, 44 + i * 34, 200, [t], { fill: C.mintBg, h: 28, pad: 6, mono: true, fs: 12.5, rx: 6, color: C.mintInk })
    f.note(632, 63 + i * 34, ['第 1 个执行', '第 2 个', '第 3 个', '第 4 个', '第 5 个', '第 6 个'][i],
           { fs: 12, color: C.faint })
  })
  f.note(420, 44 + 6 * 34 + 6, '加一条：加一个数组元素', { fs: 12.5, color: C.mintInk })
  await f.save('fig-06-if-vs-rules.svg')
}

// ── 图 08-1：四层包装（第 08 章）────────────────────────────
{
  const f = new Fig(760, '四层包装')
  f.note(24, 30, '嵌套调用：顺序藏在括号里', { fs: 13.5, color: C.soft })
  f.box(24, 44, 700, ['withRetry( withLog( withUndo( withDebounce( rawSave, 400 ) ) ) )'],
        { fill: C.card, h: 52, center: true, mono: true, fs: 13.5, color: C.ink })
  f.note(24, 112, '从里往外读才知道顺序，而且改一层要动整行', { fs: 12.5, color: C.red })

  f.note(24, 156, '数组：顺序是数据', { fs: 13.5, color: C.soft })
  const layers = [
    ['withDebounce(.., 400)', '第 1 个执行', C.mintInk, C.mintBg],
    ['withUndo(..)', '第 2 个', C.ink, C.card],
    ['withLog(..)', '第 3 个 · 摘掉不影响行为', C.red, C.redBg],
    ['withRetry(.., 1)', '第 4 个', C.ink, C.card],
  ]
  layers.forEach(([t, label, col, bg], i) => {
    f.box(24, 170 + i * 42, 300, [t], { fill: bg, h: 34, pad: 8, mono: true, fs: 12.5, rx: 8, color: col })
    f.note(344, 192 + i * 42, label, { fs: 12.5, color: col })
  })
  f.note(24, 170 + 4 * 42 + 8, '顺序可以单独断言，每一层可以单独讨论', { fs: 12.5, color: C.mintInk })
  await f.save('fig-08-wrapping.svg')
}

// ── 图 10-1：三处 new 对一个组合根（第 10 章）────────────────
{
  const f = new Fig(760, '三处 new 对一个组合根')
  f.note(24, 30, '散落的创建：三处各 new 一个', { fs: 13.5, color: C.soft })
  ;[['main.ts', 44], ['settings-panel.ts', 104], ['export.ts', 164]].forEach(([t, y]) => {
    f.box(24, y, 200, [t], { fill: C.card, h: 40, center: true, mono: true, fs: 13 })
    f.arrow(224, y + 20, 268, y + 20)
    f.box(268, y, 180, ['new LocalStorage…'], { fill: C.redBg, h: 40, center: true, mono: true, fs: 11.5, color: C.red })
  })
  f.note(24, 216, '配置会漂移，状态会分裂，测试换不掉', { fs: 12.5, color: C.red })

  f.note(500, 30, '一个组合根', { fs: 13.5, color: C.soft })
  f.box(500, 44, 230, ['main.ts'], { fill: C.mintBg, stroke: C.mint, h: 40, center: true, mono: true, fs: 13, color: C.mintInk })
  f.arrow(615, 84, 615, 108)
  f.box(500, 108, 230, ['new LocalNoteStore()'], { fill: C.mintBg, h: 38, center: true, mono: true, fs: 11.5, color: C.mintInk })
  f.arrow(615, 146, 615, 170)
  f.box(500, 170, 230, ['界面 / 设置 / 导出'], { fill: C.card, h: 40, center: true, fs: 13 })
  f.note(500, 224, '只有这一处知道用的哪个实现', { fs: 12.5, color: C.mintInk })
  await f.save('fig-10-composition-root.svg', 40)
}

// ── 图 11-1：两类改动（第 11 章）────────────────────────────
{
  const f = new Fig(760, '两类改动')
  f.box(24, 30, 340, ['同类改动'], { fill: C.mintBg, h: 40, center: true, fs: 15, color: C.mintInk })
  f.note(24, 84, '再加一个已有维度里的东西', { fs: 13, color: C.soft })
  ;['加第五种语法', '加第四个导出格式', '加第三个存储实现'].forEach((t, i) => {
    f.box(24, 106 + i * 44, 340, [t], { fill: '#FFFFFF', stroke: C.line, h: 36, pad: 9, fs: 13.5 })
  })
  f.box(24, 246, 340, ['应该只改一两个文件'], { fill: C.mintBg, h: 40, center: true, fs: 13.5, color: C.mintInk })
  f.note(24, 302, '改到四个以上 → 那个维度缺一层抽象', { fs: 12.5, color: C.mintInk })

  f.box(420, 30, 316, ['新维度'], { fill: C.card, h: 40, center: true, fs: 15, color: C.ink })
  f.note(420, 84, '加一个以前没有的概念', { fs: 13, color: C.soft })
  ;['加标签', '加搜索', '加图片'].forEach((t, i) => {
    f.box(420, 106 + i * 44, 316, [t], { fill: '#FFFFFF', stroke: C.line, h: 36, pad: 9, fs: 13.5 })
  })
  f.box(420, 246, 316, ['穿过所有层是正常的'], { fill: C.card, h: 40, center: true, fs: 13.5, color: C.ink })
  f.note(420, 302, '改六个文件也不用慌', { fs: 12.5, color: C.soft })
  await f.save('fig-11-two-kinds-of-change.svg', 40)
}
