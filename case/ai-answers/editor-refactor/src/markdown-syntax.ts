/**
 * Markdown 语法开关。
 *
 * 原来 bold / inlineCode / strikethrough / list 是四个位置参数，
 * 每加一条语法就要在构造函数屁股后面再添一个 boolean。
 * 现在语法开关是一个「记录」：键是语法名，值是开或关。
 * 加语法 = 在 MarkdownSyntaxRule 里加一个字面量（或运行时 registerSyntax），
 * 构造函数、options 类型、调用方一行都不用改。
 */

export const SYNTAX_FEATURES = ['bold', 'italic', 'inline-code', 'strikethrough', 'list'] as const;

export type SyntaxFeature = (typeof SYNTAX_FEATURES)[number];

const SYNTAX_FEATURE_SET: ReadonlySet<string> = new Set<string>(SYNTAX_FEATURES);

export function isSyntaxFeature(value: string): value is SyntaxFeature {
  return SYNTAX_FEATURE_SET.has(value);
}

/** 一套完整的语法开关状态：每个语法都有明确的开/关。 */
export type MarkdownSyntax = Readonly<Record<SyntaxFeature, boolean>>;

/** 用户传入的形状：可以只给关心的那几条。 */
export type MarkdownSyntaxOptions = Partial<Record<SyntaxFeature, boolean>>;

export type MarkdownSyntaxPreset = 'none' | 'basic' | 'gfm' | 'all';

/** 具名预设，比一串 boolean 更好读，也更好改。 */
export const MARKDOWN_SYNTAX_PRESETS: Readonly<Record<MarkdownSyntaxPreset, MarkdownSyntax>> = {
  none: { bold: false, italic: false, 'inline-code': false, strikethrough: false, list: false },
  basic: { bold: true, italic: true, 'inline-code': true, strikethrough: false, list: true },
  gfm: { bold: true, italic: true, 'inline-code': true, strikethrough: true, list: true },
  all: { bold: true, italic: true, 'inline-code': true, strikethrough: true, list: true },
};

/** 语法配置：预设打底，`enable` / `disable` 再逐条覆盖。 */
export interface MarkdownSyntaxConfig {
  readonly preset?: MarkdownSyntaxPreset;
  readonly enable?: readonly SyntaxFeature[];
  readonly disable?: readonly SyntaxFeature[];
}

export type MarkdownSyntaxInput = MarkdownSyntaxConfig | MarkdownSyntaxOptions;

/** 遍历语法记录时用的窄化视窗，避免 `Record` 索引访问被当成 `boolean | undefined`。 */
function entriesOf(syntax: MarkdownSyntax): Array<[SyntaxFeature, boolean]> {
  return Object.entries(syntax).filter(
    (entry): entry is [SyntaxFeature, boolean] =>
      typeof entry[1] === 'boolean' && isSyntaxFeature(entry[0]),
  );
}

function isConfig(input: MarkdownSyntaxInput): input is MarkdownSyntaxConfig {
  return 'preset' in input || 'enable' in input || 'disable' in input;
}

/** 把任意输入归一成完整的 MarkdownSyntax。 */
export function resolveMarkdownSyntax(
  input: MarkdownSyntaxInput | undefined,
  fallback: MarkdownSyntax,
): MarkdownSyntax {
  if (input === undefined) {
    return fallback;
  }

  if (!isConfig(input)) {
    return mergeMarkdownSyntax(fallback, input);
  }

  const base: MarkdownSyntax = input.preset === undefined
    ? fallback
    : MARKDOWN_SYNTAX_PRESETS[input.preset];

  const enable = input.enable ?? [];
  const disable = input.disable ?? [];
  const patch: MarkdownSyntaxOptions = {};
  for (const feature of enable) {
    patch[feature] = true;
  }
  for (const feature of disable) {
    patch[feature] = false;
  }
  return mergeMarkdownSyntax(base, patch);
}

/** 局部覆盖，未提到的语法沿用 base。 */
export function mergeMarkdownSyntax(
  base: MarkdownSyntax,
  patch: MarkdownSyntaxOptions | undefined,
): MarkdownSyntax {
  const result = { ...base };
  if (patch !== undefined) {
    for (const [feature, enabled] of entriesOf(patch)) {
      result[feature] = enabled;
    }
  }
  return Object.freeze(result);
}

/**
 * 挂在 Editor 上的语法插件。
 * 加一条语法插件不需要新的构造函数参数：`editor.extendSyntax({ ... })`。
 */
export interface MarkdownSyntaxPlugin {
  /** 查询开关状态，替代散落各处的 `options.bold` 之类。 */
  isEnabled(feature: SyntaxFeature): boolean;
  enabledFeatures(): SyntaxFeature[];
  /** 返回一个叠加了 patch 的新插件，原插件不变。 */
  extend(patch: MarkdownSyntaxOptions): MarkdownSyntaxPlugin;
  /** 供渲染层消费的快照。 */
  snapshot(): MarkdownSyntax;
}

class MarkdownSyntaxPluginImpl implements MarkdownSyntaxPlugin {
  readonly #syntax: MarkdownSyntax;

  constructor(syntax: MarkdownSyntax) {
    this.#syntax = syntax;
  }

  isEnabled(feature: SyntaxFeature): boolean {
    return this.#syntax[feature];
  }

  enabledFeatures(): SyntaxFeature[] {
    return entriesOf(this.#syntax)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature);
  }

  extend(patch: MarkdownSyntaxOptions): MarkdownSyntaxPlugin {
    return new MarkdownSyntaxPluginImpl(mergeMarkdownSyntax(this.#syntax, patch));
  }

  snapshot(): MarkdownSyntax {
    return this.#syntax;
  }
}

export function createSyntaxPlugin(syntax: MarkdownSyntax): MarkdownSyntaxPlugin {
  return new MarkdownSyntaxPluginImpl(syntax);
}
