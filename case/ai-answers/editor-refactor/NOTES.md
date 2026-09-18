# 为什么这样改

**一句话：把 12 个位置参数收进一个 options 对象，并按「协作对象 / 外观 / 行为 / 语法」四组分好。**

1. `storage` 和 `renderer` 是协作对象，位置固定、每个实例都不一样；`theme / fontSize / lineHeight / contentWidth` 是外观；`autoSaveDelayMs / maxNotes` 是行为；最后的四个 boolean 是语法开关。四类东西变的原因完全不同，挤在一串位置参数里就只能靠调用方写注释记住顺序。
2. 分组之后每一组都有自己的类型（`AppearanceOptions`、`BehaviorOptions`），全部可选并带默认值，加一个选项只需要在对应组的类型里加一行、在 `DEFAULT_*` 里填个默认值——构造函数、调用方、渲染层都不用动，这就是「以后好扩展」。
3. 语法开关我改成了一份带名字的记录（`syntax: { bold: true, 'inline-code': true }`），顺带给了 `preset / enable / disable` 三种写法；加一条新语法不需要再往构造函数屁股后面接一个 boolean，位置错一个就全错的问题也消失了。主题同理，从字符串字面量变成了可注册的资源，加主题不用改任何类型。
4. 归一化（默认值、主题解析、内容宽度换算、patch 合并）全部放在 `defaults.ts`，`Editor` 内部只认「已经补全的配置」，所以 `update()` 可以只传要改的那一组做增量覆盖。
5. 老的 12 参数签名我保留成了第二个重载，老调用方不用改，而且每个位置都有类型，写错顺序当场报错；新代码一律走 options。

**文件**：`src/types.ts`（对外类型）、`src/defaults.ts`（默认值与归一化）、`src/theme.ts`（主题注册表）、`src/markdown-syntax.ts`（语法开关与预设）、`src/storage.ts`（存储契约 + 内存实现）、`src/renderer.ts`（渲染契约 + DOM 实现）、`src/editor.ts`（`Editor` 本体）、`src/index.ts`（公开入口与工厂函数）、`src/example.ts`（新旧调用方对照，也是 tsc 回归用例）。

验证：`tsc --strict`（另加 `noUnusedLocals / noUnusedParameters / exactOptionalPropertyTypes / noUncheckedIndexedAccess`）对 `src/*.ts` 零报错。
