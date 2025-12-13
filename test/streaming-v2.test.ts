import { Alpaca as alpacaApi } from "../dist/alpaca-trade-api";
import { StreamingWsMock } from "./support/mock-streaming";

function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (Number.isNaN(a) && Number.isNaN(b)) return true;
  if (a == null || b == null) return a === b;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === "object" && typeof b === "object") {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
      if (!isEqual(a[k], b[k])) return false;
    }
    return true;
  }

  return false;
}

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

describe("data_stream_v2", () => {
  let streaming_mock: StreamingWsMock;
  let alpaca: any;
  let socket: any, socket2: any;
  let port: number;

  function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function waitFor(fn: () => boolean, interval = 1, timeout = 1000) {
    const start = new Date().getTime();
    while (new Date().getTime() <= start + timeout) {
      if (fn()) {
        return true;
      }
      await sleep(interval);
    }
    return false;
  }

  beforeAll(() => {
    try {
      streaming_mock = new StreamingWsMock(0);
      // ws exposes underlying server on the WebSocketServer instance.
      port = (streaming_mock.conn as any)._server.address().port;
      alpaca = new alpacaApi({
        dataStreamUrl: `http://localhost:${port}`,
        keyId: "key1",
        secretKey: "secret1",
        feed: "sip",
      });
      socket = alpaca.data_stream_v2;
    } catch (e) {
      console.error(e);
    }
  });

  afterAll(() => {
    socket.disconnect();
    socket2.disconnect();
    streaming_mock.close();
  });

  it("user can auth", async () => {
    let status: any;
    socket.onStateChange((state: any) => {
      status = state;
    });

    socket.connect();

    const res = await waitFor(() => {
      return status === "authenticated";
    });
    expect(res).toBe(true);
  });

  it("try to auth with wrong apiKey and Secret", async () => {
    let status: any;
    const alpaca = new alpacaApi({
      dataStreamUrl: `http://localhost:${port}`,
      keyId: "wrongkey",
      secretKey: "wrongsecret",
      feed: "sip",
    });
    socket2 = alpaca.data_stream_v2;

    socket2.onError((err: any) => {
      status = err;
    });

    socket2.connect();
    const res = await waitFor(() => {
      return status === "auth failed";
    });
    expect(res).toBe(true);
  });

  it("subscribe for symbol", async () => {
    const expectedSubs = {
      trades: ["AAPL"],
      quotes: [],
      bars: ["GE"],
      updatedBars: [],
      dailyBars: [],
      statuses: [],
      lulds: [],
      cancelErrors: ["AAPL"],
      corrections: ["AAPL"],
    };

    socket.subscribeForTrades(["AAPL"]);
    socket.subscribeForBars(["GE"]);

    const res = await waitFor(() => {
      return isEqual(socket.getSubscriptions(), expectedSubs);
    });
    expect(res).toBe(true);
  });

  it("unsubscribe from symbol", async () => {
    const expectedSubs = {
      trades: [],
      quotes: [],
      bars: [],
      updatedBars: [],
      dailyBars: [],
      statuses: [],
      lulds: [],
      cancelErrors: [],
      corrections: [],
    };

    socket.unsubscribeFromTrades("AAPL");
    socket.unsubscribeFromBars(["GE"]);

    const res = await waitFor(() =>
      isEqual(socket.getSubscriptions(), expectedSubs)
    );
    expect(res).toBe(true);
  });

  it("parse streamed trade", async () => {
    let data: any;
    const parsed = {
      T: "t",
      ID: 1532,
      Symbol: "AAPL",
      Exchange: "Q",
      Price: 144.6,
      Size: 25,
      Timestamp: "2021-01-27T10:35:34.82840127Z",
      Conditions: ["@", "F", "T", "I"],
      Tape: "C",
    };
    socket.onStockTrade((trade: any) => {
      data = trade;
    });

    socket.subscribeForTrades(["AAPL"]);

    const res = await waitFor(() => isEqual(data, parsed));
    expect(res).toBe(true);
  });

  it("parse streamed quote", async () => {
    let data: any;
    const parsed = {
      T: "q",
      Symbol: "AAPL",
      BidExchange: "Z",
      BidPrice: 139.74,
      BidSize: 3,
      AskExchange: "Q",
      AskPrice: 139.77,
      AskSize: 1,
      Timestamp: "2021-01-28T15:20:41.384564Z",
      Conditions: "R",
      Tape: "C",
    };
    socket.onStockQuote((quote: any) => {
      data = quote;
    });
    socket.subscribeForQuotes(["AAPL"]);

    const res = await waitFor(() => isEqual(data, parsed));
    expect(res).toBe(true);
  });

  it("subscribe for bar and parse it", async () => {
    let data: any;
    const parsed = {
      T: "b",
      Symbol: "AAPL",
      Open: 127.82,
      High: 128.32,
      Low: 126.32,
      Close: 126.9,
      Volume: 72015712,
      Timestamp: "2021-05-25T04:00:00Z",
      VWAP: 127.07392,
      TradeCount: 462915,
    };

    socket.onStockBar((bar: any) => {
      data = bar;
    });

    socket.subscribeForBars(["AAPL"]);

    const res = await waitFor(() => isEqual(data, parsed));
    expect(res).toBe(true);
  });

  it("subscribe for status and parse it", async () => {
    let data: any;
    const parsed = {
      T: "s",
      Symbol: "AAPL",
      StatusCode: "StatusCode",
      StatusMessage: "StatusMessage",
      ReasonCode: "ReasonCode",
      ReasonMessage: "ReasonMessage",
      Timestamp: "Timestamp",
      Tape: "Tape",
    };

    socket.onStatuses((s: any) => {
      data = s;
    });
    socket.subscribeForStatuses(["AAPL"]);

    const res = await waitFor(() => isEqual(data, parsed));
    expect(res).toBe(true);
  });

  it("subscribe for barUpdate and parse it", async () => {
    let data: any;
    const parsed = {
      T: "u",
      Symbol: "AAPL",
      Open: 100,
      High: 101.2,
      Low: 98.67,
      Close: 101.3,
      Volume: 2570,
      Timestamp: "2021-03-05T16:00:30Z",
      TradeCount: 1235,
      VWAP: 100.123457,
    };

    socket.onStockUpdatedBar((bu: any) => {
      data = bu;
    });
    socket.subscribeForUpdatedBars(["AAPL"]);

    const res = await waitFor(() => isEqual(data, parsed));
    expect(res).toBe(true);
  });
});
