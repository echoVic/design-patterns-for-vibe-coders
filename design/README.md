# 视觉基准

`note-app.html` 是全书截图的基准。打开就能看，左右两版（浅色 / 暗色）。

## 定下来的决定

```
色彩    Apple 语义色：systemGroupedBackground #F2F2F7
                     secondaryLabel rgba(60,60,67,.60)
                     systemMint #00C7BE
字体    -apple-system → SF Pro → PingFang SC；数字用 tabular-nums
结构    inset grouped 卡片；分隔线左端内缩 16px，scaleY(.5) 发丝线
编辑态  左侧 2.5px mint 竖条，不用背景色
动效    只有两处：输入光标闪烁、正在写圆点呼吸
暗色    纯黑底 + #1F1F22 卡片 + rgba(255,255,255,.07) 描边
```

## 两个踩过的坑

**① `--var` 的作用域是声明它的元素，不是使用它的元素。**

```css
body { color: var(--label) }   /* 在 body 上求值 */
.dk  { --label: #FFFFFF }      /* 只换变量，不换 color —— 子元素继承的是计算后的黑色 */
```

容器换主题时，**容器本身必须显式声明那些用到变量的属性**（color / background / border-color）。否则显式写了 `var(--x)` 的元素正常，没写的元素隐形。

症状：暗色卡片的大标题黑底黑字，看不见。

**② 用字符串替换改 CSS，多一个 `}` 会静默打掉后面的规则。**

`.wrap` 规则提前闭合，游离的 `}` 把紧随的 `.nav` 规则整个吃掉，导航栏失去 `display:flex`，图标竖着堆到左上角。

症状（图标跑位）和病因（前面两个规则的括号）隔得很远。改完 CSS 要数一遍 `{` 和 `}`。

## ③ 独立 SVG 是 XML，内联预览看不出的错误

生成插图的脚本里写了：

```js
const FONT = '-apple-system,"SF Pro Text","PingFang SC",...'
```

然后：

```js
font-family="${FONT}"     // ← 双引号属性里塞了带双引号的字体名
```

**HTML 解析器遇到这种情况会宽容地恢复，XML 直接报错。**

我把插图内联进一个临时 HTML 页面预览（当时是七张，现在八张），看起来都正常，于是以为没问题。等到把它们作为独立 `.svg` 文件加载时，浏览器报：

```
This page contains the following errors:
error on line 6 at column 197: attribute ...
```

修法：含引号的值一律用**单引号包裹属性**。

```js
font-family='${FONT}'     // XML 合法
```

**更重要的教训：预览方式必须和交付方式一致。** 内联进 HTML 预览，验证的是"HTML 解析器能读出什么"；作为独立文件交付，走的是 XML 解析。两者容错程度不同，前者会掩盖后者的错误。

自查一行：

```bash
python3 -c "import xml.dom.minidom,sys; xml.dom.minidom.parse(sys.argv[1])" figures/*.svg
```
