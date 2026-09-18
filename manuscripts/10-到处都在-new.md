# 到处都在 new

## 三处 new 了同一个东西

设置面板、导出、统计，三个新模块。

每个模块都要读笔记，于是各自的顶部都出现了同一行：

```ts
// settings-panel.ts
const storage = new LocalStorageProvider()

// export.ts
const storage = new LocalStorageProvider()

// stats.ts
const storage = new LocalStorageProvider()
```

加上 `main.ts` 里原有的那个，一共四个实例。

它们指向同一份 localStorage，所以看起来能用。

## 三个问题，都是真的

第一，配置会漂移。

`LocalStorageProvider` 的构造函数接受一个 key，默认 `'jot.notes'`。

导出模块的开发者想让导出只读一份快照，于是写了 `new LocalStorageProvider('jot.notes.snapshot')`。这个改动在导出模块里看起来完全合理，读代码的人也不会觉得有问题。

但它意味着导出和主界面读的不是同一份数据。这个 bug 很难查，因为两边各自都「工作正常」。

第二，状态会分裂。

`LocalStorageProvider` 现在是无状态的，四个实例没区别。但只要有人给它加一个缓存，比如记住上次读到的内容，四个实例就有四份缓存，互相不知道对方写了什么。

这不是假设。几乎所有的存储层最终都会加缓存。

第三，换不掉。

测试的时候你想用一个内存实现的存储，不碰真实 localStorage。现在有四个地方在 `new` 具体类，你得改四处。而且每加一个新模块就多一处。

## 最朴素的解法

在一个地方创建，然后传给需要它的人。

```ts
// main.ts —— 只在这里 new
const storage = new LocalStorageProvider()
const repository = new NoteRepository(storage)
const service = new NoteService(repository, new NoteFactory())

// 其他模块改成接受它
export function createSettingsPanel(service: NoteService) { /* ... */ }
export function createExporter(service: NoteService) { /* ... */ }
```

![左边是散落的创建：main.ts、settings-panel.ts、export.ts 三处各 new 一个 LocalStorageProvider；右边是组合根：只有 main.ts 创建一次，然后往外传。](figures/fig-10-composition-root.svg)

没有工厂，没有容器，没有注册表。**只有「谁负责创建」这一个决定被明确下来了。**

这个模式有个名字叫组合根（composition root）：**整个程序里只有一个地方知道怎么把东西拼起来，其他地方只管用。** 名字可以忘，那个决定不能忘。

## 这样改完，三个问题都消失了

配置漂移不存在了——只有一个地方传 key。

状态分裂不存在了——只有一个实例。

换不掉不存在了——测试里构造一个假的传进去就行：

```ts
const service = new NoteService(new NoteRepository(new FakeStorage()), new NoteFactory())
```

注意这里的成本：改动是「把 new 从模块顶部挪到 main.ts，把参数加进函数签名」。没有新增任何抽象。

## 什么时候真的需要工厂

如果创建过程本身有分支，工厂就成立了：

```ts
function createStorage(env: 'browser' | 'test'): StorageProvider {
  return env === 'test' ? new InMemoryProvider() : new LocalStorageProvider()
}
```

这个函数比散落的 `new` 好的地方在于：那个分支只写了一次。

除此之外，工厂还解决两种情况：

- 创建成本高，需要复用：比如一个东西初始化要 200 毫秒，你不能每个模块各建一个。这时候需要一个地方管着它。
- 创建需要多个步骤：比如要先读配置、再建连接、再等握手。这个过程本身是一个用例，值得有名字。

**除了这三种，工厂就是给 `new` 换了个名字。**

## 依赖注入容器呢

容器解决的是「依赖关系复杂到手动拼很痛苦」：几十个类，依赖图有好几层，手写 `main.ts` 会变成两百行。

速记应用有七个文件。手动拼是六行。

判断标准很直白：**你的组合根有多少行？** 摊开看一眼——如果能在屏幕上一次读完，手动拼就够了。读不完、要靠跳转才能理清依赖关系的时候，再考虑上容器。

还要注意容器引入的新成本：依赖关系从代码里挪到了配置里。你在 `main.ts` 里能看到谁依赖谁，用了容器之后要读一份配置或者靠约定。对一个小项目来说，这是净损失。

## 谬误与陷阱

用到它的地方自己 new 一个就行，反正没区别？现在没区别，因为 `LocalStorageProvider` 无状态。等它加了缓存、或者参数变了，区别就有了，而且那时已经散落在四个地方，改起来是四倍的活。

用单例模式，全局一个实例？单例能解决实例数量问题，但它把「谁创建」藏进了类自己，测试时换不掉。组合根解决同样的问题，还留着一个可以替换的入口。

模块顶部 new 一个，模块自己管，这叫高内聚？高内聚说的是模块内部的事归模块管，不是模块自己造依赖。自己造依赖恰恰是低内聚的表现：它把「这个模块需要什么」和「这个东西怎么造」两件事绑在一起了。

依赖注入太重了，要装框架？依赖注入是一件事，框架是另一件。**把创建挪到一个地方、把依赖写进参数，这就是依赖注入**，不需要任何库。
