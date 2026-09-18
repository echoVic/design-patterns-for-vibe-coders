# v0.2 —— 重构之后

同样的功能，从 44 行变成 7 个文件。这是「帮我重构得专业点」的典型产出。

```
src/types.ts                          13 行
src/storage/storage-provider.ts       13 行   ← 接口
src/storage/local-storage-provider.ts 24 行   ← 唯一的实现
src/domain/note-factory.ts            13 行   ← 造一个三字段对象
src/domain/note-repository.ts         15 行
src/domain/note-service.ts            23 行
src/main.ts                           47 行
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
