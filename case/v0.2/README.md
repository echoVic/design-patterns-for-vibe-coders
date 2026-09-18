# v0.2 —— 重构之后

同样的功能，从 44 行 1 个文件，变成 149 行 7 个文件。这是「帮我重构得专业点」的典型产出。

```
src/types.ts                            15 行
src/storage/storage-provider.ts         15 行   ← 接口
src/storage/local-storage-provider.ts   21 行   ← 唯一的实现
src/domain/note-factory.ts              12 行   ← 造一个三字段对象
src/domain/note-repository.ts           15 行
src/domain/note-service.ts              29 行
src/main.ts                             42 行
                                       ─────
                                       149 行
```

**第 00 章要拆的就是这个。** 每个文件单看都合理，问题在结构上：

- `StorageProvider` 只有一个实现
- `NoteFactory` 做的事是 `{ id, text, createdAt }`
- `NoteRepository.add` 只是 `save([note, ...load()])`
- `NoteService.create` 只有两行

它们不是错，是**还没到用得上它们的规模**。

## 一个真实的副作用

逐行对比 v0.1 和 v0.2 会发现：**重构把 HTML 转义弄丢了。**

```
v0.1  main.ts 里 escapeHtml 用了 2 次
v0.2  src/main.ts 里用了 0 次
```

文件从 1 个变成 7 个、行数从 44 涨到 149，安全细节悄无声息地没了。这不是故意埋的——写 v0.2 时注意力全在分层上，那个函数就漏掉了。

**这正是 AI 重构真实会发生的事：你要求"结构更专业"，得到的是层数，丢的是细节。**

第 00 章可以用这个做论据——**判断一次重构好不好，不能只看它加了多少抽象，要看它有没有弄丢什么。**


## 附：第 04 章那次失败尝试的原件

`attempt-indexeddb.ts` 是照着 `LocalStorageProvider` 改写 IndexedDB 版本的第一稿。

**它通过类型检查。** 因为 `load()` 里的 `let notes: Note[] = []` 在函数返回前一直是空数组，`onsuccess` 回调填它的时候函数早就返回了。

结果是静默失败：调用方拿到空数组，页面显示「0 条」，不报错。

验证：

```bash
cd case && npx tsc --noEmit --strict --lib es2022,dom v0.2/attempt-indexeddb.ts
# 无输出 = 通过
```

这个文件是**留作证据的**，不参与主类型检查（它本来也不该被复用）。
