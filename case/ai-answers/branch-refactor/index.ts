/**
 * 整理后的实现，公开入口就三样东西：
 *
 *   render        渲染函数
 *   RULES         规则表（UI 想按语法生成开关，直接遍历它）
 *   RenderOptions 开关的类型
 *
 * 引擎不认识任何一种具体语法，加语法只改 rules.ts。
 */
export { render, escapeHtml } from './render'
export { RULES } from './rules'
export type { RenderOptions, Rule, RuleName } from './rules'
