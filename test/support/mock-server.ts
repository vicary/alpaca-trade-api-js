import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { Server } from "http";
import { apiError } from "./assertions";
import mockAlpaca from "./mock-alpaca";
import mockDataV2 from "./mock-data-v2";
import mockPolygon from "./mock-polygon";
import v1beta1 from "./mock-v1beta1";
import v1beta3 from "./mock-v1beta3";

/**
 * This server mocks http methods from the alpaca api and returns 200 if the requests are formed correctly.
 * Some endpoints might allow you to pass "cheat code" values to trigger specific responses.
 */

const PORT = process.env.TEST_PORT ? parseInt(process.env.TEST_PORT) : 3333;

interface CreateAlpacaMockOptions {
  port?: number;
}

function createAlpacaMock({
  port = PORT,
}: CreateAlpacaMockOptions = {}): Promise<Server> {
  const app = new Hono();

  app.route("/polygon", mockPolygon());
  app.route("/alpaca", mockAlpaca());
  app.route("/data", mockDataV2());
  app.route("/data", v1beta1());
  app.route("/data", v1beta3());

  app.notFound(() => {
    throw apiError(404, "route not found");
  });

  app.onError((err, c) => {
    const statusCode =
      (err as Error & { statusCode?: number }).statusCode || 500;
    return c.json({ message: err.message }, statusCode);
  });

  return new Promise((resolve) => {
    const server = serve({ fetch: app.fetch, port });
    // @hono/node-server starts listening immediately, but resolve on the next tick
    // to keep the same async contract as the old Express implementation.
    setImmediate(() => resolve(server));
  });
}

// promise of a mock alpaca server
let serverPromise: Promise<Server> | null = null;

export const start = (): Promise<Server> => {
  if (!serverPromise) serverPromise = createAlpacaMock();
  return serverPromise;
};

export const stop = (): Promise<void> => {
  if (!serverPromise) return Promise.resolve();
  return serverPromise
    .then(
      (server) => new Promise<void>((resolve) => server.close(() => resolve()))
    )
    .then(() => {
      serverPromise = null;
    });
};

export const getConfig = () => ({
  baseUrl: `http://localhost:${PORT}/alpaca`,
  dataBaseUrl: `http://localhost:${PORT}/data`,
  keyId: "test_id",
  secretKey: "test_secret",
});
