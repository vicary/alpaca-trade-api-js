import type { Handler } from "hono";
import type { ZodRawShape } from "zod";
import { z } from "zod";

interface ApiError extends Error {
  statusCode: number;
}

export interface MockRequest {
  query: Record<string, string>;
  params: Record<string, string>;
  body: unknown;
  get: (name: string) => string | undefined;
  method: string;
  url: string;
}

// ISO datetime regex that accepts various ISO 8601 formats including with milliseconds
const ISO_DATETIME_REGEX =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;

/**
 * A flexible ISO datetime string validator that accepts various ISO 8601 formats.
 * More permissive than z.string().datetime() to handle formats like:
 * - 2022-04-04
 * - 2022-04-04T00:00:00Z
 * - 2022-04-04T00:00:00.000Z
 * - 2022-04-04T00:00:00+00:00
 */
export const isoDatetime = z
  .string()
  .regex(ISO_DATETIME_REGEX, "Invalid ISO datetime");

export const apiError = (
  statusCode: number = 500,
  message: string = "Mock API Error"
): ApiError => {
  const err = new Error(message) as ApiError;
  err.statusCode = statusCode;
  return err;
};

// Wraps an API handler and returns JSON with status 200.
// If the handler returns undefined, responds with 204 (no content).
// Throws bubble up to the Hono app's onError handler.
export const apiMethod = <T>(
  fn: (req: MockRequest) => T | Promise<T>
): Handler => {
  return async (c) => {
    const url = new URL(c.req.url);
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    const params = c.req.param();

    let body: unknown = undefined;
    const method = c.req.method.toUpperCase();
    if (method !== "GET" && method !== "HEAD") {
      try {
        body = await c.req.json();
      } catch {
        body = undefined;
      }
    }

    const req: MockRequest = {
      query,
      params,
      body,
      get: (name: string) => c.req.header(name),
      method,
      url: c.req.url,
    };

    const result = await fn(req);
    if (result === undefined) {
      return c.body(null, 204);
    }
    return c.json(result as unknown, 200);
  };
};

// validates input against a Zod schema. Throws an apiError if it does not pass.
export const assertSchema = <T extends ZodRawShape>(
  value: unknown,
  schema: T
): z.infer<z.ZodObject<T>> => {
  const result = z.object(schema).safeParse(value);
  if (!result.success) {
    throw apiError(422, result.error.message);
  }
  return result.data;
};
