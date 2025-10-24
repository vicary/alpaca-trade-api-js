"use strict";

const { expect, assert } = require("chai");
const { Alpaca: api } = require("../dist/alpaca-trade-api");
const mock = require("./support/mock-server");

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

function assertTrade(trade, keys = tradeKeys) {
  expect(trade).to.have.all.keys(keys);
}

function assertQuote(quote, keys = quoteKeys) {
  expect(quote).to.have.all.keys(keys);
}

function assertBar(bar, keys = barKeys) {
  expect(bar).to.have.all.keys(keys);
}

function assertSnapshot(snapshot) {
  expect(snapshot).to.have.all.keys([
    "symbol",
    "LatestTrade",
    "LatestQuote",
    "MinuteBar",
    "DailyBar",
    "PrevDailyBar",
  ]);
  assertTrade(snapshot.LatestTrade);
  assertBar(snapshot.MinuteBar);
  assertQuote(snapshot.LatestQuote);
}

describe("stock API", () => {
  let alpaca;

  before(() => {
    alpaca = new api(mock.getConfig());
  });

  it("get trades with paging", async () => {
    let resp = alpaca.getTradesV2("AAPL", {
      start: "2021-02-08",
      end: "2021-02-10",
      limit: 10,
    });
    const trades = [];

    for await (let t of resp) {
      trades.push(t);
    }

    expect(trades.length).equal(10);
    assertTrade(trades[0]);
  });

  it("get quotes", async () => {
    let resp = alpaca.getQuotesV2("AAPL", {
      start: "2021-02-08",
      end: "2021-02-10",
      limit: 4,
    });
    const quotes = [];

    for await (let q of resp) {
      quotes.push(q);
    }

    expect(quotes.length).equal(4);
    assertQuote(quotes[0]);
  });

  it("get quotes without limit", async () => {
    let resp = alpaca.getQuotesV2("AAPL", {
      start: "2021-02-08",
      end: "2021-02-10",
    });
    const quotes = [];

    for await (let q of resp) {
      quotes.push(q);
    }

    expect(quotes.length).equal(10);
    assertQuote(quotes[0]);
  });

  it("get bars", async () => {
    let resp = alpaca.getBarsV2("AAPL", {
      start: "2021-02-01",
      end: "2021-02-10",
      limit: 2,
      timeframe: alpaca.newTimeframe(1, alpaca.timeframeUnit.DAY),
      adjustment: alpaca.adjustment.RAW,
    });
    const bars = [];

    for await (let b of resp) {
      bars.push(b);
    }

    expect(bars.length).equal(2);
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
    const resp = [];
    for await (const s of alpaca.getSnapshots(["FB", "AAPL"])) {
      resp.push(s);
    }
    expect(resp.length).equal(2);

    resp.map((s) => {
      assertSnapshot(s);
    });
  });

  it("get multi trades", async () => {
    const symbols = new Set();
    for await (const t of alpaca.getMultiTradesV2(["AAPL", "FB"], {
      start: "2021-09-01T00:00:00.00Z",
      end: "2021-09-02T22:00:00Z",
    })) {
      symbols.add(t.Symbol);
    }
    expect(symbols.size).to.equal(2);
  });

  it("get multi trades async", async () => {
    const resp = [];
    for await (const t of alpaca.getMultiTradesV2(["AAPL", "FB"], {
      start: "2021-09-01T00:00:00.00Z",
      end: "2021-09-02T22:00:00Z",
    })) {
      resp.push(t);
    }
    let gotSymbols = new Map();
    for await (let t of resp) {
      gotSymbols.set(t.Symbol, {});
      assertTrade(t);
    }
    expect(gotSymbols.size).to.equal(2);
  });

  it("get multi quotes async", async () => {
    const resp = [];
    for await (const q of alpaca.getMultiQuotesV2(["AAPL", "FB"], {
      start: "2021-08-11T08:30:00.00Z",
      end: "2021-09-12T16:00:00Z",
    })) {
      resp.push(q);
    }
    let gotSymbols = new Map();
    for await (let q of resp) {
      gotSymbols.set(q.Symbol, {});
      assertQuote(q);
    }
    expect(gotSymbols.size).to.equal(2);
  });

  it("get multi latest trades", async () => {
    const resp = [];
    for await (const trade of alpaca.getLatestTrades(
      ["AAPL", "FB"],
      alpaca.configuration
    )) {
      resp.push(trade);
    }

    expect(resp.length).equal(2);
    for (const t of resp) {
      assertTrade(t);
    }
  });

  it("get multi latest bars", async () => {
    const resp = [];
    for await (const bar of alpaca.getLatestBars(
      ["SPY"],
      alpaca.configuration
    )) {
      resp.push(bar);
    }

    expect(resp.length).equal(1);
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

function assertCryptoTrade(trade, keys = cryptoTradeKeys) {
  expect(trade).to.have.all.keys(keys);
}

function assertCryptoQuote(quote, keys = cryptoQuoteKeys) {
  expect(quote).to.have.all.keys(keys);
}

function assertCryptoBar(bar, keys = cryptoBarKeys) {
  expect(bar).to.have.all.keys(keys);
}

function assertCryptoSnapshot(snapshot) {
  expect(snapshot).to.have.all.keys([
    "Symbol",
    "LatestTrade",
    "LatestQuote",
    "MinuteBar",
    "DailyBar",
    "PrevDailyBar",
  ]);
  assertCryptoTrade(snapshot.LatestTrade);
  assertCryptoQuote(snapshot.LatestQuote);
  assertCryptoBar(snapshot.MinuteBar);
  assertCryptoBar(snapshot.DailyBar);
  assertCryptoBar(snapshot.PrevDailyBar);
}

function assertCryptoOrderbook(orderbook, keys = cryptoOrderbookKeys) {
  expect(orderbook).to.have.all.keys(keys);
}

describe("crypto API", () => {
  let alpaca;

  before(() => {
    alpaca = new api(mock.getConfig());
  });

  it("get latest trades", async () => {
    const resp = [];

    for await (const data of alpaca.getLatestCryptoTrades([
      "BTC/USD",
      "ETH/USD",
    ])) {
      resp.push(data);
    }

    expect(resp.length).equal(2);
    for (const trade of resp) {
      assertCryptoTrade(trade);
    }
  });

  it("get crypto bars", async () => {
    const resp = [];

    for await (const data of alpaca.getCryptoBars(["ETH/USD"], {
      timeframe: "1D",
      start: "2021-08-10",
      limit: 1,
    })) {
      resp.push(data);
    }

    expect(resp.length).equal(1);
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
    ).to.eventually.be.rejectedWith(
      "code: 400, message: Unexpected query parameter(s): exchanges"
    );
  });

  it("get snapshots", async () => {
    const resp = [];
    for await (const data of alpaca.getCryptoSnapshots(["BTC/USD"])) {
      resp.push(data);
    }
    expect(resp.length).equal(1);
    assertCryptoSnapshot(resp[0]);
  });

  it("get orderbooks", async () => {
    const resp = [];
    for await (const data of alpaca.getCryptoOrderbooks([
      "ETH/USD",
      "BTC/USD",
    ])) {
      resp.push(data);
    }
    expect(resp.length).equal(2);
    assertCryptoOrderbook(resp[0]);
    assertCryptoOrderbook(resp[1]);
  });

  it("get historical quotes", async () => {
    const resp = [];
    for await (const data of alpaca.getCryptoQuotes(["BTC/USD"], {
      start: "2024-06-25",
      limit: 1,
    })) {
      resp.push(data);
    }
    expect(resp.length).equal(1);

    const quote = resp[0];
    assert.equal(quote.AskPrice, 60849.5);
    assert.equal(quote.AskSize, 0.56);
    assert.equal(quote.BidPrice, 60772.395);
    assert.equal(quote.BidSize, 0.5549);
    assert.equal(quote.Timestamp, "2024-06-27T00:01:28.222959058Z");
  });
});

describe("news API", () => {
  let alpaca;

  before(() => {
    alpaca = new api(mock.getConfig());
  });
  it("get news", async () => {
    const news = [];
    for await (const item of alpaca.getNews({})) {
      news.push(item);
    }
    expect(news.length).equal(2);

    const news1 = news[0];
    assert.equal(news1.ID, 20472678);
    assert.equal(news1.Headline, "CEO John Krafcik Leaves Waymo");
    assert.equal(news1.Author, "Bibhu Pattnaik");
    assert.equal(news1.CreatedAt, "2021-04-03T15:35:21Z");
    assert.equal(news1.Images.length, 3);
    assert.equal(news1.Symbols.length, 3);
  });

  it("get news with wrong parameters", async () => {
    await expect(
      alpaca.getNews({ symbols: ["AAPL", "GE"], totalLimit: -1 }).next()
    ).to.eventually.be.rejectedWith("negative total limit");
  });
});

describe("options API", () => {
  let alpaca;

  before(() => {
    alpaca = new api(mock.getConfig());
  });

  it("get bars", async () => {
    const bars = [];
    for await (const bar of alpaca.getOptionBars(["AAPL240419P00140000"], {
      start: "2024-01-18",
      timeframe: "1D",
    })) {
      bars.push(bar);
    }
    expect(bars.length).equal(1);

    const applBar = bars[0];
    assert.equal(applBar.Timestamp, "2024-01-18T05:00:00Z");
    assert.equal(applBar.Open, "0.38");
    assert.equal(applBar.High, "0.38");
    assert.equal(applBar.Low, "0.34");
    assert.equal(applBar.Close, "0.34");
  });

  it("option chain", async () => {
    const snapshots = [];
    for await (const snapshot of alpaca.getOptionChain("AAPL", {})) {
      snapshots.push(snapshot);
    }
    expect(snapshots.length).equal(1);

    const snapshot = snapshots[0];
    assert.equal(snapshot.Greeks.delta, 0.7521304109871954);
    assert.equal(snapshot.Greeks.gamma, 0.06241426404871288);
    assert.equal(
      snapshot.LatestQuote.Timestamp,
      "2024-04-22T19:59:59.992734208Z"
    );
    assert.equal(
      snapshot.LatestTrade.Timestamp,
      "2024-04-22T19:57:32.589554432Z"
    );
  });
});
