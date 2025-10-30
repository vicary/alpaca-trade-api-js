export type RawQuote = {
  T: string;
  X: string;
  P: number;
  S: number;
  x: string;
  p: number;
  s: number;
  c: number[];
  t: number;
  [key: string]: unknown;
};

export function AlpacaQuote({ T, X, P, S, x, p, s, c, t, ...data }: RawQuote) {
  return {
    symbol: T,
    askexchange: X,
    askprice: P,
    asksize: S,
    bidexchange: x,
    bidprice: p,
    bidsize: s,
    conditions: c,
    timestamp: t,
    ...data,
  };
}

export type RawTrade = {
  T: string;
  i: string;
  x: string;
  p: number;
  s: number;
  t: number;
  z: string;
  c: number[];
};

export function AlpacaTrade({ T, i, x, p, s, t, z, c, ...data }: RawTrade) {
  return {
    symbol: T,
    tradeID: i,
    exchange: x,
    price: p,
    size: s,
    timestamp: t,
    tapeID: z,
    conditions: c,
    ...data,
  };
}

export type RawAggMinuteBar = {
  T: string;
  v: number;
  av: number;
  op: number;
  vw: number;
  o: number;
  h: number;
  l: number;
  c: number;
  a: number;
  s: number;
  e: number;
  [key: string]: unknown;
};

export function AggMinuteBar({
  T,
  v,
  av,
  op,
  vw,
  o,
  h,
  l,
  c,
  a,
  s,
  e,
  ...data
}: RawAggMinuteBar) {
  return {
    symbol: T,
    volume: v,
    accumulatedVolume: av,
    officialOpenPrice: op,
    vwap: vw,
    openPrice: o,
    highPrice: h,
    lowPrice: l,
    closePrice: c,
    averagePrice: a,
    startEpochTime: s,
    endEpochTime: e,
    ...data,
  };
}

export type RawBar = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  [key: string]: unknown;
};

export function Bar({ t, o, h, l, c, v, ...data }: RawBar) {
  return {
    startEpochTime: t,
    openPrice: o,
    highPrice: h,
    lowPrice: l,
    closePrice: c,
    volume: v,
    ...data,
  };
}
