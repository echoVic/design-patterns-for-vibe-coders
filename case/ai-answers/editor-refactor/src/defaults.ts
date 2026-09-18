/**
 * 默认值 + 归一化 + 老签名兼容。
 *
 * 三件事都收在这一层，Editor 类只接受「已经归一好的」配置：
 * 以后新增选项，只需要在 DEFAULT_* 里加一行、在选项类型里加一个字段，
 * 调用方、Editor 构造函数、渲染层都不受影响。
 */

import {
  MARKDOWN_SYNTAX_PRESETS,
  resolveMarkdownSyntax,
  type MarkdownSyntax,
} from './markdown-syntax.js';
import type { Note } from './storage.js';
import {
  defaultThemeRegistry,
  resolveTheme,
  type ThemeRegistry,
} from './theme.js';
import {
  CONTENT_WIDTHS,
  CONTENT_WIDTH_PX,
  LEGACY_SYNTAX_SLOTS,
  type Appearance,
  type AppearanceOptions,
  type Behavior,
  type BehaviorOptions,
  type LegacyEditorArgs,
  type ResolvedEditorOptions,
  type EditorOptions,
} from './types.js';

export const DEFAULT_APPEARANCE: Appearance = {
  theme: 'light',
  fontSize: 16,
  lineHeight: 1.6,
  contentWidth: CONTENT_WIDTH_PX.standard,
};

export const DEFAULT_BEHAVIOR: Behavior = {
  autoSaveDelayMs: 500,
  maxNotes: 1000,
};

export const DEFAULT_SYNTAX: MarkdownSyntax = resolveMarkdownSyntax(
  { preset: 'basic' },
  MARKDOWN_SYNTAX_PRESETS.basic,
);

function isContentWidthName(value: string): value is (typeof CONTENT_WIDTHS)[number] {
  return (CONTENT_WIDTHS as readonly string[]).includes(value);
}

/** 内容宽度：具名档位 → 像素数；直接给数字就原样用。 */
export function resolveContentWidth(width: AppearanceOptions['contentWidth']): number {
  if (width === undefined) {
    return DEFAULT_APPEARANCE.contentWidth;
  }
  if (typeof width === 'number') {
    if (!Number.isFinite(width) || width <= 0) {
      throw new RangeError(`contentWidth 需要正的有限像素数，收到 ${width}`);
    }
    return width;
  }
  if (!isContentWidthName(width)) {
    throw new RangeError(`contentWidth 不是已知档位："${width}"`);
  }
  return CONTENT_WIDTH_PX[width];
}

export function normalizeAppearance(
  options: AppearanceOptions | undefined,
  registry: ThemeRegistry,
): Appearance {
  return {
    theme: resolveTheme(options?.theme, registry).name,
    fontSize: options?.fontSize ?? DEFAULT_APPEARANCE.fontSize,
    lineHeight: options?.lineHeight ?? DEFAULT_APPEARANCE.lineHeight,
    contentWidth: resolveContentWidth(options?.contentWidth),
  };
}

export function normalizeBehavior(options: BehaviorOptions | undefined): Behavior {
  return {
    autoSaveDelayMs: options?.autoSaveDelayMs ?? DEFAULT_BEHAVIOR.autoSaveDelayMs,
    maxNotes: options?.maxNotes ?? DEFAULT_BEHAVIOR.maxNotes,
  };
}

/** 把可能残缺的初始笔记补齐成 Note。 */
export function normalizeNotes(
  notes: readonly Partial<Note>[] | undefined,
  maxNotes: number,
): readonly Note[] {
  if (notes === undefined) {
    return [];
  }
  return notes.slice(0, maxNotes).map((note, index) => ({
    id: note.id ?? `note-${index + 1}`,
    title: note.title ?? '未命名',
    body: note.body ?? '',
    updatedAt: note.updatedAt ?? Date.now(),
  }));
}

/** 归一化入口：Editor 构造函数唯一信任的配置来源。 */
export function normalizeEditorOptions(options: EditorOptions): ResolvedEditorOptions {
  const storage = options.storage;
  const renderer = options.renderer;
  if (storage === null || storage === undefined) {
    throw new TypeError('Editor: 缺少必需的 storage');
  }
  if (renderer === null || renderer === undefined) {
    throw new TypeError('Editor: 缺少必需的 renderer');
  }

  const registry = options.registry ?? defaultThemeRegistry;
  const behavior = normalizeBehavior(options.behavior);
  const appearance = normalizeAppearance(options.appearance, registry);

  return {
    storage,
    renderer,
    registry,
    appearance,
    behavior,
    notes: normalizeNotes(options.notes, behavior.maxNotes),
  };
}

/** 把老的 12 位置参数翻译成新的 options。 */
export function legacyArgsToOptions(args: LegacyEditorArgs): EditorOptions {
  const [
    storage,
    renderer,
    theme,
    fontSize,
    lineHeight,
    contentWidth,
    autoSaveDelayMs,
    maxNotes,
    ...flags
  ] = args;

  // 老签名的最后 4 个 boolean，按 LEGACY_SYNTAX_SLOTS 的名字重建语法记录。
  const syntax: Record<string, boolean> = {};
  LEGACY_SYNTAX_SLOTS.forEach((feature, index) => {
    syntax[feature] = flags[index] ?? false;
  });

  return {
    storage,
    renderer,
    appearance: { theme, fontSize, lineHeight, contentWidth },
    behavior: { autoSaveDelayMs, maxNotes },
    syntax,
  };
}

/** 深合并一个 patch；只覆盖显式给出的组。 */
export function patchEditorOptions(
  current: ResolvedEditorOptions,
  patch: {
    readonly appearance?: AppearanceOptions;
    readonly behavior?: BehaviorOptions;
    readonly syntax?: Parameters<typeof resolveMarkdownSyntax>[0];
    readonly notes?: readonly Partial<Note>[];
  },
): ResolvedEditorOptions {
  const behavior = normalizeBehavior({ ...current.behavior, ...patch.behavior });

  return {
    storage: current.storage,
    renderer: current.renderer,
    registry: current.registry,
    appearance: normalizeAppearance(
      { ...current.appearance, ...patch.appearance },
      current.registry,
    ),
    behavior,
    notes: patch.notes === undefined
      ? current.notes.slice(0, behavior.maxNotes)
      : normalizeNotes(patch.notes, behavior.maxNotes),
  };
}
