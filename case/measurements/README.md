# 实测记录

这里放的不是案例版本，是**为了量一个数字临时写出来、量完就撤掉的代码**。

和 `ai-answers/` 一样，它们的价值在于可复核：书里的数字都能在这儿对一遍。

## grow-to-three-modules —— 第 13 章

第 13 章讲参数透传。但 `v1.1` 的渲染在一个函数里，**没有这个场景**。所以照着「这个应用再长一截」的样子写了一版：加了设置面板、导出、统计三个模块，渲染拆成 `renderApp → renderSidebar → renderNoteList` 三层，一共 13 个文件 319 行。

**量完就撤了，没有进 `case/` 的版本列表。**

### 两个变体

两个目录只差环境（`env`）怎么进渲染函数：

- `variant-a-pass-env/` —— `env` 作为参数一路传下去
- `variant-b-inject-once/` —— `env` 在 `createViews(env)` 时传一次，之后被闭包接住

其余代码相同，包括数据的传法。

### 量出来的

| | 变体 A：一路传 | 变体 B：注入一次 |
|---|---|---|
| 中间层 `renderSidebar` 的签名 | `(state, env, handlers)` | `(state, handlers)` |
| 它的函数体里读了几次 `env` 的字段 | **0** | —— |
| 渲染链路上带 `env` 参数的函数 | 4 个 | 2 个（都只在创建时传一次） |
| `env` 的字段**被使用** | 3 次 | 3 次 |
| `env` **只是被往下搬** | **6 次** | 3 次 |

**环境的字段被用 3 次，被搬运 6 次——搬运是用它的两倍。** 其中 `renderApp` 一次没用、搬 2 次，`renderSidebar` 一次没用、搬 1 次。

### 数据那一侧，两种变体一样

```
变体 A  renderNoteList(notes, selectedId, env, handlers)
变体 B  renderNoteList(notes, selectedId, handlers)
```

环境在变体 B 里从签名消失了，**数据没有**。这是那一章要读者记住的区别。

### 怎么复核

两个变体都是从 `v1.1` 抄过来的（`store.ts`、`tags.ts`、`render/rules.ts`、`render/index.ts` 那几个没改动，为了省地方没放进来）。想跑起来的话把它们拷回来即可。

量数字用的是文本扫描，脚本不复杂：数每个函数签名里有没有 `env: Env`，再数函数体里 `env.` 出现了几次（使用）和 `env` 单独出现了几次（搬运）。
