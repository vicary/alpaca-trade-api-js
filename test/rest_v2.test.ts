import { Alpaca as api } from "../dist/alpaca-trade-api";
import * as mock from "./support/mock-server";

const tradeKeys = [
  "T",
  "Symbol",
  "ID",
  "Exchange",
  "Price",
  "Size",
  "Timestamp",
  "Conditions",
  "Tape",
];

const quoteKeys = [
  "T",
  "Symbol",
  "BidExchange",
  "BidPrice",
  "BidSize",
  "AskExchange",
  "AskPrice",
  "AskSize",
  "Tape",
  "Timestamp",
  "Conditions",
];

const barKeys = [
  "T",
  "Symbol",
  "Open",
  "High",
  "Low",
  "Close",
  "Volume",
  "Timestamp",
  "TradeCount",
  "VWAP",
];

function assertTrade(trade: Record<string, unknown>, keys = tradeKeys) {
  expect(Object.keys(trade).sort()).toEqual([...keys].sort());
}

function assertQuote(quote: Record<string, unknown>, keys = quoteKeys) {
  expect(Object.keys(quote).sort()).toEqual([...keys].sort());
}

function assertBar(bar: Record<string, unknown>, keys = barKeys) {
  expect(Object.keys(bar).sort()).toEqual([...keys].sort());
}

function assertSnapshot(snapshot: Record<string, unknown>) {
  expect(Object.keys(snapshot).sort()).toEqual(
    [
      "symbol",
      "LatestTrade",
      "LatestQuote",
      "MinuteBar",
      "DailyBar",
      "PrevDailyBar",
    ].sort()
  );
  assertTrade(snapshot.LatestTrade as Record<string, unknown>);
  assertBar(snapshot.MinuteBar as Record<string, unknown>);
  assertQuote(snapshot.LatestQuote as Record<string, unknown>);
}

describe("stock API", () => {
  let alpaca: InstanceType<typeof api>;

  beforeAll(() => {
    alpaca = new api(mock.getConfig());
  });

  it("get trades with paging", async () => {
    const resp = alpaca.getTradesV2("AAPL", {
      start: "2021-02-08",
      end: "2021-02-10",
      limit: 10,
    });
    const trades: Record<string, unknown>[] = [];

    for await (const t of resp) {
      trades.push(t);
    }

    expect(trades.length).toBe(10);
    assertTrade(trades[0]);
  });

  it("get quotes", async () => {
    const resp = alpaca.getQuotesV2("AAPL", {
      start: "2021-02-08",
      end: "2021-02-10",
      limit: 4,
    });
    const quotes: Record<string, unknown>[] = [];

    for await (const q of resp) {
      quotes.push(q);
    }

    expect(quotes.length).toBe(4);
    assertQuote(quotes[0]);
  });

  it("get quotes without limit", async () => {
    const resp = alpaca.getQuotesV2("AAPL", {
      start: "2021-02-08",
      end: "2021-02-10",
    });
    const quotes: Record<string, unknown>[] = [];

    for await (const q of resp) {
      quotes.push(q);
    }

    expect(quotes.length).toBe(10);
    assertQuote(quotes[0]);
  });

  it("get bars", async () => {
    const resp = alpaca.getBarsV2("AAPL", {
      start: "2021-02-01",
      end: "2021-02-10",
      limit: 2,
      timeframe: alpaca.newTimeframe(1, alpaca.timeframeUnit.DAY),
      adjustment: alpaca.adjustment.RAW,
    });
    const bars: Record<string, unknown>[] = [];

    for await (const b of resp) {
      bars.push(b);
    }

    expect(bars.length).toBe(2);
    assertBar(bars[0]);
  });

  it("get latest AAPL trade", async () => {
    const resp = await alpaca.getLatestTrade("AAPL");

    assertTrade(resp);
  });

  it("get last FB quote", async () => {
    const resp = await alpaca.getLatestQuote("FB");

    assertQuote(resp);
  });

  it("get snapshot for one symbol", async () => {
    const resp = await alpaca.getSnapshot("AAPL");

    assertSnapshot(resp);
  });

  it("get snapashots for symbols", async () => {
    const resp: Record<string, unknown>[] = [];
    for await (const s of alpaca.getSnapshots(["FB", "AAPL"])) {
      resp.push(s);
    }
    expect(resp.length).toBe(2);

    resp.map((s) => {
      assertSnapshot(s);
    });
  });

  it("get multi trades", async () => {
    const symbols = new Set<string>();
    for await (const t of alpaca.getMultiTradesV2(["AAPL", "FB"], {
      start: "2021-09-01T00:00:00.00Z",
      end: "2021-09-02T22:00:00Z",
    })) {
      symbols.add(t.Symbol);
    }
    expect(symbols.size).toBe(2);
  });

  it("get multi trades async", async () => {
    const resp: Record<string, unknown>[] = [];
    for await (const t of alpaca.getMultiTradesV2(["AAPL", "FB"], {
      start: "2021-09-01T00:00:00.00Z",
      end: "2021-09-02T22:00:00Z",
    })) {
      resp.push(t);
    }
    const gotSymbols = new Map<string, object>();
    for await (const t of resp) {
      gotSymbols.set(t.Symbol as string, {});
      assertTrade(t);
    }
    expect(gotSymbols.size).toBe(2);
  });

  it("get multi quotes async", async () => {
    const resp: Record<string, unknown>[] = [];
    for await (const q of alpaca.getMultiQuotesV2(["AAPL", "FB"], {
      start: "2021-08-11T08:30:00.00Z",
      end: "2021-09-12T16:00:00Z",
    })) {
      resp.push(q);
    }
    const gotSymbols = new Map<string, object>();
    for await (const q of resp) {
      gotSymbols.set(q.Symbol as string, {});
      assertQuote(q);
    }
    expect(gotSymbols.size).toBe(2);
  });

  it("get multi latest trades", async () => {
    const resp: Record<string, unknown>[] = [];
    for await (const trade of alpaca.getLatestTrades(
      ["AAPL", "FB"],
      alpaca.configuration
    )) {
      resp.push(trade);
    }

    expect(resp.length).toBe(2);
    for (const t of resp) {
      assertTrade(t);
    }
  });

  it("get multi latest bars", async () => {
    const resp: Record<string, unknown>[] = [];
    for await (const bar of alpaca.getLatestBars(
      ["SPY"],
      alpaca.configuration
    )) {
      resp.push(bar);
    }

    expect(resp.length).toBe(1);
    assertBar(resp[0]);
  });
});

const cryptoTradeKeys = [
  "T",
  "Symbol",
  "Timestamp",
  "Price",
  "Size",
  "TakerSide",
  "ID",
];

const cryptoQuoteKeys = [
  "T",
  "Symbol",
  "Timestamp",
  "BidPrice",
  "BidSize",
  "AskPrice",
  "AskSize",
];

const cryptoBarKeys = [
  "T",
  "Symbol",
  "Timestamp",
  "Open",
  "High",
  "Low",
  "Close",
  "Volume",
  "VWAP",
  "TradeCount",
];

const cryptoOrderbookKeys = ["T", "Timestamp", "Bids", "Asks"];

function assertCryptoTrade(
  trade: Record<string, unknown>,
  keys = cryptoTradeKeys
) {
  expect(Object.keys(trade).sort()).toEqual([...keys].sort());
}

function assertCryptoQuote(
  quote: Record<string, unknown>,
  keys = cryptoQuoteKeys
) {
  expect(Object.keys(quote).sort()).toEqual([...keys].sort());
}

function assertCryptoBar(bar: Record<string, unknown>, keys = cryptoBarKeys) {
  expect(Object.keys(bar).sort()).toEqual([...keys].sort());
}

function assertCryptoSnapshot(snapshot: Record<string, unknown>) {
  expect(Object.keys(snapshot).sort()).toEqual(
    [
      "Symbol",
      "LatestTrade",
      "LatestQuote",
      "MinuteBar",
      "DailyBar",
      "PrevDailyBar",
    ].sort()
  );
  assertCryptoTrade(snapshot.LatestTrade as Record<string, unknown>);
  assertCryptoQuote(snapshot.LatestQuote as Record<string, unknown>);
  assertCryptoBar(snapshot.MinuteBar as Record<string, unknown>);
  assertCryptoBar(snapshot.DailyBar as Record<string, unknown>);
  assertCryptoBar(snapshot.PrevDailyBar as Record<string, unknown>);
}

function assertCryptoOrderbook(
  orderbook: Record<string, unknown>,
  keys = cryptoOrderbookKeys
) {
  expect(Object.keys(orderbook).sort()).toEqual([...keys].sort());
}

describe("crypto API", () => {
  let alpaca: InstanceType<typeof api>;

  beforeAll(() => {
    alpaca = new api(mock.getConfig());
  });

  it("get latest trades", async () => {
    const resp: Record<string, unknown>[] = [];

    for await (const data of alpaca.getLatestCryptoTrades([
      "BTC/USD",
      "ETH/USD",
    ])) {
      resp.push(data);
    }

    expect(resp.length).toBe(2);
    for (const trade of resp) {
      assertCryptoTrade(trade);
    }
  });

  it("get crypto bars", async () => {
    const resp: Record<string, unknown>[] = [];

    for await (const data of alpaca.getCryptoBars(["ETH/USD"], {
      timeframe: "1D",
      start: "2021-08-10",
      limit: 1,
    })) {
      resp.push(data);
    }

    expect(resp.length).toBe(1);
    assertCryptoBar(resp[0]);
  });

  it("get crypto bars with exchanges", async () => {
    await expect(
      alpaca
        .getCryptoBars(["DOGE/USD"], {
          start: "2023-04-27",
          limit: 1,
          timeframe: "1D",
          exchanges: ["BNCU"],
        })
        .next()
    ).rejects.toThrow(
      "code: 400, message: Unexpected query parameter(s): exchanges"
    );
  });

  it("get snapshots", async () => {
    const resp: Record<string, unknown>[] = [];
    for await (const data of alpaca.getCryptoSnapshots(["BTC/USD"])) {
      resp.push(data);
    }
    expect(resp.length).toBe(1);
    assertCryptoSnapshot(resp[0]);
  });

  it("get orderbooks", async () => {
    const resp: Record<string, unknown>[] = [];
    for await (const data of alpaca.getCryptoOrderbooks([
      "ETH/USD",
      "BTC/USD",
    ])) {
      resp.push(data);
    }
    expect(resp.length).toBe(2);
    assertCryptoOrderbook(resp[0]);
    assertCryptoOrderbook(resp[1]);
  });

  it("get historical quotes", async () => {
    const resp: Record<string, unknown>[] = [];
    for await (const data of alpaca.getCryptoQuotes(["BTC/USD"], {
      start: "2024-06-25",
      limit: 1,
    })) {
      resp.push(data);
    }
    expect(resp.length).toBe(1);

    const quote = resp[0];
    expect(quote.AskPrice).toBe(60849.5);
    expect(quote.AskSize).toBe(0.56);
    expect(quote.BidPrice).toBe(60772.395);
    expect(quote.BidSize).toBe(0.5549);
    expect(quote.Timestamp).toBe("2024-06-27T00:01:28.222959058Z");
  });
});

describe("news API", () => {
  let alpaca: InstanceType<typeof api>;

  beforeAll(() => {
    alpaca = new api(mock.getConfig());
  });

  it("get news", async () => {
    const news: Record<string, unknown>[] = [];
    for await (const item of alpaca.getNews({})) {
      news.push(item);
    }
    expect(news.length).toBe(2);

    const news1 = news[0];
    expect(news1.ID).toBe(20472678);
    expect(news1.Headline).toBe("CEO John Krafcik Leaves Waymo");
    expect(news1.Author).toBe("Bibhu Pattnaik");
    expect(news1.CreatedAt).toBe("2021-04-03T15:35:21Z");
    expect((news1.Images as unknown[]).length).toBe(3);
    expect((news1.Symbols as unknown[]).length).toBe(3);
  });

  it("get news with wrong parameters", async () => {
    await expect(
      alpaca.getNews({ symbols: ["AAPL", "GE"], totalLimit: -1 }).next()
    ).rejects.toThrow("negative total limit");
  });
});

describe("options API", () => {
  let alpaca: InstanceType<typeof api>;

  beforeAll(() => {
    alpaca = new api(mock.getConfig());
  });

  it("get bars", async () => {
    const bars: Record<string, unknown>[] = [];
    for await (const bar of alpaca.getOptionBars(["AAPL240419P00140000"], {
      start: "2024-01-18",
      timeframe: "1D",
    })) {
      bars.push(bar);
    }
    expect(bars.length).toBe(1);

    const applBar = bars[0];
    expect(applBar.Timestamp).toBe("2024-01-18T05:00:00Z");
    expect(applBar.Open).toBe(0.38);
    expect(applBar.High).toBe(0.38);
    expect(applBar.Low).toBe(0.34);
    expect(applBar.Close).toBe(0.34);
  });

  it("option chain", async () => {
    const snapshots: Record<string, unknown>[] = [];
    for await (const snapshot of alpaca.getOptionChain("AAPL", {})) {
      snapshots.push(snapshot);
    }
    expect(snapshots.length).toBe(1);

    const snapshot = snapshots[0];
    expect((snapshot.Greeks as Record<string, unknown>).delta).toBe(
      0.7521304109871954
    );
    expect((snapshot.Greeks as Record<string, unknown>).gamma).toBe(
      0.06241426404871288
    );
    expect((snapshot.LatestQuote as Record<string, unknown>).Timestamp).toBe(
      "2024-04-22T19:59:59.992734208Z"
    );
    expect((snapshot.LatestTrade as Record<string, unknown>).Timestamp).toBe(
      "2024-04-22T19:57:32.589554432Z"
    );
  });
});
