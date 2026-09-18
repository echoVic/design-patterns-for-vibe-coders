/**
 * 存储契约 + 一个内存实现。
 *
 * 构造函数瘦身的关键一步：把「协作对象」和「配置项」分开。
 * storage / renderer 是协作对象，永远只有两个，且不同实例天然不同；
 * 它们不该和 theme、字号这种「配置」挤在同一串位置参数里。
 */

export interface Note {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  /** epoch 毫秒 */
  readonly updatedAt: number;
}

/** 新增笔记时由 Editor 提供的字段，id 与时间戳由存储层补齐。 */
export type NoteDraft = Pick<Note, 'title' | 'body'>;

/** 预置数据：需要一个 id，时间戳可选。 */
export type NoteSeed = Pick<Note, 'id' | 'title' | 'body'> & Partial<Pick<Note, 'updatedAt'>>;

export interface EditorStorage {
  list(): Promise<readonly Note[]>;
  get(id: string): Promise<Note | undefined>;
  put(draft: NoteDraft): Promise<Note>;
  delete(id: string): Promise<void>;
}

/** 测试 / 演示用的实现，行为是完整的，不只是占位。 */
export class MemoryStorage implements EditorStorage {
  readonly #notes = new Map<string, Note>();
  #sequence = 0;

  constructor(seed: readonly NoteSeed[] = []) {
    for (const note of seed) {
      this.#notes.set(note.id, { updatedAt: Date.now(), ...note });
      this.#sequence += 1;
    }
  }

  async list(): Promise<readonly Note[]> {
    return [...this.#notes.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async get(id: string): Promise<Note | undefined> {
    return this.#notes.get(id);
  }

  async put(draft: NoteDraft): Promise<Note> {
    this.#sequence += 1;
    const note: Note = {
      id: `note-${this.#sequence}`,
      title: draft.title,
      body: draft.body,
      updatedAt: Date.now(),
    };
    this.#notes.set(note.id, note);
    return note;
  }

  async delete(id: string): Promise<void> {
    this.#notes.delete(id);
  }
}
