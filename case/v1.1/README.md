# v1.1 —— 拆完

第 16 章的终点状态。六个文件，比 v0.2 少一个，比 v0.1 多五个。

```
src/types.ts     Note、NoteDraft
src/store.ts     NoteStore 接口（由使用方定义）+ 两个实现 + createNote
src/tags.ts      标签解析
src/render/rules.ts   六条规则，一个数组
src/render/index.ts   渲染入口
src/main.ts      界面 + 组装
```

## 和 v0.2 的关键差别

| | v0.2 | v1.1 |
|---|---|---|
| `NoteStore` 的消费者 | 1（NoteRepository） | 1（main.ts） |
| 接口形状 | 照抄 localStorage（同步 load/save） | 由使用方定义（异步 all/append） |
| 加一种语法 | 改 4 个文件 | 改 1 行（规则表加一项，开关类型自动跟着长） |
| 第二实现 | 不存在 | `MemoryNoteStore`，`store.test.ts` 真的在用 |
| 派生的「几 条」 | 单独一个 renderCount，会漏调 | 在唯一入口里算 |
| `NoteFactory` / `NoteRepository` / `NoteService` | 三个直通层 | 全部内联掉 |

## 唯一一个可以商量的地方

`store.ts` 里同时放了接口、两个实现、和 `createNote`。

有人说 `createNote` 该单独一个文件。按第 11 章的规矩：它是**同类改动**（加一个字段只改这里一处），所以放哪都便宜。**放在 store.ts 里是因为它和 Note 的创建语义最近，不是因为架构要求。**
