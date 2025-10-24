"use strict";

const { expect, assert, use } = require("chai");
const {
  deepCloneIgnoreUndefined,
} = require("chai-deep-equal-ignore-undefined");
const entityV2 = require("../../dist/resources/datav2/entityv2");

function assertData(got, expected) {
  const a = deepCloneIgnoreUndefined(got);
  const b = deepCloneIgnoreUndefined(expected);

  expect(a).to.deep.equal(b);
}

describe("test convert functions", () => {
  it("test aliasObjectKey for trades", () => {
    const got = entityV2.AlpacaTradeV2(data.trade);
    assertData(got, expected.trade);
  });

  it("test aliasObjectKey for quotes", () => {
    const got = entityV2.AlpacaQuoteV2(data.quote);
    assertData(got, expected.quote);
  });

  it("test aliasObjectKey for bars", () => {
    const got = entityV2.AlpacaBarV2(data.bar);
    assertData(got, expected.bar);
  });

  it("test aliasObjectKey for snapshot", () => {
    const got = entityV2.AlpacaSnapshotV2(data.snapshot);
    assertData(got, expected.snapshot);
  });

  it("test aliasObjectKey for crypto orderbooks", () => {
    const got = entityV2.AlpacaCryptoOrderbook(data.cryptoOrderbook);
    assertData(got, expected.cryptoOrderbook);
  });
});

describe("test timeframe", () => {
  it("test valid day timeframe", () => {
    const got = entityV2.NewTimeframe(1, entityV2.TimeFrameUnit.DAY);
    expect(got).equal("1Day");
  });

  it("test invalid day timeframe", () => {
    assert.throws(
      () => {
        entityV2.NewTimeframe(15, entityV2.TimeFrameUnit.DAY);
      },
      Error,
      "day and week timeframes can only be used with amount 1"
    );
  });

  it("test invalid minute timeframe", () => {
    assert.throws(
      () => {
        entityV2.NewTimeframe(72, entityV2.TimeFrameUnit.MIN);
      },
      Error,
      "minute timeframe can only be used with amount between 1-59"
    );
  });

  it("test invalid amount in timeframe", () => {
    assert.throws(
      () => {
        entityV2.NewTimeframe(0, entityV2.TimeFrameUnit.MIN);
      },
      Error,
      "amount must be a positive integer value"
    );
  });

  it("test valid month timeframe", () => {
    const got = entityV2.NewTimeframe(3, entityV2.TimeFrameUnit.MONTH);
    expect(got).equal("3Month");
  });

  it("test invalid month timeframe", () => {
    assert.throws(
      () => {
        entityV2.NewTimeframe(11, entityV2.TimeFrameUnit.MONTH);
      },
      Error,
      "month timeframe can only be used with amount 1, 2, 3, 6 and 12"
    );
  });
});

const data = {
  trade: {
    S: "AAPL",
    t: "2021-02-08T09:00:19.932405248Z",
    x: "P",
    p: 136.68,
    s: 25,
    c: ["@", "T", "I"],
    i: 55,
    z: "C",
  },
  quote: {
    S: "AAPL",
    t: "2021-02-08T09:02:07.837365238Z",
    ax: "P",
    ap: 136.81,
    as: 1,
    bx: "P",
    bp: 136.56,
    bs: 2,
    c: ["R"],
  },
  bar: {
    S: "AAPL",
    t: "2021-02-08T00:00:00Z",
    o: 136.11,
    h: 134.93,
    l: 136.9,
    c: 136.81,
    v: 31491496,
  },
  snapshot: {
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
    },
    dailyBar: {
      t: "2021-05-03T04:00:00Z",
      o: 132.04,
      h: 134.06,
      l: 131.83,
      c: 132.55,
      v: 1364180,
    },
    prevDailyBar: {
      t: "2021-04-30T04:00:00Z",
      o: 131.8,
      h: 133.55,
      l: 131.07,
      c: 131.44,
      v: 2088793,
    },
  },
  cryptoOrderbook: {
    S: "BTC/USDT",
    t: "2022-04-06T14:19:40.984Z",
    b: [
      { p: 44066.1, s: 0 },
      { p: 44063.4, s: 1.361635 },
    ],
    a: [],
  },
};

const expected = {
  trade: {
    T: "t",
    Symbol: "AAPL",
    Timestamp: "2021-02-08T09:00:19.932405248Z",
    Exchange: "P",
    Price: 136.68,
    Size: 25,
    Conditions: ["@", "T", "I"],
    ID: 55,
    Tape: "C",
  },
  quote: {
    T: "q",
    Symbol: "AAPL",
    Timestamp: "2021-02-08T09:02:07.837365238Z",
    AskExchange: "P",
    AskPrice: 136.81,
    AskSize: 1,
    BidExchange: "P",
    BidPrice: 136.56,
    BidSize: 2,
    Conditions: ["R"],
  },
  bar: {
    T: "b",
    Symbol: "AAPL",
    Timestamp: "2021-02-08T00:00:00Z",
    Open: 136.11,
    High: 134.93,
    Low: 136.9,
    Close: 136.81,
    Volume: 31491496,
  },
  snapshot: {
    symbol: "AAPL",
    LatestTrade: {
      T: "t",
      Symbol: "AAPL",
      Timestamp: "2021-05-03T19:59:59.898542039Z",
      Exchange: "V",
      Price: 132.55,
      Size: 100,
      Conditions: ["@"],
      ID: 12637,
      Tape: "C",
    },
    LatestQuote: {
      T: "q",
      Symbol: "AAPL",
      Timestamp: "2021-05-03T21:00:00.006562245Z",
      AskExchange: "V",
      AskPrice: 0,
      AskSize: 0,
      BidExchange: "V",
      BidPrice: 0,
      BidSize: 0,
      Conditions: ["R"],
    },
    MinuteBar: {
      T: "b",
      Symbol: "AAPL",
      Timestamp: "2021-05-03T19:59:00Z",
      Open: 132.43,
      High: 132.55,
      Low: 132.43,
      Close: 132.55,
      Volume: 9736,
    },
    DailyBar: {
      T: "b",
      Symbol: "AAPL",
      Timestamp: "2021-05-03T04:00:00Z",
      Open: 132.04,
      High: 134.06,
      Low: 131.83,
      Close: 132.55,
      Volume: 1364180,
    },
    PrevDailyBar: {
      T: "b",
      Symbol: "AAPL",
      Timestamp: "2021-04-30T04:00:00Z",
      Open: 131.8,
      High: 133.55,
      Low: 131.07,
      Close: 131.44,
      Volume: 2088793,
    },
  },
  cryptoOrderbook: {
    T: "o",
    Timestamp: "2022-04-06T14:19:40.984Z",
    Bids: [
      { Symbol: "BTC/USDT", Price: 44066.1, Size: 0 },
      { Symbol: "BTC/USDT", Price: 44063.4, Size: 1.361635 },
    ],
    Asks: [],
  },
};
