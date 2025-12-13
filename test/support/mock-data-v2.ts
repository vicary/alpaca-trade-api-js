import { Hono } from "hono";
import { z } from "zod";
import {
  apiError,
  apiMethod,
  assertSchema,
  isoDatetime,
} from "./assertions.ts";

/**
 * This server mocks http methods from the alpaca data v2 api
 * and returns 200 if the requests are formed correctly.
 *
 * This only exports a router, the actual server is created by mock-server.js
 */

export default function createDataV2Mock() {
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
    "/stocks/:symbol/snapshot",
    apiMethod((req) => {
      if (req.params.symbol == null) {
        throw apiError(422);
      }
      return { ...snapshots[req.params.symbol as keyof typeof snapshots] };
    })
  );

  v2.get(
    "/stocks/snapshots",
    apiMethod((req) => {
      if (req.query.symbols == "") {
        throw apiError(422);
      }
      const syms = (req.query.symbols as string).split(",");
      const result = syms.map((s) => snapshots[s as keyof typeof snapshots]);
      return result;
    })
  );

  v2.get(
    "/stocks/:endpoint/latest",
    apiMethod((req) => {
      assertSchema(req.query, {
        symbols: z.string(),
        timeframe: z.string().optional(),
      });
      const endpoint = req.params.endpoint as keyof typeof latest;
      const response: Record<string, Record<string, unknown>> = {
        [endpoint]: {},
      };
      const symbols = (req.query.symbols as string).split(",");
      symbols.forEach((s) => {
        response[endpoint][s] = {};
      });
      let i = 0;
      for (const s in response[endpoint]) {
        response[endpoint][s] = latest[endpoint][i].data;
        i++;
      }
      return response;
    })
  );

  v2.get(
    "/stocks/:symbol/:endpoint",
    apiMethod((req) => {
      assertSchema(req.query, {
        start: isoDatetime,
        end: isoDatetime,
        limit: z.coerce.number().positive().min(1).max(10000).optional(),
        page_token: z.string().optional(),
        timeframe: z.string().optional(),
        adjustment: z.string().optional(),
      });
      const limit = req.query.limit
        ? Number(req.query.limit) > 5
          ? 5
          : Number(req.query.limit)
        : 5;
      let token: string | null = Number(req.query.limit) > 5 ? "token" : null;
      if (!req.query.limit || Number(req.query.limit) === 4) {
        token = "token";
      }
      const endpoint = req.params.endpoint as keyof typeof data;
      const response: Record<string, unknown> = {
        [endpoint]: [] as unknown[],
        symbol: req.params.symbol,
        next_page_token: token,
      };
      if (req.query.page_token) {
        response.next_page_token = null;
      }
      for (let i = 0; i < limit; i++) {
        (response[endpoint] as unknown[]).push(data[endpoint]);
      }
      return response;
    })
  );

  v2.get(
    "/stocks/:symbol/trades/latest",
    apiMethod((req) => {
      if (req.params.symbol !== latest.trades[0].symbol) {
        throw apiError(422);
      }
      return {
        symbol: latest.trades[0].symbol,
        trade: latest.trades[0].data,
      };
    })
  );

  v2.get(
    "/stocks/:symbol/quotes/latest",
    apiMethod((req) => {
      if (req.params.symbol !== latest.quotes[0].symbol) {
        throw apiError(422);
      }
      return {
        symbol: latest.quotes[0].symbol,
        quote: latest.quotes[0].data,
      };
    })
  );

  v2.get(
    "/stocks/:endpoint",
    apiMethod((req) => {
      assertSchema(req.query, {
        symbols: z.string(),
        start: isoDatetime,
        end: isoDatetime.optional(),
        feed: z.string().optional(),
        limit: z.coerce.number().positive().min(1).max(10000).optional(),
        page_token: z.string().optional(),
        timeframe: z.string().optional(),
        adjustment: z.string().optional(),
      });
      const endpoint = req.params.endpoint as keyof typeof data;
      const response: Record<string, unknown> = {
        [endpoint]: { FB: [] as unknown[], AAPL: [] as unknown[] },
        next_page_token: null,
      };
      const endpointData = response[endpoint] as Record<string, unknown[]>;
      for (const s in endpointData) {
        endpointData[s].push(data[endpoint]);
      }
      return response;
    })
  );

  return new Hono().route("/v2", v2);
}

const data = {
  trades: {
    t: "2021-02-08T09:00:19.932405248Z",
    x: "P",
    p: 136.68,
    s: 25,
    c: ["@", "T", "I"],
    i: 55,
    z: "C",
  },
  quotes: {
    t: "2021-02-08T09:02:07.837365238Z",
    ax: "P",
    ap: 136.81,
    as: 1,
    bx: "P",
    bp: 136.56,
    bs: 2,
    c: ["R"],
  },
  bars: {
    t: "2021-02-08T00:00:00Z",
    o: 136.11,
    h: 134.93,
    l: 136.9,
    c: 136.81,
    v: 31491496,
    vw: 136.0,
    n: 3000,
  },
};

const latest = {
  trades: [
    {
      symbol: "AAPL",
      data: {
        t: "2021-04-21T13:38:01.448130014Z",
        x: "V",
        p: 131.98,
        s: 200,
        c: ["@", "F"],
        i: 814,
        z: "C",
      },
    },
    {
      symbol: "FB",
      data: {
        t: "2021-04-21T13:38:01.448130014Z",
        x: "V",
        p: 131.98,
        s: 200,
        c: ["@", "F"],
        i: 814,
        z: "C",
      },
    },
  ],
  quotes: [
    {
      symbol: "FB",
      data: {
        t: "2021-04-21T13:38:02.663218404Z",
        ax: "V",
        ap: 317,
        as: 1,
        bx: "V",
        bp: 299.39,
        bs: 1,
        c: ["R"],
      },
    },
  ],
  bars: [
    {
      symbol: "SPY",
      data: {
        t: "2021-02-08T00:00:00Z",
        o: 136.11,
        h: 134.93,
        l: 136.9,
        c: 136.81,
        v: 31491496,
        vw: 136.0,
        n: 3000,
      },
    },
  ],
};

const snapshots = {
  FB: {
    symbol: "FB",
    latestTrade: {
      t: "2021-05-03T19:59:58.062211463Z",
      x: "V",
      p: 322.63,
      s: 130,
      c: ["@"],
      i: 7556,
      z: "C",
    },
    latestQuote: {
      t: "2021-05-03T20:00:00.000098746Z",
      ax: "V",
      ap: 0,
      as: 0,
      bx: "V",
      bp: 0,
      bs: 0,
      c: ["R"],
    },
    minuteBar: {
      t: "2021-05-03T19:59:00Z",
      o: 322.25,
      h: 322.63,
      l: 322.22,
      c: 322.63,
      v: 6394,
      vw: 322.0,
      n: 3000,
    },
    dailyBar: {
      t: "2021-05-03T04:00:00Z",
      o: 326.04,
      h: 328.37,
      l: 321.9,
      c: 322.63,
      v: 507529,
      vw: 324.0,
      n: 3000,
    },
    prevDailyBar: {
      t: "2021-04-30T04:00:00Z",
      o: 326.14,
      h: 329.78,
      l: 324.54,
      c: 324.89,
      v: 859473,
      vw: 325.0,
      n: 3000,
    },
  },
  AAPL: {
    symbol: "AAPL",
    latestTrade: {
      t: "2021-05-03T19:59:59.898542039Z",
      x: "V",
      p: 132.55,
      s: 100,
      c: ["@"],
      i: 12637,
      z: "C",
    },
    latestQuote: {
      t: "2021-05-03T21:00:00.006562245Z",
      ax: "V",
      ap: 0,
      as: 0,
      bx: "V",
      bp: 0,
      bs: 0,
      c: ["R"],
    },
    minuteBar: {
      t: "2021-05-03T19:59:00Z",
      o: 132.43,
      h: 132.55,
      l: 132.43,
      c: 132.55,
      v: 9736,
      vw: 132.0,
      n: 300,
    },
    dailyBar: {
      t: "2021-05-03T04:00:00Z",
      o: 132.04,
      h: 134.06,
      l: 131.83,
      c: 132.55,
      v: 1364180,
      vw: 132.0,
      n: 300,
    },
    prevDailyBar: {
      t: "2021-04-30T04:00:00Z",
      o: 131.8,
      h: 133.55,
      l: 131.07,
      c: 131.44,
      v: 2088793,
      vw: 132.0,
      n: 300,
    },
  },
};
