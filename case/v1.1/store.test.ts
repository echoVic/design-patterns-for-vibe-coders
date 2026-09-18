/**
 * v1.1 的存储测试。
 *
 * 存在的意义有两个：
 *   1. 验证 NoteStore 接口的两个实现行为一致
 *   2. 它让 MemoryNoteStore 成为一个「真的在用」的第二实现，
 *      而不是一个为了凑数写出来的类
 *
 * 运行：见 case/package.json 的 test:v1.1
 */
import { MemoryNoteStore, createNote } from './src/store'
import type { NoteStore } from './src/store'

function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error('断言失败：' + msg)
}

async function run(name: string, store: NoteStore): Promise<void> {
  // 空的时候读出空数组
  assert((await store.all()).length === 0, `${name}: 初始应为空`)

  // 追加一条能读回来
  const a = createNote({ text: '第一条', createdAt: 1000, }, ['设计'])
  await store.append(a)
  const afterFirst = await store.all()
  assert(afterFirst.length === 1, `${name}: 追加后应有 1 条`)
  assert(afterFirst[0]!.text === '第一条', `${name}: 正文应读回`)

  // 新加的排在最前
  const b = createNote({ text: '第二条', createdAt: 2000, }, [])
  await store.append(b)
  const afterSecond = await store.all()
  assert(afterSecond[0]!.text === '第二条', `${name}: 新加的应排在最前`)
  assert(afterSecond[1]!.text === '第一条', `${name}: 旧的应在后面`)

  // 标签跟着走
  const second = afterSecond[1]
  assert(second !== undefined, `${name}: 旧笔记应还在`)
  assert(second.tags[0] === '设计', `${name}: 标签应保留`)

  // all() 返回的是快照：改它不该写穿到存储里
  const snapshot = await store.all()
  snapshot.push(createNote({ text: '外部塞进来的', createdAt: 1 }, []))
  // readonly 是编译期的；这里要测的是运行时对象是不是同一份
  if (snapshot[0]) (snapshot[0] as { text: string }).text = '被外部改掉了'
  const afterMutate = await store.all()
  assert(afterMutate.length === afterSecond.length, `${name}: 改快照不该影响条数`)
  assert(afterMutate[0]?.text !== '被外部改掉了', `${name}: 改快照不该写穿到存储`)

  // 契约是「最近追加的在前」，不是「createdAt 大的在前」。
  // 追加一条 createdAt 更早的，它仍然排在前面。
  const older = createNote({ text: '补录的旧笔记', createdAt: 500, }, [])
  await store.append(older)
  const afterOlder = await store.all()
  assert(afterOlder[0]?.text === '补录的旧笔记', `${name}: 后追加的应排在前面，与 createdAt 无关`)
}

// MemoryNoteStore：不需要浏览器
await run('MemoryNoteStore', new MemoryNoteStore())

// LocalNoteStore 需要 localStorage，在 Node 里给个最小替身
const store = new Map<string, string>()
;(globalThis as unknown as { localStorage: unknown }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => { store.set(k, v) },
}
const { LocalNoteStore } = await import('./src/store')
await run('LocalNoteStore', new LocalNoteStore())

// 脏数据：不是 JSON、不是数组、元素形状不对，都不该把列表带崩
const dirty: [string, string][] = [
  ['不是 JSON', '这不是 JSON{{{'],
  ['不是数组', '{"a":1}'],
  ['元素是数字', '[1,2,3]'],
  ['元素缺字段', '[{"id":"x"}]'],
  ['混着好坏', '[{"id":"a","text":"好","createdAt":1},{"bad":true}]'],
]
for (const [label, raw] of dirty) {
  const map = new Map<string, string>([['jot.notes', raw]])
  ;(globalThis as unknown as { localStorage: unknown }).localStorage = {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, v) },
  }
  const { LocalNoteStore: L } = await import('./src/store')
  const notes = await new L().all()
  assert(Array.isArray(notes), `脏数据「${label}」应回一个数组`)
  const good = label === '混着好坏' ? 1 : 0
  assert(notes.length === good, `脏数据「${label}」应留下 ${good} 条，实际 ${notes.length}`)
}
console.log('✓ 5 组脏数据都没有把列表带崩')

// 标签解析：不能把换行也压掉（列表和引用靠行首匹配）
const { parseTags } = await import('./src/tags')
const tagCases: [string, string, string][] = [
  ['标签前面是行首', '#设计 正文', '正文'],
  ['标签前面是空白', '正文 #设计', '正文'],
  ['URL 里的井号不算标签', '看 [文档](http://a.b#锚点) 里的', '看 [文档](http://a.b#锚点) 里的'],
  ['C# 不算标签', 'C#语言', 'C#语言'],
  ['标点留在正文', '#标签, 后面的字', ', 后面的字'],
]
for (const [label, raw, wantText] of tagCases) {
  const { text } = parseTags(raw)
  assert(text === wantText, `标签解析「${label}」：正文应为 ${JSON.stringify(wantText)}，实际 ${JSON.stringify(text)}`)
}
// 标签占整行时，trim 会收掉空行；关键是**行与行之间**的换行不能被压掉
const multi = parseTags('#设计\n- 列表项\n> 引用')
assert(multi.text === '- 列表项\n> 引用', `行间换行必须保留（列表和引用靠行首匹配），实际 ${JSON.stringify(multi.text)}`)
console.log('✓ 5 组标签解析 + 换行保留都对')

console.log('✓ 两个实现通过同一组断言：空了读空、追加能读回、最近追加的在前（与 createdAt 无关）、标签保留')
