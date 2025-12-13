import { Hono } from "hono";
import { z } from "zod";
import { apiError, apiMethod, assertSchema } from "./assertions.ts";

/**
 * This server mocks http methods from the alpaca api and returns 200 if the requests are formed correctly.
 * Some endpoints might allow you to pass "cheat code" values to trigger specific responses.
 *
 * This only exports a router, the actual server is created by mock-server.js
 */

// certain endpoints don't accept ISO timestamps
const dateRegex = /^\d\d\d\d-\d\d-\d\d$/;

export default function createAlpacaMock() {
  const v2 = new Hono();

  v2.use("*", async (c, next) => {
    const keyId = c.req.header("APCA-API-KEY-ID");
    const secretKey = c.req.header("APCA-API-SECRET-KEY");
    if (!keyId || !secretKey || secretKey === "invalid_secret") {
      throw apiError(401);
    }
    await next();
  });

  v2.get(
    "/account",
    apiMethod(() => accountEntity)
  );

  v2.get(
    "/orders",
    apiMethod((req) => {
      assertSchema(req.query, {
        status: z.enum(["open", "closed", "all"]).optional(),
        limit: z.coerce.number().int().positive().max(500).optional(),
        after: z.string().datetime().optional(),
        until: z.string().datetime().optional(),
        direction: z.enum(["asc", "desc"]).optional(),
        nested: z.string().optional(),
        symbols: z.string().optional(),
      });
      return [orderEntity];
    })
  );

  v2.get(
    "/orders/:id",
    apiMethod((req) => {
      if (req.params.id === "nonexistent_order_id") throw apiError(404);
      return orderEntity;
    })
  );

  v2.get(
    "/orders:by_client_order_id",
    apiMethod((req) => {
      assertSchema(req.query, {
        client_order_id: z.string(),
      });
      return orderEntity;
    })
  );

  v2.post(
    "/orders",
    apiMethod((req) => {
      assertSchema(req.body, {
        symbol: z.string(),
        qty: z.number().positive().optional(),
        notional: z.number().positive().optional(),
        side: z.enum(["buy", "sell"]),
        type: z.enum(["market", "limit", "stop", "stop_limit"]),
        time_in_force: z.enum(["day", "gtc", "opg", "ioc", "fok"]),
        limit_price: z.number().positive().optional(),
        stop_price: z.number().positive().optional(),
        client_order_id: z.string().max(48).optional(),
      });
      const { symbol, type, limit_price, stop_price } = req.body;
      if (
        (type === "market" && (limit_price || stop_price)) ||
        ((type === "limit" || type === "stop_limit") && !limit_price) ||
        ((type === "stop" || type === "stop_limit") && !stop_price)
      ) {
        throw apiError(422);
      }
      if (symbol === "INSUFFICIENT") {
        throw apiError(403);
      }
      return orderEntity;
    })
  );

  v2.delete(
    "/orders/:id",
    apiMethod((req) => {
      if (req.params.id === "nonexistent_order_id") throw apiError(404);
      if (req.params.id === "uncancelable_order_id") throw apiError(422);
    })
  );

  v2.get(
    "/positions",
    apiMethod(() => [positionEntity])
  );

  v2.get(
    "/positions/:symbol",
    apiMethod((req) => {
      assertSchema(req.params, {
        symbol: z.string(),
      });
      if (req.params.symbol === "NONE") {
        throw apiError(404);
      } else if (req.params.symbol === "FAKE") {
        throw apiError(422);
      }
      return positionEntity;
    })
  );

  v2.get(
    "/assets",
    apiMethod((req) => {
      assertSchema(req.query, {
        status: z.enum(["active", "inactive"]).optional(),
        asset_class: z.string().optional(),
      });
      return [assetEntity];
    })
  );

  v2.get(
    "/assets/:symbol",
    apiMethod((req) => {
      assertSchema(req.params, { symbol: z.string() });
      if (req.params.symbol === "FAKE") {
        throw apiError(404);
      }
      return assetEntity;
    })
  );

  v2.get(
    "/calendar",
    apiMethod((req) => {
      assertSchema(req.query, {
        start: z.string().regex(dateRegex).optional(),
        end: z.string().regex(dateRegex).optional(),
      });
      return [calendarEntity];
    })
  );

  v2.get(
    "/clock",
    apiMethod(() => clockEntity)
  );

  v2.get(
    "/watchlists",
    apiMethod(() => [watchlistEntity])
  );

  v2.get(
    "/watchlists/:id",
    apiMethod((req) => {
      assertSchema(req.params, {
        id: z.string(),
      });
      if (req.params.id === "nonexistent_watchlist_id") {
        throw apiError(404);
      }
      return watchlistEntity;
    })
  );

  v2.post(
    "/watchlists",
    apiMethod((req) => {
      assertSchema(req.body, {
        name: z.string(),
        symbols: z.string().optional(),
      });
      return watchlistEntity;
    })
  );

  v2.post(
    "/watchlists/:id",
    apiMethod((req) => {
      assertSchema(req.params, {
        id: z.string(),
      });
      assertSchema(req.body, {
        symbol: z.string().optional(),
      });
      if (req.params.id === "nonexistent_watchlist_id") {
        throw apiError(404);
      }
      return watchlistEntity;
    })
  );

  v2.put(
    "/watchlists/:id",
    apiMethod((req) => {
      assertSchema(req.params, {
        id: z.string(),
      });
      assertSchema(req.body, {
        name: z.string().optional(),
        symbols: z.string().optional(),
      });
      if (req.params.id === "nonexistent_watchlist_id") {
        throw apiError(404);
      }
      return watchlistEntity;
    })
  );

  v2.delete(
    "/watchlists/:id",
    apiMethod((req) => {
      assertSchema(req.params, {
        id: z.string(),
      });
      if (req.params.id === "nonexistent_watchlist_id") {
        throw apiError(404);
      }
      return watchlistEntity;
    })
  );

  v2.delete(
    "/watchlists/:id/:symbol",
    apiMethod((req) => {
      assertSchema(req.params, {
        id: z.string(),
        symbol: z.string(),
      });
      if (req.params.id === "nonexistent_watchlist_id") {
        throw apiError(404);
      }
      if (req.params.symbol === "FAKE") {
        throw apiError(404);
      }
      return watchlistEntity;
    })
  );

  v2.notFound(() => {
    throw apiError(404, "route not found");
  });

  return new Hono().route("/v2", v2);
}

const accountEntity = {
  id: "904837e3-3b76-47ec-b432-046db621571b",
  status: "ACTIVE",
  currency: "USD",
  buying_power: "4000.32",
  cash: "4000.32",
  cash_withdrawable: "4000.32",
  portfolio_value: "4321.98",
  pattern_day_trader: false,
  trading_blocked: false,
  transfers_blocked: false,
  account_blocked: false,
  created_at: "2018-10-01T13:35:25Z",
};

const orderEntity = {
  id: "904837e3-3b76-47ec-b432-046db621571b",
  client_order_id: "904837e3-3b76-47ec-b432-046db621571b",
  created_at: "2018-10-05T05:48:59Z",
  updated_at: "2018-10-05T05:48:59Z",
  submitted_at: "2018-10-05T05:48:59Z",
  filled_at: "2018-10-05T05:48:59Z",
  expired_at: "2018-10-05T05:48:59Z",
  canceled_at: "2018-10-05T05:48:59Z",
  failed_at: "2018-10-05T05:48:59Z",
  asset_id: "904837e3-3b76-47ec-b432-046db621571b",
  symbol: "AAPL",
  exchange: "NASDAQ",
  asset_class: "us_equity",
  qty: "15",
  filled_qty: "0",
  type: "market",
  side: "buy",
  time_in_force: "day",
  limit_price: "107.00",
  stop_price: "106.00",
  filled_avg_price: "106.00",
  status: "accepted",
};

const positionEntity = {
  asset_id: "904837e3-3b76-47ec-b432-046db621571b",
  symbol: "AAPL",
  exchange: "NASDAQ",
  asset_class: "us_equity",
  avg_entry_price: "100.0",
  qty: "5",
  side: "long",
  market_value: "600.0",
  cost_basis: "500.0",
  unrealized_pl: "100.0",
  unrealized_plpc: "0.20",
  unrealized_intraday_pl: "10.0",
  unrealized_intraday_plpc: "0.0084",
  current_price: "120.0",
  lastday_price: "119.0",
  change_today: "0.0084",
};

const assetEntity = {
  id: "904837e3-3b76-47ec-b432-046db621571b",
  asset_class: "us_equity",
  exchange: "NASDAQ",
  symbol: "AAPL",
  status: "active",
  tradable: true,
};

const calendarEntity = {
  date: "2018-01-03",
  open: "09:30",
  close: "16:00",
};

const clockEntity = {
  timestamp: "2018-04-01T12:00:00.000Z",
  is_open: true,
  next_open: "2018-04-01T12:00:00.000Z",
  next_close: "2018-04-01T12:00:00.000Z",
};

const watchlistEntity = {
  account_id: "1d5493c9-ea39-4377-aa94-340734c368ae",
  assets: [
    {
      class: "us_equity",
      easy_to_borrow: true,
      exchange: "ARCA",
      id: "b28f4066-5c6d-479b-a2af-85dc1a8f16fb",
      marginable: true,
      shortable: true,
      status: "active",
      symbol: "SPY",
      tradable: true,
    },
    {
      class: "us_equity",
      easy_to_borrow: false,
      exchange: "NASDAQ",
      id: "f801f835-bfe6-4a9d-a6b1-ccbb84bfd75f",
      marginable: true,
      shortable: false,
      status: "active",
      symbol: "AMZN",
      tradable: true,
    },
  ],
  created_at: "2019-10-30T07:54:42.981322Z",
  id: "fb306e55-16d3-4118-8c3d-c1615fcd4c03",
  name: "Monday List",
  updated_at: "2019-10-30T07:54:42.981322Z",
};
