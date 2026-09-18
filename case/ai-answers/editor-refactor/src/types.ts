/**
 * 所有对外类型都集中在这里。
 *
 * 核心手法：把 12 个位置参数拆成三个「有名字的组」——
 *   storage / renderer → 协作对象（依赖注入，位置固定且不常变）
 *   appearance        → 外观（主题、字号、行距、内容宽度）
 *   behavior          → 行为（自动保存延迟、笔记上限）
 *   syntax            → 语法开关（可增长的记录，不是一串 boolean）
 * 每个组内部都可以加字段，而调用方只写自己关心的那几个。
 */

import type { MarkdownSyntaxInput, SyntaxFeature } from './markdown-syntax.js';
import type { Renderer } from './renderer.js';
import type { EditorStorage, Note } from './storage.js';
import type { Theme, ThemeName, ThemeRegistry } from './theme.js';

/** 内容宽度的具名档位，也可以直接给像素数。 */
export const CONTENT_WIDTHS = ['narrow', 'standard', 'wide', 'full'] as const;

export type ContentWidthName = (typeof CONTENT_WIDTHS)[number];

export const CONTENT_WIDTH_PX: Readonly<Record<ContentWidthName, number>> = {
  narrow: 560,
  standard: 720,
  wide: 960,
  full: 1280,
};

/** 归一后的内容宽度：一定是像素数。 */
export type ContentWidth = number;

/** 归一后的外观设置。 */
export interface Appearance {
  readonly theme: ThemeName;
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly contentWidth: ContentWidth;
}

/** 外观设置的输入形状（全部可选，可增量覆盖）。 */
export interface AppearanceOptions {
  /** 注册过的主题名，或一个自定义主题对象。 */
  readonly theme?: Theme | ThemeName;
  readonly fontSize?: number;
  readonly lineHeight?: number;
  /** 具名档位、像素数，或历史值 `'auto'`（等同 standard）。 */
  readonly contentWidth?: ContentWidthName | ContentWidth | 'auto';
}

/** 归一后的行为设置。 */
export interface Behavior {
  /** 自动保存延迟，毫秒；0 表示只手动保存。 */
  readonly autoSaveDelayMs: number;
  /** 笔记数量上限。 */
  readonly maxNotes: number;
}

/** 行为设置的输入形状。 */
export type BehaviorOptions = Partial<Behavior>;

/** 构造 Editor 时的全部选项。storage / renderer 必填，其余都有默认值。 */
export interface EditorOptions {
  readonly storage: EditorStorage;
  readonly renderer: Renderer;
  /** 缺省用全局注册表；想隔离主题就自己传一个。 */
  readonly registry?: ThemeRegistry;
  readonly appearance?: AppearanceOptions;
  readonly behavior?: BehaviorOptions;
  /** 语法开关：给记录（只写关心的几条）或给 { preset, enable, disable }。 */
  readonly syntax?: MarkdownSyntaxInput;
  /** 初始笔记；缺省为空。 */
  readonly notes?: readonly Partial<Note>[];
}

/** 组级 patch，用于 update()。 */
export interface EditorOptionsPatch {
  readonly appearance?: AppearanceOptions;
  readonly behavior?: BehaviorOptions;
  readonly syntax?: MarkdownSyntaxInput;
  readonly notes?: readonly Partial<Note>[];
}

/** 归一后的完整配置，Editor 内部只认这个。 */
export interface ResolvedEditorOptions {
  readonly storage: EditorStorage;
  readonly renderer: Renderer;
  readonly registry: ThemeRegistry;
  readonly appearance: Appearance;
  readonly behavior: Behavior;
  readonly notes: readonly Note[];
}

/**
 * 老的 12 个位置参数，顺序原样保留，只作为兼容入口。
 * 第 6 个参数连历史上出现过的 `'auto'` 也一并接受。
 */
export type LegacyEditorArgs = readonly [
  storage: EditorStorage,
  renderer: Renderer,
  ...rest: [
    theme: Theme | ThemeName,
    fontSize: number,
    lineHeight: number,
    contentWidth: ContentWidthName | ContentWidth | 'auto',
    autoSaveDelayMs: number,
    maxNotes: number,
    bold: boolean,
    inlineCode: boolean,
    strikethrough: boolean,
    list: boolean,
  ],
];

/**
 * 把老签名的 4 个 boolean 语法参数对应回语法名。
 * 这个映射一旦写死，老调用方就永久可用；
 * 而新语法只出现在 MarkdownSyntaxRule 里，不需要在这里追加。
 */
export const LEGACY_SYNTAX_SLOTS = ['bold', 'inline-code', 'strikethrough', 'list'] as const satisfies
  readonly SyntaxFeature[];
