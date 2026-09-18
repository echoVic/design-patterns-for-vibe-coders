import type { Note } from '../types'

/**
 * 笔记的持久化接口。
 *
 * 把存储实现挡在接口之后，将来换 IndexedDB 或远端同步时，
 * 上层不需要改动。
 */
export interface StorageProvider {
  /** 读出全部笔记，按时间倒序。 */
  load(): Note[]

  /** 覆盖写入全部笔记。 */
  save(notes: readonly Note[]): void
}
