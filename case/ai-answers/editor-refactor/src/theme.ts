/**
 * 主题：把「dark / light / 自定义」收成一层可注册的具名资源。
 *
 * 以前 theme 是构造函数里的一个字符串字面量，加主题就得改构造函数；
 * 现在主题是数据，注册进 registry 就能用，构造函数不用动。
 */

/** 主题传给渲染层的设计令牌。 */
export interface Theme {
  /** 主题名；自定义主题必须自己给一个，注册表里的主题可以省。 */
  readonly name?: string;
  /** 基础色板。 */
  readonly palette: ThemePalette;
  /**
   * 任意扩展令牌（圆角、字体、阴影……）。
   * 渲染层把它当成 CSS 自定义属性写进容器，所以这里不需要改类型就能扩展。
   */
  readonly customProperties?: Readonly<Record<string, string>>;
}

export interface ThemePalette {
  readonly background: string;
  readonly foreground: string;
  readonly accent: string;
  readonly muted: string;
  readonly selection: string;
}

/** 打过 name 的主题，渲染层拿到的就是这一层。 */
export interface ResolvedTheme extends Theme {
  readonly name: string;
}

export type ThemeName = string;

export const DEFAULT_THEME_NAME = 'light';

export const lightTheme: ResolvedTheme = {
  name: 'light',
  palette: {
    background: '#ffffff',
    foreground: '#1f2328',
    accent: '#0969da',
    muted: '#6e7781',
    selection: '#ddf4ff',
  },
};

export const darkTheme: ResolvedTheme = {
  name: 'dark',
  palette: {
    background: '#0d1117',
    foreground: '#e6edf3',
    accent: '#4493f8',
    muted: '#8b949e',
    selection: '#1f3d63',
  },
};

/**
 * 主题注册表。`register` 是新增主题的唯一入口，
 * 调用方不需要碰 Editor 的任何类型或构造函数。
 */
export class ThemeRegistry {
  readonly #themes = new Map<ThemeName, ResolvedTheme>();

  constructor(initial: readonly ResolvedTheme[] = [lightTheme, darkTheme]) {
    for (const theme of initial) {
      this.#themes.set(theme.name, theme);
    }
  }

  register(theme: Theme): ResolvedTheme {
    if (theme.name === undefined || theme.name.trim() === '') {
      throw new Error('registerTheme: 主题必须带一个非空的 name');
    }
    const resolved: ResolvedTheme = { ...theme, name: theme.name };
    this.#themes.set(resolved.name, resolved);
    return resolved;
  }

  has(name: ThemeName): boolean {
    return this.#themes.has(name);
  }

  get(name: ThemeName): ResolvedTheme | undefined {
    return this.#themes.get(name);
  }

  names(): ThemeName[] {
    return [...this.#themes.keys()];
  }
}

/** 进程内默认注册表；也可以自己 new 一个传进 options.registry。 */
export const defaultThemeRegistry = new ThemeRegistry();

/**
 * 把一个 `Theme | ThemeName | undefined` 归一成 ResolvedTheme。
 * 未知主题名直接报错，而不是悄悄退回默认主题。
 */
export function resolveTheme(
  theme: Theme | ThemeName | undefined,
  registry: ThemeRegistry = defaultThemeRegistry,
): ResolvedTheme {
  if (theme === undefined) {
    const fallback = registry.get(DEFAULT_THEME_NAME);
    if (fallback === undefined) {
      throw new Error(`resolveTheme: 注册表里没有默认主题 "${DEFAULT_THEME_NAME}"`);
    }
    return fallback;
  }

  if (typeof theme === 'string') {
    const found = registry.get(theme);
    if (found === undefined) {
      const known = registry.names().join(', ');
      throw new Error(`resolveTheme: 未注册的主题 "${theme}"（已注册：${known}）`);
    }
    return found;
  }

  return { ...theme, name: theme.name ?? 'custom' };
}

/** 便利函数：造一个自定义主题。 */
export function createTheme(theme: Theme): Theme {
  return theme;
}
