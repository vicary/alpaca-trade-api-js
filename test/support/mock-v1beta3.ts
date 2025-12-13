import { Hono } from "hono";
import { z } from "zod";
import {
  apiError,
  apiMethod,
  assertSchema,
  isoDatetime,
} from "./assertions.ts";

/**
 * This server mocks http methods from the alpaca crypto data api
 * and returns 200 if the requests are formed correctly.
 *
 * This only exports a router, the actual server is created by mock-server.js
 */

export default function createV1Beta3DataMock() {
  const v1beta3 = new Hono();

  v1beta3.use("*", async (c, next) => {
    const keyId = c.req.header("APCA-API-KEY-ID");
    const secretKey = c.req.header("APCA-API-SECRET-KEY");
    if (!keyId || !secretKey || secretKey === "invalid_secret") {
      throw apiError(401);
    }
    await next();
  });

  v1beta3.get(
    "/crypto/us/latest/:endpoint",
    apiMethod((req) => {
      assertSchema(req.query, {
        symbols: z.string(),
      });

      const endpoint = req.params
        .endpoint as keyof (typeof latestDataBySymbol)["BTC/USD"];
      const response: Record<string, Record<string, unknown>> = {
        [endpoint]: {},
      };
      response[endpoint]["BTC/USD"] = latestDataBySymbol["BTC/USD"][endpoint];
      response[endpoint]["ETH/USD"] = latestDataBySymbol["ETH/USD"][endpoint];
      return response;
    })
  );

  v1beta3.get(
    "/crypto/us/snapshots",
    apiMethod((req) => {
      if (req.query.symbols != ["BTC/USD"]) {
        throw apiError(422);
      }
      return { snapshots };
    })
  );

  v1beta3.get(
    "/crypto/us/:endpoint",
    apiMethod((req) => {
      if (req.query.exchanges) {
        throw apiError(400, "Unexpected query parameter(s): exchanges");
      }

      assertSchema(req.query, {
        symbols: z.string(),
        start: isoDatetime,
        end: isoDatetime.optional(),
        limit: z.coerce.number().int().min(0).max(10000).optional(),
        page_token: z.string().optional(),
        timeframe: z.string().optional(),
        adjustment: z.string().optional(),
      });

      const endpoint = req.params
        .endpoint as keyof (typeof dataBySymbol)["BTC/USD"];
      const symbols = req.query.symbols as keyof typeof dataBySymbol;
      const limit = req.query.limit
        ? Number(req.query.limit) > 5
          ? 5
          : Number(req.query.limit)
        : 3;

      const response: Record<string, unknown> = {
        next_page_token: Number(req.query.limit) > 5 ? "token" : null,
        [endpoint]: {
          [symbols]: [] as unknown[],
        },
      };

      const endpointData = response[endpoint] as Record<string, unknown[]>;
      for (let i = 0; i < limit; i++) {
        endpointData[symbols].push(dataBySymbol[symbols][endpoint]);
      }
      return response;
    })
  );

  return new Hono().route("/v1beta3", v1beta3);
}

const dataBySymbol = {
  "BTC/USD": {
    trades: {
      i: 60298833,
      p: 22953.74,
      s: 0.03508,
      t: "2023-02-06T00:00:00.644Z",
      tks: "S",
    },
    bars: {},
    quotes: {
      ap: 60849.5,
      as: 0.56,
      bp: 60772.395,
      bs: 0.5549,
      t: "2024-06-27T00:01:28.222959058Z",
    },
  },
  "ETH/USD": {
    bars: {
      t: "2021-08-10T05:01:00Z",
      o: 3102.24,
      h: 3106.23,
      l: 3096.31,
      c: 3105.92,
      v: 146.76170455,
      n: 238,
      vw: 3101.9215354394,
    },
  },
};

const latestDataBySymbol = {
  "BTC/USD": {
    trades: {
      trade: {
        t: "2021-09-10T12:24:14.739443152Z",
        p: 46170.9,
        s: 1.5922,
        tks: "",
        i: 0,
      },
    },
    quotes: {
      quote: {
        t: "2021-08-10T05:00:53.834Z",
        bp: 45499.94,
        bs: 0.0328,
        ap: 45499.95,
        as: 0.00054836,
      },
    },
    orderbooks: {
      a: [
        {
          p: 24586.351103,
          s: 11.675584469,
        },
        {
          p: 28098.11584,
          s: 11.68034972,
        },
      ],
      b: [
        {
          p: 24550.79941955,
          s: 11.623307521,
        },
        {
          p: 24030,
          s: 0.001,
        },
      ],
      t: "2023-04-04T09:28:39.116974285Z",
    },
  },
  "ETH/USD": {
    trades: {
      trade: {
        t: "2021-09-10T12:24:14.629Z",
        p: 46167.46,
        s: 0.00215922,
        tks: "B",
        i: 210078241,
      },
    },
    quotes: {
      quote: {
        t: "2021-08-10T05:00:59.668Z",
        bp: 3102.35,
        bs: 1.18895459,
        ap: 3102.6,
        as: 1,
      },
    },
    bars: {
      bar: {
        t: "2021-08-10T05:01:00Z",
        o: 3102.24,
        h: 3106.23,
        l: 3096.31,
        c: 3105.92,
        v: 146.76170455,
        n: 238,
        vw: 3101.9215354394,
      },
    },
    orderbooks: {
      a: [
        {
          p: 1193.301036,
          s: 137.01646087,
        },
        {
          p: 1568.5,
          s: 1.46,
        },
        {
          p: 1823,
          s: 145.105726,
        },
      ],
      b: [
        {
          p: 1191.9922554,
          s: 141.45198468,
        },
      ],
      t: "2023-04-04T09:14:32.560327064Z",
    },
  },
};

const snapshots = {
  "BTC/USD": {
    latestTrade: {
      t: "2021-12-09T15:07:13.573434454Z",
      p: 48714.5,
      s: 0.0205,
      tks: "B",
      i: 0,
    },
    latestQuote: {
      t: "2021-12-09T15:08:33.405330416Z",
      bp: 48738.9,
      bs: 1.5388,
      ap: 48759,
      as: 1.5382,
    },
    minuteBar: {
      t: "2021-12-09T15:07:00Z",
      o: 48714.5,
      h: 48714.5,
      l: 48714.5,
      c: 48714.5,
      v: 0.0205,
      n: 1,
      vw: 48714.5,
    },
    dailyBar: {
      t: "2021-12-09T06:00:00Z",
      o: 49838,
      h: 50310.5,
      l: 48361.3,
      c: 48714.5,
      v: 305.0539,
      n: 215,
      vw: 49176.7255476491,
    },
    prevDailyBar: {
      t: "2021-12-08T06:00:00Z",
      o: 50692,
      h: 51269,
      l: 48734.2,
      c: 49883.4,
      v: 481.7121,
      n: 476,
      vw: 50083.3525751792,
    },
  },
};
