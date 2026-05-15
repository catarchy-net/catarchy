import type { TSchema } from "@sinclair/typebox";
import { t } from "elysia";

export interface PageQuery {
  page: number;
  size: number;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface CursorQuery {
  cursor?: string;
  limit: number;
}

export interface CursorResult<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface SortOption<T extends string = string> {
  field: T;
  direction: "asc" | "desc";
}

export interface SortQuery<T extends string = string> {
  sortBy?: SortOption<T>[];
}

export interface SearchQuery {
  search?: string;
  exact?: boolean;
}

interface FieldMeta {
  description?: string;
  examples?: unknown[];
}

export function pageQueryType({
  page = {},
  size = {},
}: {
  page?: FieldMeta;
  size?: FieldMeta;
} = {}) {
  return {
    page: t.Number({
      description: page.description ?? "Page number for pagination",
      examples: page.examples ?? [1],
    }),
    size: t.Number({
      description: size.description ?? "Number of items per page",
      examples: size.examples ?? [10],
    }),
  };
}

export function cursorQueryType({
  cursor = {},
  limit = {},
}: {
  cursor?: FieldMeta;
  limit?: FieldMeta;
} = {}) {
  return {
    cursor: t.Optional(
      t.String({
        description: cursor.description ?? "Cursor for pagination",
        ...(cursor.examples && { examples: cursor.examples }),
      }),
    ),
    limit: t.Number({
      description: limit.description ?? "Number of items to retrieve",
      examples: limit.examples ?? [10],
    }),
  };
}

export function sortQueryType<T extends string>(
  fields: T[],
  { sortBy = {} }: { sortBy?: FieldMeta } = {},
) {
  return {
    sortBy: t.Optional(
      t.Array(
        t.Object({
          field: t.Union(fields.map((f) => t.Literal(f))),
          direction: t.Union([t.Literal("asc"), t.Literal("desc")]),
        }),
        {
          description: sortBy.description,
          ...(sortBy.examples && { examples: sortBy.examples }),
        },
      ),
    ),
  };
}

export function searchQueryType({
  search = {},
  exact = {},
}: {
  search?: FieldMeta;
  exact?: FieldMeta;
} = {}) {
  return {
    search: t.Optional(
      t.String({
        description: search.description ?? "Search term for filtering results",
        ...(search.examples && { examples: search.examples }),
      }),
    ),
    exact: t.Optional(
      t.Boolean({
        description: exact.description ?? "Whether to perform an exact match search",
        ...(exact.examples && { examples: exact.examples }),
      }),
    ),
  };
}

export function pageResultType<T extends TSchema>(itemType: T) {
  return t.Object({
    items: t.Array(itemType),
    total: t.Number(),
    page: t.Number(),
    size: t.Number(),
  });
}

export function cursorResultType<T extends TSchema>(itemType: T) {
  return t.Object({
    items: t.Array(itemType),
    nextCursor: t.Optional(t.String()),
    hasMore: t.Boolean(),
  });
}
