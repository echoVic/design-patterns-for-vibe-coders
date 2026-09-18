/**
 * 渲染契约 + 一个浏览器实现。
 *
 * 渲染层只接受「归一之后的设置对象」和「快照」，
 * 所以以后新增外观 / 行为选项时，改的是类型，不是方法签名。
 */

import type { SyntaxFeature } from './markdown-syntax.js';
import type { ResolvedTheme } from './theme.js';
import type { Appearance, Behavior, Note } from './types.js';

/** 交给渲染层的一份不可变快照。 */
export interface RenderModel {
  readonly notes: readonly Note[];
  readonly activeNoteId: string | undefined;
  readonly appearance: Readonly<Appearance>;
  readonly theme: ResolvedTheme;
  readonly syntax: readonly SyntaxFeature[];
  readonly autoSaveDelayMs: number;
}

export interface Renderer {
  /** 首次挂载。 */
  mount(model: RenderModel): void | Promise<void>;
  /** 整体重绘。 */
  render(model: RenderModel): void | Promise<void>;
  /** 只换外观（主题、字号、行距、内容宽度）。 */
  applyAppearance(appearance: Readonly<Appearance>, theme: ResolvedTheme): void;
  /** 打开 / 关闭一条 Markdown 语法。返回是否需要重绘。 */
  applySyntax(feature: SyntaxFeature, enabled: boolean): boolean;
  /** 释放资源。 */
  destroy(): void;
}

export interface DomRendererOptions {
  readonly container: HTMLElement;
}

/**
 * 一个真的能跑的极简实现：把令牌写成 CSS 变量，把语法状态挂到 data 属性。
 * 这里不追求功能完整，只保证接口闭环。
 */
export class DomRenderer implements Renderer {
  readonly #container: HTMLElement;
  readonly #syntaxElements = new Map<SyntaxFeature, HTMLElement>();

  constructor(options: DomRendererOptions) {
    this.#container = options.container;
  }

  mount(model: RenderModel): void {
    this.applyAppearance(model.appearance, model.theme);
    this.render(model);
  }

  render(model: RenderModel): void {
    this.applyAppearance(model.appearance, model.theme);
    this.#container.dataset['noteCount'] = String(model.notes.length);
    this.#container.dataset['activeNote'] = model.activeNoteId ?? '';
    this.#container.dataset['autoSaveDelayMs'] = String(model.autoSaveDelayMs);
  }

  applyAppearance(appearance: Readonly<Appearance>, theme: ResolvedTheme): void {
    const style = this.#container.style;
    const { palette, customProperties } = theme;

    style.setProperty('--editor-bg', palette.background);
    style.setProperty('--editor-fg', palette.foreground);
    style.setProperty('--editor-accent', palette.accent);
    style.setProperty('--editor-muted', palette.muted);
    style.setProperty('--editor-selection', palette.selection);

    for (const [name, value] of Object.entries(customProperties ?? {})) {
      style.setProperty(name.startsWith('--') ? name : `--${name}`, value);
    }

    style.setProperty('--editor-font-size', `${appearance.fontSize}px`);
    style.setProperty('--editor-line-height', String(appearance.lineHeight));
    style.setProperty('--editor-content-width', `${appearance.contentWidth}px`);
    this.#container.dataset['theme'] = theme.name;
  }

  applySyntax(feature: SyntaxFeature, enabled: boolean): boolean {
    this.#container.dataset[`syntax${feature}`] = enabled ? 'on' : 'off';
    const element = this.#syntaxElements.get(feature);
    if (element !== undefined) {
      element.hidden = !enabled;
    }
    // 语法开关只影响渲染细节，容器本身不用重绘。
    return false;
  }

  destroy(): void {
    this.#syntaxElements.clear();
  }
}
