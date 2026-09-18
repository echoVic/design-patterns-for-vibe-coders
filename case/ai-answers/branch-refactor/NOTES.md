# 重构说明

```
rules.ts    六条规则一张表 + 由表推导出的开关类型
render.ts   转义 + 渲染管线（唯一的分支是「开没开」）
index.ts    公开入口，导出 render / RULES / RenderOptions
parity.ts   与原实现逐字节对拍（2594 组输入，全部一致）
```

**核心思路：六个 `if` 的差异只有三件事——叫什么、匹配什么、换成什么。** 把这三件事写成一张表，顺序就是数组顺序，开关就是行的 `name`；剩下交给一个不认识任何语法的引擎：先转义一次，再把开了的规则依次叠上去，于是「加一种语法」从「加一个 `if`、再改一个 interface」变成「加一行」。

顺序也从语句的先后变成表的一部分被明确写出来：这里顺序确实影响输出（含反引号的加粗文本，必须先认出代码再包 `<b>`），原代码里这条隐含规则得读完整段才看得出来。

`RenderOptions` 由 `RULES` 推导（`as const satisfies` 加 `(typeof RULES)[number]['name']`），开关集合不会再和规则集合对不上；UI 若要按语法生成开关，遍历 `RULES` 即可。

我刻意没加的：`createRenderer(rules)` 这类自定义规则集、以及支持回调替换的 `replacement: string | ((...args: string[]) => string)`——两种都能一行加上，但现在没有第二个调用方，先加只是多一层要读的东西。公开签名仍是 `render(text, options)`，输出与原来逐字节一致。
