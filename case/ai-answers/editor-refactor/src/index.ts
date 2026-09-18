/**
 * 公开入口。
 *
 * 新代码：
 *   const editor = new Editor({ storage, renderer, appearance: { theme: 'dark' } });
 *
 * 老代码不用改（12 个位置参数仍然接受）：
 *   const editor = new Editor(storage, renderer, 'dark', 16, 1.72, 'auto', 400, 5000, true, true, false, true);
 */

export { Editor } from './editor.js';

export {
  DEFAULT_APPEARANCE,
  DEFAULT_BEHAVIOR,
  DEFAULT_SYNTAX,
  normalizeAppearance,
  normalizeBehavior,
  normalizeEditorOptions,
  normalizeNotes,
  patchEditorOptions,
  legacyArgsToOptions,
  resolveContentWidth,
} from './defaults.js';

export {
  MARKDOWN_SYNTAX_PRESETS,
  SYNTAX_FEATURES,
  createSyntaxPlugin,
  isSyntaxFeature,
  mergeMarkdownSyntax,
  resolveMarkdownSyntax,
  syntaxEntries,
} from './markdown-syntax.js';
export type {
  MarkdownSyntax,
  MarkdownSyntaxConfig,
  MarkdownSyntaxInput,
  MarkdownSyntaxOptions,
  MarkdownSyntaxPlugin,
  MarkdownSyntaxPreset,
  SyntaxFeature,
} from './markdown-syntax.js';

export { DomRenderer } from './renderer.js';
export type { DomRendererOptions, RenderModel, Renderer } from './renderer.js';

export { MemoryStorage } from './storage.js';
export type { EditorStorage, Note, NoteDraft } from './storage.js';

export {
  DEFAULT_THEME_NAME,
  ThemeRegistry,
  createTheme,
  darkTheme,
  defaultThemeRegistry,
  lightTheme,
  resolveTheme,
} from './theme.js';
export type {
  ResolvedTheme,
  Theme,
  ThemeName,
  ThemePalette,
} from './theme.js';

export { CONTENT_WIDTHS, CONTENT_WIDTH_PX, LEGACY_SYNTAX_SLOTS } from './types.js';
export type {
  Appearance,
  AppearanceOptions,
  Behavior,
  BehaviorOptions,
  ContentWidth,
  ContentWidthName,
  EditorOptions,
  EditorOptionsPatch,
  LegacyEditorArgs,
  ResolvedEditorOptions,
} from './types.js';

import { Editor } from './editor.js';
import type { EditorOptions } from './types.js';

/** 工厂函数：`createEditor` 让不需要 `new` 的调用方也能用。 */
export function createEditor(options: EditorOptions): Editor {
  return new Editor(options);
}
