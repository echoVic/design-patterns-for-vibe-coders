# v0.3 —— 加渲染层

第 05 章的对照版本。要让笔记支持 `**加粗**` 和 `` `行内代码` ``，问一句「怎么重构成以后好加语法」，得到的是一个接口加两个实现类。

## 两份写法

```
src/render/renderer.ts            Renderer 接口（只有一个 render 方法）
src/render/plain-renderer.ts      PlainRenderer
src/render/markdown-renderer.ts   MarkdownRenderer
src/render/functions.ts           同一个东西，用函数写（18 行、一个文件）
src/render/index.ts               应用实际用的是类版
```

**三个文件 23 行 vs 一个文件 18 行，表达力相同。**

`functions.ts` 不是「简化版」，是同一件事的另一种写法：一个 `type Render = (text: string) => string`，加两个常量。第 05 章的结论是这一份更合适，所以 v0.4 里类版被删掉了。

## 第 05 章真正要问的

不是「哪个短」，是**这个接口比实现窄吗**。

`Renderer` 和 `MarkdownRenderer` 方法一一对应，而且只有一个方法——它连誊本都算不上，就是一个函数类型绕了个远路（第 04 章那个判断）。
