/**
 * @nai/core — reusable NAI Analyst semantic + query + action core.
 *
 * Edition-agnostic: contains no Lateral (or Cashmere) specifics. Editions supply
 * a metric pack, a permission adapter and a LateralActionClient implementation.
 */
export * from './catalog.js';
export * from './ir.js';
export * from './planner.js';
export * from './compiler.js';
export * from './guard.js';
export * from './actions.js';
