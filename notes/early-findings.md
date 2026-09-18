# 早期探索留下的两个发现

第一个案例（自动化引擎 `myflow`）后来被换掉了，但写它的过程撞出两个问题，在新案例里一样会出现，值得留着。

## ① 界面要读元数据，却被迫拖进服务端实现

编辑器的表单是由每个步骤自己声明的 `fields` 渲染出来的——所以界面必须导入步骤注册表。但注册表连着实现，而实现里有 `node:fs`、`node:child_process`，浏览器打包直接失败。

**修法**：把平台相关的导入从模块顶层下沉到 `run` 函数内部，改成惰性加载。

```ts
async run({ path, content }, ctx) {
  const { writeFile } = await import('node:fs/promises')   // ← 不在顶层
  ...
}
```

**结论**：为了让「声明」和「实现」共存于一个文件而不互相污染，**实现必须惰性化**。代价是每次调用都要走一次动态导入。

## ② 让上下文携带执行能力，代价比看起来大

嵌套步骤（条件里再包步骤）需要 `RunContext` 提供一个 `runSteps`，于是上下文从「数据 + log」变成「数据 + log + 一项能力」，runner 必须把自己注入进去，还要处理递归。

第一版写出来是这样：

```ts
{ ...ctx, runSteps: (s) => runSteps(s, registry, { ...ctx, runSteps: undefined as never }) }
```

那个 `undefined as never` 是坏味道——嵌套两层以上会出错。

**结论**：上下文一旦携带能力，就引入了一个绕回去的依赖。
