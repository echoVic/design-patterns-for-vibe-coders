/**
 * 第 04 章那个失败尝试的原始记录。
 *
 * 做法：把 LocalStorageProvider 复制一份，改名，把方法体换成 IndexedDB。
 * 第一次写出来就是这个样子，没有加任何类型断言。
 */
import type { StorageProvider } from './src/storage/storage-provider'
import type { Note } from './src/types'

export class IndexedDbProvider implements StorageProvider {
  // 想读笔记。IndexedDB 要开库、开事务、发请求，然后等 onsuccess。
  load(): Note[] {
    const request = indexedDB.open('jot', 1)
    let notes: Note[] = []
    request.onsuccess = () => {
      const tx = request.result.transaction('notes', 'readonly')
      const get = tx.objectStore('notes').getAll()
      get.onsuccess = () => { notes = get.result as Note[] }
    }
    return notes
  }

  // 想写笔记。同样要等，但接口说的是 void。
  save(notes: readonly Note[]): void {
    const request = indexedDB.open('jot', 1)
    request.onsuccess = () => {
      const tx = request.result.transaction('notes', 'readwrite')
      tx.objectStore('notes').put(notes)
    }
  }
}
