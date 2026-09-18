/**
 * Editor：构造函数从 12 个位置参数变成 1 个 options。
 *
 * 唯一保留的老入口是第二组参数（LegacyEditorArgs），
 * 这样老的 `new Editor(storage, renderer, 'dark', 16, ...)` 调用不用改；
 * 新代码一律走 options。
 */

import {
  normalizeEditorOptions,
  patchEditorOptions,
  legacyArgsToOptions,
  DEFAULT_SYNTAX,
} from './defaults.js';
import {
  createSyntaxPlugin,
  mergeMarkdownSyntax,
  resolveMarkdownSyntax,
  syntaxEntries,
  type MarkdownSyntax,
  type MarkdownSyntaxInput,
  type MarkdownSyntaxOptions,
  type MarkdownSyntaxPlugin,
  type SyntaxFeature,
} from './markdown-syntax.js';
import type { RenderModel, Renderer } from './renderer.js';
import type { EditorStorage, Note, NoteDraft } from './storage.js';
import { resolveTheme, type ResolvedTheme, type ThemeRegistry } from './theme.js';
import type {
  Appearance,
  AppearanceOptions,
  Behavior,
  EditorOptions,
  EditorOptionsPatch,
  LegacyEditorArgs,
  ResolvedEditorOptions,
} from './types.js';

export class Editor {
  readonly #storage: EditorStorage;
  readonly #renderer: Renderer;
  readonly #registry: ThemeRegistry;
  #options: ResolvedEditorOptions;
  #syntax: MarkdownSyntax;
  #syntaxPlugin: MarkdownSyntaxPlugin;
  #notes: Note[];
  #activeNoteId: string | undefined;
  #disposed = false;

  /** 新入口：一个具名分组的 options。 */
  constructor(options: EditorOptions);
  /** 旧入口：12 个位置参数，签名原样保留，内部翻译成 options。 */
  constructor(...legacyArgs: LegacyEditorArgs);
  constructor(optionsOrFirstArg: EditorOptions | LegacyEditorArgs[0], ...rest: unknown[]) {
    const options: EditorOptions = isEditorOptions(optionsOrFirstArg)
      ? optionsOrFirstArg
      : legacyArgsToOptions([optionsOrFirstArg, ...rest] as unknown as LegacyEditorArgs);

    const resolved = normalizeEditorOptions(options);

    this.#options = resolved;
    this.#storage = resolved.storage;
    this.#renderer = resolved.renderer;
    this.#registry = resolved.registry;
    this.#notes = [...resolved.notes];
    this.#activeNoteId = this.#notes[0]?.id;
    this.#syntax = resolveMarkdownSyntax(options.syntax, DEFAULT_SYNTAX);
    this.#syntaxPlugin = createSyntaxPlugin(this.#syntax);
  }

  // ---------------------------------------------------------------- 生命周期

  /** 挂载渲染层。第一次把快照交出去。 */
  async init(): Promise<void> {
    this.#assertAlive();
    await this.#renderer.mount(this.#snapshot());
  }

  /**
   * 从 storage 拉一次笔记，会受 behavior.maxNotes 截断。
   * 构造时传的 `notes` 只当首屏占位。
   */
  async loadNotes(): Promise<readonly Note[]> {
    this.#assertAlive();
    const stored = await this.#storage.list();
    this.#notes = stored.slice(0, this.#options.behavior.maxNotes).map((note) => ({ ...note }));
    this.#activeNoteId = this.#notes[0]?.id;
    await this.#renderer.render(this.#snapshot());
    return this.#notes;
  }

  async dispose(): Promise<void> {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#renderer.destroy();
  }

  // ---------------------------------------------------------------- 读

  get appearance(): Readonly<Appearance> {
    return this.#options.appearance;
  }

  get behavior(): Readonly<Behavior> {
    return this.#options.behavior;
  }

  get theme(): ResolvedTheme {
    return resolveTheme(this.#options.appearance.theme, this.#registry);
  }

  get syntax(): MarkdownSyntaxPlugin {
    return this.#syntaxPlugin;
  }

  get notes(): readonly Note[] {
    return this.#notes;
  }

  get activeNote(): Note | undefined {
    return this.#activeNoteId === undefined
      ? undefined
      : this.#notes.find((note) => note.id === this.#activeNoteId);
  }

  hasSyntax(feature: SyntaxFeature): boolean {
    return this.#syntax[feature];
  }

  canCreateNote(): boolean {
    return this.#notes.length < this.#options.behavior.maxNotes;
  }

  // ---------------------------------------------------------------- 写

  /** 增量更新：只写要改的那一组。 */
  async update(patch: EditorOptionsPatch): Promise<void> {
    this.#assertAlive();

    const previous = this.#options;
    this.#options = patchEditorOptions(previous, patch);

    if (patch.syntax !== undefined) {
      this.#syntax = resolveMarkdownSyntax(patch.syntax, this.#syntax);
      this.#syntaxPlugin = createSyntaxPlugin(this.#syntax);
      this.#applySyntaxDiff();
    }

    if (patch.notes !== undefined) {
      this.#notes = [...this.#options.notes];
      this.#activeNoteId = this.#notes[0]?.id;
    }

    await this.#renderer.render(this.#snapshot());
  }

  /** 换主题 / 字号 / 行距 / 内容宽度。 */
  async setAppearance(appearance: AppearanceOptions): Promise<void> {
    await this.update({ appearance });
  }

  /** 加一条语法，不需要动构造函数。 */
  async extendSyntax(patch: MarkdownSyntaxOptions): Promise<void> {
    this.#assertAlive();
    await this.update({ syntax: mergeMarkdownSyntax(this.#syntax, patch) });
  }

  /** 整体切到某个语法预设。 */
  async setSyntaxPreset(preset: MarkdownSyntaxInput): Promise<void> {
    await this.update({ syntax: preset });
  }

  async createNote(draft: NoteDraft): Promise<Note> {
    this.#assertAlive();
    if (!this.canCreateNote()) {
      throw new Error(`已达到笔记上限 ${this.#options.behavior.maxNotes}`);
    }
    const note = await this.#storage.put(draft);
    this.#notes = [note, ...this.#notes];
    this.#activeNoteId = note.id;
    await this.#renderer.render(this.#snapshot());
    return note;
  }

  async selectNote(id: string): Promise<Note | undefined> {
    this.#assertAlive();
    const note = this.#notes.find((candidate) => candidate.id === id);
    if (note === undefined) {
      return undefined;
    }
    this.#activeNoteId = note.id;
    await this.#renderer.render(this.#snapshot());
    return note;
  }

  // ---------------------------------------------------------------- 内部

  #snapshot(): RenderModel {
    return {
      notes: this.#notes,
      activeNoteId: this.#activeNoteId,
      appearance: this.#options.appearance,
      theme: this.theme,
      syntax: this.#syntaxPlugin.enabledFeatures(),
      autoSaveDelayMs: this.#options.behavior.autoSaveDelayMs,
    };
  }

  #applySyntaxDiff(): void {
    let needsRender = false;
    for (const [feature, enabled] of syntaxEntries(this.#syntax)) {
      if (this.#renderer.applySyntax(feature, enabled)) {
        needsRender = true;
      }
    }
    if (needsRender) {
      void this.#renderer.render(this.#snapshot());
    }
  }

  #assertAlive(): void {
    if (this.#disposed) {
      throw new Error('Editor 已 dispose，不能再使用');
    }
  }
}

function isEditorOptions(value: unknown): value is EditorOptions {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  // 新入口一定是 { storage, renderer, ... } 的形状；老入口第一参是 storage 实例。
  return 'storage' in value && 'renderer' in value;
}
