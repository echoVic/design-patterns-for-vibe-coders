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
  const a = createNote({ text: '第一条', createdAt: 1000, pinned: false }, ['设计'])
  await store.append(a)
  const afterFirst = await store.all()
  assert(afterFirst.length === 1, `${name}: 追加后应有 1 条`)
  assert(afterFirst[0]!.text === '第一条', `${name}: 正文应读回`)

  // 新加的排在最前
  const b = createNote({ text: '第二条', createdAt: 2000, pinned: false }, [])
  await store.append(b)
  const afterSecond = await store.all()
  assert(afterSecond[0]!.text === '第二条', `${name}: 新加的应排在最前`)
  assert(afterSecond[1]!.text === '第一条', `${name}: 旧的应在后面`)

  // 标签跟着走
  assert(afterSecond[1]!.tags[0] === '设计', `${name}: 标签应保留`)
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

console.log('✓ 两个实现通过同一组断言：空了读空、追加能读回、新的排最前、标签保留')
