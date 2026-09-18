#!/usr/bin/env node
/**
 * 把 manuscripts/ 拼成一个可以在浏览器里读的 HTML（图片正常渲染）。
 *
 * 用法：node scripts/build-html.mjs
 * 产出：dist/book.html（单文件，图片走相对路径）
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
// marked 从同级仓库的 pnpm store 引入，避免这个仓库再装一遍依赖
import { marked } from '/Users/qingyun/Documents/GitHub/qingyun-blog/node_modules/.pnpm/marked@16.4.2/node_modules/marked/lib/marked.esm.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'manuscripts')
const out = join(root, 'dist')

const order = (n) => {
  const m = n.match(/^(\d{2})-/); if (m) return [0, m[1]]
  const a = n.match(/^附录([AB])-/); if (a) return [1, a[1]]
  return [2, n]
}
const files = (await readdir(src)).filter((f) => f.endsWith('.md'))
  .sort((a, b) => { const [x, y] = order(a), [p, q] = order(b); return x - p || (y < q ? -1 : y > q ? 1 : 0) })

const chapters = []
for (const f of files) {
  const md = await readFile(join(src, f), 'utf8')
  // 图片路径要相对 dist/ 修正
  chapters.push(marked.parse(md.replace(/\]\(figures\//g, '](../figures/')))
}

const CSS = `
:root{--ink:#1D1D1F;--soft:rgba(60,60,67,.72);--faint:rgba(60,60,67,.42);
  --line:rgba(60,60,67,.14);--card:#F5F5F7;--mint:#00A69E;--mintbg:rgba(0,199,190,.10);
  --sans:-apple-system,"SF Pro Text","PingFang SC","Helvetica Neue",sans-serif;
  --mono:"SF Mono",ui-monospace,Menlo,monospace}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#fff;color:var(--ink);font-family:var(--sans);
  -webkit-font-smoothing:antialiased;line-height:1.8}
main{max-width:720px;margin:0 auto;padding:56px 24px 120px}
h1{font-size:30px;font-weight:700;letter-spacing:-.02em;line-height:1.35;
  margin:0 0 28px;padding-top:8px}
h2{font-size:21px;font-weight:600;letter-spacing:-.012em;margin:52px 0 14px;line-height:1.5}
h3{font-size:17px;font-weight:600;margin:34px 0 10px}
p{margin:0 0 18px;color:var(--soft)}
strong{color:var(--ink);font-weight:600}
a{color:var(--mint);text-decoration:none}
ul,ol{margin:0 0 18px 22px;color:var(--soft)}
li{margin-bottom:7px}
blockquote{border-left:3px solid var(--mint);background:var(--mintbg);
  padding:14px 18px;border-radius:0 8px 8px 0;margin:0 0 20px}
blockquote p{margin:0;color:var(--ink)}
code{font-family:var(--mono);font-size:.88em;background:var(--card);
  padding:2px 6px;border-radius:5px;color:var(--mint)}
pre{background:var(--card);border-radius:12px;padding:18px 20px;overflow-x:auto;
  margin:0 0 22px;line-height:1.65}
pre code{background:none;padding:0;font-size:13px;color:var(--ink)}
img{display:block;max-width:100%;height:auto;margin:26px auto}
table{width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14.5px}
th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);color:var(--soft)}
th{color:var(--faint);font-weight:500;font-size:13px}
hr{border:0;border-top:1px solid var(--line);margin:64px 0}
hr + h1{margin-top:0}
.chapter-nav{font-size:13px;color:var(--faint);margin-bottom:8px;font-family:var(--mono)}
`

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>给 Vibe Coder 的设计模式</title>
<style>${CSS}</style>
</head><body><main>
${chapters.join('\n<hr>\n')}
</main></body></html>`

await mkdir(out, { recursive: true })
await writeFile(join(out, 'book.html'), html)
const plain = html.replace(/<[^>]+>/g, '').replace(/\s/g, '').length
console.log(`✓ dist/book.html  ${files.length} 章  ${(html.length / 1024).toFixed(0)} KB  正文约 ${plain} 字`)
