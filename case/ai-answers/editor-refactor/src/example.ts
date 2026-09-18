/**
 * 调用方对照。这个文件同时是 tsc 的回归用例。
 */

import {
  DomRenderer,
  Editor,
  MemoryStorage,
  ThemeRegistry,
  createTheme,
  type MarkdownSyntaxConfig,
  type ResolvedTheme,
  type Renderer,
} from './index.js';

declare const container: HTMLElement;

/** 真实项目里换成自己的渲染实现即可，Editor 只依赖这一个接口。 */
const renderer: Renderer = new DomRenderer({ container });

// ---------------------------------------------------------------- 改造前

const legacy = new Editor(
  new MemoryStorage(), // 存储
  renderer, // 渲染
  'dark', // 主题
  16, // 字号
  1.72, // 行距
  'auto', // 内容宽度（v0.4 里是字符串）
  400, // 自动保存延迟（毫秒）
  5000, // 最大笔记数
  true, // 语法：加粗
  true, // 语法：行内代码
  false, // 语法：删除线
  true, // 语法：列表
);

// ---------------------------------------------------------------- 改造后

const editor = new Editor({
  storage: new MemoryStorage([
    { id: 'welcome', title: '欢迎', body: '# 你好' },
  ]),
  renderer,
  // 只写跟默认值不一样的部分，其余自动取默认值
  appearance: {
    theme: 'dark',
    lineHeight: 1.72,
    contentWidth: 'wide', // 或者直接写 880
  },
  behavior: {
    autoSaveDelayMs: 400,
    maxNotes: 5000,
  },
  // 语法从「一串按顺序的 boolean」变成「一份带名字的记录」
  syntax: {
    bold: true,
    'inline-code': true,
    list: true,
    // strikethrough 不写，用默认值
  },
});

// 也可以整组给预设
const presetConfig: MarkdownSyntaxConfig = {
  preset: 'basic',
  disable: ['italic'],
};
void editor.update({ syntax: presetConfig });

// ---------------------------------------------------------------- 以后扩展

// 加主题：注册即可，构造函数、EditorOptions 一行都不用动。
const registry = new ThemeRegistry();
registry.register(
  createTheme({
    name: 'solarized',
    palette: {
      background: '#fdf6e3',
      foreground: '#657b83',
      accent: '#268bd2',
      muted: '#93a1a1',
      selection: '#eee8d5',
    },
    customProperties: { 'radius-md': '6px' },
  }),
);

const themed = new Editor({
  storage: new MemoryStorage(),
  renderer,
  registry,
  appearance: { theme: 'solarized' },
});

// 加语法：运行时叠加，不需要新的构造参数。
void themed.extendSyntax({ strikethrough: true, bold: false });

// 运行时改设置：只写要改的那一组。
void editor.update({
  appearance: { contentWidth: 'full', fontSize: 18 },
  behavior: { autoSaveDelayMs: 800 },
});

// 主题对象也可以直接内联传入。
const inlineTheme: ResolvedTheme = {
  name: 'inline',
  palette: {
    background: '#000',
    foreground: '#fff',
    accent: '#0af',
    muted: '#666',
    selection: '#036',
  },
};
void themed.setAppearance({ theme: inlineTheme });

export { editor, themed, legacy };
