/**
 * Generic tree search utilities for traversing hierarchical data structures.
 * Used for finding IndustryExpressions within Need trees.
 */

import type { Need, IndustryExpression } from "../types";

/**
 * Options for tree search operations
 */
export interface TreeSearchOptions {
  /** Whether to perform case-insensitive comparison for string matching */
  caseInsensitive?: boolean;
  /** Property name to use for children (default: 'children') */
  childrenKey?: string;
}

/**
 * Generic function to find a node in a tree by a predicate.
 *
 * @param nodes - Array of nodes to search
 * @param predicate - Function that returns true for matching node
 * @param getChildren - Function to get children of a node
 * @returns The matching node or null
 */
export function findInTree<T>(
  nodes: T[],
  predicate: (node: T) => boolean,
  getChildren: (node: T) => T[] | undefined
): T | null {
  for (const node of nodes) {
    if (predicate(node)) return node;
    const children = getChildren(node);
    if (children?.length) {
      const found = findInTree(children, predicate, getChildren);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Find all nodes in a tree that match a predicate.
 *
 * @param nodes - Array of nodes to search
 * @param predicate - Function that returns true for matching nodes
 * @param getChildren - Function to get children of a node
 * @returns Array of all matching nodes
 */
export function findAllInTree<T>(
  nodes: T[],
  predicate: (node: T) => boolean,
  getChildren: (node: T) => T[] | undefined
): T[] {
  const results: T[] = [];

  const search = (nodeList: T[]) => {
    for (const node of nodeList) {
      if (predicate(node)) results.push(node);
      const children = getChildren(node);
      if (children?.length) {
        search(children);
      }
    }
  };

  search(nodes);
  return results;
}

// ============ IndustryExpression-specific helpers ============

const getExpressionChildren = (expr: IndustryExpression): IndustryExpression[] | undefined =>
  expr.children;

/**
 * Find an IndustryExpression by ID within a list of expressions.
 */
export function findExpressionInList(
  expressions: IndustryExpression[],
  expressionId: string
): IndustryExpression | null {
  return findInTree(
    expressions,
    (expr) => expr.id === expressionId,
    getExpressionChildren
  );
}

/**
 * Find an IndustryExpression by name within a list of expressions.
 */
export function findExpressionByNameInList(
  expressions: IndustryExpression[],
  name: string,
  options: TreeSearchOptions = {}
): IndustryExpression | null {
  const { caseInsensitive = true } = options;
  const searchName = caseInsensitive ? name.toLowerCase().trim() : name.trim();

  return findInTree(
    expressions,
    (expr) => {
      const exprName = caseInsensitive
        ? expr.name.toLowerCase().trim()
        : expr.name.trim();
      return exprName === searchName;
    },
    getExpressionChildren
  );
}

/**
 * Find an IndustryExpression by ID within a Need's eras.
 */
export function findExpressionInNeed(
  need: Need,
  expressionId: string
): IndustryExpression | null {
  for (const era of need.eras) {
    const expressions = era.expressions as IndustryExpression[];
    if (!Array.isArray(expressions)) continue;

    const found = findExpressionInList(expressions, expressionId);
    if (found) return found;
  }
  return null;
}

/**
 * Find an IndustryExpression by name within a Need's eras.
 */
export function findExpressionByNameInNeed(
  need: Need,
  name: string,
  options: TreeSearchOptions = {}
): IndustryExpression | null {
  for (const era of need.eras) {
    const expressions = era.expressions as IndustryExpression[];
    if (!Array.isArray(expressions)) continue;

    const found = findExpressionByNameInList(expressions, name, options);
    if (found) return found;
  }
  return null;
}

/**
 * Get all expressions from a Need as a flat array.
 */
export function getAllExpressionsFromNeed(need: Need): IndustryExpression[] {
  const allExpressions: IndustryExpression[] = [];

  for (const era of need.eras) {
    const expressions = era.expressions as IndustryExpression[];
    if (!Array.isArray(expressions)) continue;

    const found = findAllInTree(
      expressions,
      () => true, // Match all
      getExpressionChildren
    );
    allExpressions.push(...found);
  }

  return allExpressions;
}

/**
 * Count all expressions in a Need (including nested children).
 */
export function countExpressionsInNeed(need: Need): number {
  return getAllExpressionsFromNeed(need).length;
}
