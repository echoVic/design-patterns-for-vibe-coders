# if-else 越写越长

## 从两种语法到六种

渲染器原本只支持加粗和行内代码。后来我想多加几种：删除线、链接、引用、列表，每种都能单独开关。

很自然地，就成了这样：

```ts
export function render(text: string, options: RenderOptions): string {
  let html = escape(text)

  if (options.inlineCode) html = html.replace(/`(.+?)`/g, '<code>$1</code>')
  if (options.bold)       html = html.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  if (options.strike)     html = html.replace(/~~(.+?)~~/g, '<s>$1</s>')
  if (options.link)       html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
  if (options.quote)      html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
  if (options.list)       html = html.replace(/^- (.+)$/gm, '<li>$1</li>')

  return html
}
```

六行 if，每行一个语法。它能跑，也不难读。 问题不在这儿。

## 两个问题

**第一个：顺序是隐含的。**

这六行是有顺序的，而且顺序有实际影响。行内代码要先于加粗处理，否则 `\`code\`` 会先被加粗规则吃掉。

但这个顺序只能通过「从上往下读」才知道。它对读者是隐式的，对修改者更危险——你想在中间插一条新规则，没有任何东西告诉你应该插在第几行。

**第二个：开关的名字和行为分在两处。**

`RenderOptions` 里声明一次 `bold?: boolean`，实现里再写一次 `if (options.bold)`。

这两处必须对得上。加了字段忘了写 if，语法永远不会生效；删了 if 忘了删字段，接口上还留着一个不存在的开关。编译器不会提醒你，因为两边都是合法的。

## AI 会给的答案

我把这段丢给 AI，说「分支太多了，帮我整理一下」。

它给了策略模式：抽一个 `SyntaxRule` 接口，每种语法一个类，再写一个注册器按顺序遍历。

从六个 if 变成七个文件。

这不算错。但它把一个局部问题（一个函数里六行 if）升级成了一个全局问题（七个文件、一个注册表、一层遍历）。你本来只需要读一个函数，现在要读七个文件才知道有哪些语法。

第 02 章那三笔开销，在这里全部兑现了：跳转从 0 变成 N，改动面从一个文件变成 N 个，还多了一堆「谁是第几个执行」的隐式约定。

## 分支变成数据

真正的整理方式不需要新类型。**把六个 if 变成一个数组。**

```ts
export interface Rule {
  readonly name: keyof RenderOptions
  readonly apply: (html: string) => string
}

export const rules: readonly Rule[] = [
  { name: 'inlineCode', apply: (h) => h.replace(/`(.+?)`/g, '<code>$1</code>') },
  { name: 'bold',       apply: (h) => h.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') },
  { name: 'strike',     apply: (h) => h.replace(/~~(.+?)~~/g, '<s>$1</s>') },
  { name: 'link',       apply: (h) => h.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>') },
  { name: 'quote',      apply: (h) => h.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>') },
  { name: 'list',       apply: (h) => h.replace(/^- (.+)$/gm, '<li>$1</li>') },
]

export function renderWith(text: string, options: RenderOptions): string {
  return rules
    .filter((rule) => options[rule.name])
    .reduce((html, rule) => rule.apply(html), escape(text))
}
```

![左边是六个 if，顺序只存在于代码的行序里；右边是六条规则组成的数组，顺序就是数组顺序，每一项旁边标着它第几个执行。加一条语法在左边要在中间找位置插进去，在右边只是加一个数组元素。](figures/fig-06-if-vs-rules.svg)

同样三十行左右，输出逐字节一致。案例里有对照脚本，你可以自己验一遍：

```bash
cd case && npm install && npm run verify:v0.4
```

它拿八个样例乘六组开关跑两遍，比对结果。**八乘六全部相同，才说明这两份是同一个东西。** 上面那两个问题也因此消失了。

顺序变成数据。 数组的顺序就是执行顺序。想插一条新规则，插在数组的哪一行就是第几个执行，看一眼就知道。还可以为这个顺序单独写断言。

名字和行为绑在一起。 每条规则是一个对象字面量，`name` 和 `apply` 在同一行里。它们不可能对不上——要对不上就得先把它俩拆开。

这套改法有个名字叫表驱动（table-driven），但名字不重要。要记住的是这个动作：

> **当一个 if-else 链的每个分支长得一模一样、只是数据不同的时候，它就该变成一个数组。**

## 那什么时候该用类

和第 05 章一样，只有那四种：需要多个操作、需要生命周期、需要身份、真的需要特化。

六条正则替换，一条都不占。

反过来说，如果一个 `if` 的每个分支做的事情结构不同——有的要发请求，有的要读文件，有的要递归——那它们本来就该是分开的东西，用类或者用函数都行。**判断依据是「分支长得像不像」，不是「分支有几个」。**

## 谬误与陷阱

分支多了就该上策略模式？分支多不多不是判据，分支同不同构才是。六个结构一样的分支，数组就够了；三个结构完全不同的分支，三个函数就够了。两者都不需要类。

把每个分支抽成一个类，将来好扩展？数一下扩展成本。数组版本加一种语法是加一个数组元素；类版本加一种语法是新加一个文件、改注册器、确认插入位置。一个变便宜了，一个变贵了。

表驱动不好调试？恰恰相反。数组可以打印、可以切片、可以在测试里换个顺序跑。六个 if 你只能一行行读，而且 `console.log` 要插六次。

反正能跑就行？这六行确实能跑。问题不在今天，在你三个月后想加第七种语法、又记不清该插在第几行的时候。
