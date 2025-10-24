export interface RawCompactTrade {
  i: number;
  x: string;
  p: number;
  s: number;
  t: string;
  c: Array<string>;
  z: string;
}

export interface RawTrade extends RawCompactTrade {
  T?: "t";
  S: string;
}

export interface AlpacaTrade {
  T: "t";
  Symbol: string;
  Exchange: string;
  ID: number;
  Price: number;
  Size: number;
  Timestamp: string;
  Conditions: Array<string>;
  Tape: string;
}

export interface RawCompactQuote {
  t: string;
  ax: string;
  ap: number;
  as: number;
  bx: string;
  bp: number;
  bs: number;
  c: Array<string>;
}

export interface RawQuote extends RawCompactQuote {
  T?: "q";
  S: string;
  z?: string;
}

export interface AlpacaQuote {
  T: "q";
  AskExchange: string;
  AskPrice: number;
  AskSize: number;
  BidExchange: string;
  BidPrice: number;
  BidSize: number;
  Conditions: Array<string>;
  Timestamp: string;
  Symbol: string;
  Tape?: string;
}

export interface RawCompactBar {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface RawBar extends RawCompactBar {
  T?: "b" | "u" | "d";
  S: string;
  vw?: number;
  n?: number;
}
export interface AlpacaBar {
  T: "b" | "u" | "d";
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  Timestamp: string;
  Symbol: string;
  VWAP?: number;
  TradeCount?: number;
}

export interface RawSnapshot {
  symbol: string;
  latestTrade: RawCompactTrade;
  latestQuote: RawCompactQuote;
  minuteBar: RawCompactBar;
  dailyBar: RawCompactBar;
  prevDailyBar: RawCompactBar;
}

export interface AlpacaSnapshot {
  symbol: string;
  LatestTrade: AlpacaTrade;
  LatestQuote: AlpacaQuote;
  MinuteBar: AlpacaBar;
  DailyBar: AlpacaBar;
  PrevDailyBar: AlpacaBar;
}

export interface RawStatus {
  T?: "s";
  S: string;
  sc: string;
  sm: string;
  rc: string;
  rm: string;
  t: string;
  z: string;
}
export interface AlpacaStatus {
  T: "s";
  Symbol: string;
  StatusCode: string;
  StatusMessage: string;
  ReasonCode: string;
  ReasonMessage: string;
  Timestamp: string;
  Tape: string;
}

export interface RawLuld {
  T?: "l";
  S: string;
  u: number;
  d: number;
  i: string;
  t: string;
  z: string;
}

export interface AlpacaLuld {
  T: "l";
  Symbol: string;
  LimitUpPrice: number;
  LimitDownPrice: number;
  Indicator: string;
  Timestamp: string;
  Tape: string;
}

export interface RawCancelError {
  T?: "x";
  S: string;
  i: number;
  x: string;
  p: number;
  s: number;
  a: string;
  z: string;
  t: string;
}

export interface AlpacaCancelError {
  T: "x";
  Symbol: string;
  ID: number;
  Exchange: string;
  Price: number;
  Size: number;
  CancelErrorAction: string;
  Tape: string;
  Timestamp: string;
}

export interface RawCorrection {
  T?: "c";
  S: string;
  x: string;
  oi: number;
  op: number;
  os: number;
  oc: Array<string>;
  ci: number;
  cp: number;
  cs: number;
  cc: Array<string>;
  z: string;
  t: string;
}

export interface AlpacaCorrection {
  T: "c";
  Symbol: string;
  Exchange: string;
  OriginalID: number;
  OriginalPrice: number;
  OriginalSize: number;
  OriginalConditions: Array<string>;
  CorrectedID: number;
  CorrectedPrice: number;
  CorrectedSize: number;
  CorrectedConditions: Array<string>;
  Tape: string;
  Timestamp: string;
}

export interface RawCryptoTrade {
  T?: "t";
  S: string;
  t: string;
  p: number;
  s: number;
  tks: string;
  i: number;
}

export interface CryptoTrade {
  T: "t";
  Symbol: string;
  Timestamp: string;
  Price: number;
  Size: number;
  TakerSide: string;
  ID: number;
}

export interface RawCryptoQuote {
  T?: "q";
  S: string;
  t: string;
  bp: number;
  bs: number;
  ap: number;
  as: number;
}

export interface CryptoQuote {
  T: "q";
  Symbol: string;
  Timestamp: string;
  BidPrice: number;
  BidSize: number;
  AskPrice: number;
  AskSize: number;
}
export interface RawCryptoBar {
  T?: "b";
  S: string;
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  vw: number;
  n: number;
}

export interface CryptoBar {
  T: "b";
  Symbol: string;
  Timestamp: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  VWAP: number;
  TradeCount: number;
}

export interface RawCryptoSnapshot {
  symbol: string;
  latestTrade: RawCryptoTrade;
  latestQuote: RawCryptoQuote;
  minuteBar: RawCryptoBar;
  dailyBar: RawCryptoBar;
  prevDailyBar: RawCryptoBar;
}

export interface CryptoSnapshot {
  Symbol: string;
  LatestTrade: CryptoTrade;
  LatestQuote: CryptoQuote;
  MinuteBar: CryptoBar;
  DailyBar: CryptoBar;
  PrevDailyBar: CryptoBar;
}

export interface RawCryptoOrderbookEntry {
  S: string;
  p: number;
  s: number;
}

export interface CryptoOrderbookEntry {
  Symbol: string;
  Price: number;
  Size: number;
}

export interface RawCryptoOrderbook {
  T?: "o";
  S: string;
  t: string;
  b: Array<RawCryptoOrderbookEntry>;
  a: Array<RawCryptoOrderbookEntry>;
}

export interface CryptoOrderbook {
  T: "o";
  Timestamp: string;
  Bids: Array<CryptoOrderbookEntry>;
  Asks: Array<CryptoOrderbookEntry>;
}

export interface RawNewsImage {
  size: string;
  url: string;
}

export interface NewsImage {
  Size: string;
  URL: string;
}

export interface RawAlpacaNews {
  T?: "n";
  id: number;
  author: string;
  created_at: string;
  updated_at: string;
  headline: string;
  summary: string;
  content: string;
  images?: Array<RawNewsImage>;
  url: string;
  symbols: Array<string>;
  source?: string;
}

export interface AlpacaNews {
  T: "n";
  ID: number;
  Author: string;
  CreatedAt: string;
  UpdatedAt: string;
  Headline: string;
  Summary: string;
  Content: string;
  Images?: Array<NewsImage>;
  URL: string;
  Symbols: Array<string>;
  Source?: string;
}

export interface RawOptionBar {
  T?: string;
  S: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  t: string;
  vw: number;
  n: number;
}

export interface AlpacaOptionBar {
  Symbol?: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  Timestamp: string;
  VWAP: number;
  TradeCount: number;
}

export interface AlpacaOptionTrade {
  Symbol?: string;
  Exchange: string;
  Price: number;
  Size: number;
  Timestamp: string;
  Condition: string;
}

export interface RawOptionTrade {
  T?: "t";
  S: string;
  x: string;
  p: number;
  s: number;
  t: string;
  c: string;
}

export interface AlpacaOptionQuote {
  Symbol?: string;
  BidExchange: string;
  BidPrice: number;
  BidSize: number;
  AskExchange: string;
  AskPrice: number;
  AskSize: number;
  Timestamp: string;
  Condition: string;
}

export interface RawOptionQuote {
  T?: "q";
  t: string;
  S: string;
  bx: string;
  bp: number;
  bs: number;
  ax: string;
  ap: number;
  as: number;
  c: string;
}

export interface Greeks {
  Delta: number;
  Gamma: number;
  Theta: number;
  Vega: number;
  Rho: number;
}

export interface RawOptionSnapshot {
  symbol: string;
  latestTrade: RawOptionTrade;
  latestQuote: RawOptionQuote;
  impliedVolatility: number;
  greeks: Greeks;
}

export interface AlpacaOptionSnapshot {
  Symbol: string;
  LatestTrade: AlpacaOptionTrade;
  LatestQuote: AlpacaOptionQuote;
  ImpliedVolatility: number;
  Greeks: Greeks;
}

export function AlpacaTradeV2(data: RawTrade): AlpacaTrade {
  return {
    T: data.T ?? "t",
    Symbol: data.S,
    Exchange: data.x,
    ID: data.i,
    Price: data.p,
    Size: data.s,
    Timestamp: data.t,
    Conditions: data.c,
    Tape: data.z,
  };
}

export function AlpacaQuoteV2(data: RawQuote): AlpacaQuote {
  return {
    T: data.T ?? "q",
    AskExchange: data.ax,
    AskPrice: data.ap,
    AskSize: data.as,
    BidExchange: data.bx,
    BidPrice: data.bp,
    BidSize: data.bs,
    Conditions: data.c,
    Timestamp: data.t,
    Symbol: data.S,
    Tape: data.z,
  };
}

export function AlpacaBarV2(data: RawBar): AlpacaBar {
  return {
    T: data.T ?? "b",
    Symbol: data.S,
    Open: data.o,
    High: data.h,
    Low: data.l,
    Close: data.c,
    Volume: data.v,
    VWAP: data.vw,
    TradeCount: data.n,
    Timestamp: data.t,
  };
}

export function AlpacaSnapshotV2(data: RawSnapshot): AlpacaSnapshot {
  return {
    symbol: data.symbol,
    LatestTrade: AlpacaTradeV2({
      T: "t",
      S: data.symbol,
      ...data.latestTrade,
    }),
    LatestQuote: AlpacaQuoteV2({
      T: "q",
      S: data.symbol,
      ...data.latestQuote,
    }),
    MinuteBar: AlpacaBarV2({
      T: "b",
      S: data.symbol,
      ...data.minuteBar,
    }),
    DailyBar: AlpacaBarV2({
      T: "b",
      S: data.symbol,
      ...data.dailyBar,
    }),
    PrevDailyBar: AlpacaBarV2({
      T: "b",
      S: data.symbol,
      ...data.prevDailyBar,
    }),
  };
}

export function AlpacaStatusV2(data: RawStatus): AlpacaStatus {
  return {
    T: data.T ?? "s",
    Symbol: data.S,
    StatusCode: data.sc,
    StatusMessage: data.sm,
    ReasonCode: data.rc,
    ReasonMessage: data.rm,
    Timestamp: data.t,
    Tape: data.z,
  };
}

export function AlpacaLuldV2(data: RawLuld): AlpacaLuld {
  return {
    T: data.T ?? "l",
    Symbol: data.S,
    LimitUpPrice: data.u,
    LimitDownPrice: data.d,
    Indicator: data.i,
    Timestamp: data.t,
    Tape: data.z,
  };
}

export function AlpacaCancelErrorV2(data: RawCancelError): AlpacaCancelError {
  return {
    T: data.T ?? "x",
    ID: data.i,
    Symbol: data.S,
    Exchange: data.x,
    Price: data.p,
    Size: data.s,
    CancelErrorAction: data.a,
    Tape: data.z,
    Timestamp: data.t,
  };
}

export function AlpacaCorrectionV2(data: RawCorrection): AlpacaCorrection {
  return {
    T: data.T ?? "c",
    Symbol: data.S,
    Exchange: data.x,
    OriginalID: data.oi,
    OriginalPrice: data.op,
    OriginalSize: data.os,
    OriginalConditions: data.oc,
    CorrectedID: data.ci,
    CorrectedPrice: data.cp,
    CorrectedSize: data.cs,
    CorrectedConditions: data.cc,
    Tape: data.z,
    Timestamp: data.t,
  };
}

export function AlpacaCryptoTrade(data: RawCryptoTrade): CryptoTrade {
  return {
    T: data.T ?? "t",
    ID: data.i,
    Symbol: data.S,
    Price: data.p,
    Size: data.s,
    TakerSide: data.tks,
    Timestamp: data.t,
  };
}

export function AlpacaCryptoQuote(data: RawCryptoQuote): CryptoQuote {
  return {
    T: data.T ?? "q",
    Symbol: data.S,
    BidPrice: data.bp,
    BidSize: data.bs,
    AskPrice: data.ap,
    AskSize: data.as,
    Timestamp: data.t,
  };
}

export function AlpacaCryptoBar(data: RawCryptoBar): CryptoBar {
  return {
    T: data.T ?? "b",
    Symbol: data.S,
    Open: data.o,
    High: data.h,
    Low: data.l,
    Close: data.c,
    Volume: data.v,
    VWAP: data.vw,
    TradeCount: data.n,
    Timestamp: data.t,
  };
}

export function AlpacaCryptoSnapshot(data: RawCryptoSnapshot): CryptoSnapshot {
  return {
    Symbol: data.symbol,
    LatestTrade: AlpacaCryptoTrade(data.latestTrade),
    LatestQuote: AlpacaCryptoQuote(data.latestQuote),
    MinuteBar: AlpacaCryptoBar(data.minuteBar),
    DailyBar: AlpacaCryptoBar(data.dailyBar),
    PrevDailyBar: AlpacaCryptoBar(data.prevDailyBar),
  };
}

export function AlpacaCryptoOrderbook(
  data: RawCryptoOrderbook
): CryptoOrderbook {
  return {
    T: data.T ?? "o",
    Bids: data.b.map((entry) => ({
      Symbol: data.S,
      Price: entry.p,
      Size: entry.s,
    })),
    Asks: data.a.map((entry) => ({
      Symbol: data.S,
      Price: entry.p,
      Size: entry.s,
    })),
    Timestamp: data.t,
  };
}

export function AlpacaOptionBarV1Beta1(data: RawOptionBar): AlpacaOptionBar {
  return {
    Symbol: data.S,
    Open: data.o,
    High: data.h,
    Low: data.l,
    Close: data.c,
    Volume: data.v,
    VWAP: data.vw,
    TradeCount: data.n,
    Timestamp: data.t,
  };
}

export function AlpacaOptionTradeV1Beta1(
  data: RawOptionTrade
): AlpacaOptionTrade {
  return {
    Symbol: data.S,
    Exchange: data.x,
    Price: data.p,
    Size: data.s,
    Timestamp: data.t,
    Condition: data.c,
  };
}

export function AlpacaOptionQuoteV1Beta1(
  data: RawOptionQuote
): AlpacaOptionQuote {
  return {
    Symbol: data.S,
    BidExchange: data.bx,
    BidPrice: data.bp,
    BidSize: data.bs,
    AskExchange: data.ax,
    AskPrice: data.ap,
    AskSize: data.as,
    Timestamp: data.t,
    Condition: data.c,
  };
}

export function AlpacaOptionSnapshotV1Beta1(
  data: RawOptionSnapshot
): AlpacaOptionSnapshot {
  return {
    Symbol: data.symbol,
    LatestTrade: AlpacaOptionTradeV1Beta1(data.latestTrade),
    LatestQuote: AlpacaOptionQuoteV1Beta1(data.latestQuote),
    ImpliedVolatility: data.impliedVolatility,
    Greeks: data.greeks,
  };
}

export function AlpacaNews(data: RawAlpacaNews): AlpacaNews {
  return {
    T: data.T ?? "n",
    ID: data.id,
    Author: data.author,
    CreatedAt: data.created_at,
    UpdatedAt: data.updated_at,
    Headline: data.headline,
    Summary: data.summary,
    Content: data.content,
    Images: data.images?.map(AlpacaNewsImage),
    URL: data.url,
    Symbols: data.symbols,
    Source: data.source,
  };
}

export function AlpacaNewsImage(data: RawNewsImage): NewsImage {
  return {
    Size: data.size,
    URL: data.url,
  };
}

export enum TimeFrameUnit {
  MIN = "Min",
  HOUR = "Hour",
  DAY = "Day",
  WEEK = "Week",
  MONTH = "Month",
}

export function NewTimeframe(amount: number, unit: TimeFrameUnit): string {
  if (amount <= 0) {
    throw new Error("amount must be a positive integer value");
  }
  if (unit == TimeFrameUnit.MIN && amount > 59) {
    throw new Error(
      "minute timeframe can only be used with amount between 1-59"
    );
  }
  if (unit == TimeFrameUnit.HOUR && amount > 23) {
    throw new Error("hour timeframe can only be used with amounts 1-23");
  }
  if (
    (unit == TimeFrameUnit.DAY || unit == TimeFrameUnit.WEEK) &&
    amount != 1
  ) {
    throw new Error("day and week timeframes can only be used with amount 1");
  }
  if (unit == TimeFrameUnit.MONTH && ![1, 2, 3, 6, 12].includes(amount)) {
    throw new Error(
      "month timeframe can only be used with amount 1, 2, 3, 6 and 12"
    );
  }
  return `${amount}${unit}`;
}

export interface RawCorporateActions {
  cash_dividends?: Array<RawCashDividend>;
  reverse_splits?: Array<RawReverseSplit>;
  forward_splits?: Array<RawForwardSplit>;
  unit_splits?: Array<RawUnitSplit>;
  cash_mergers?: Array<RawCashMerger>;
  stock_mergers?: Array<RawStockMerger>;
  stock_and_cash_mergers?: Array<RawStockAndCashMerger>;
  stock_dividends?: Array<RawStockDividends>;
  redemptions?: Array<RawRedemption>;
  spin_offs?: Array<RawSpinOff>;
  name_changes?: Array<RawNameChange>;
  worthless_removals?: Array<RawWorthlessRemoval>;
  rights_distributions?: Array<RawRightsDistribution>;
}

export interface RawCashDividend {
  ex_date: string;
  foreign: boolean;
  payable_date: string;
  process_date: string;
  rate: number;
  record_date: string;
  special: boolean;
  symbol: string;
}

export interface RawReverseSplit {
  ex_date: string;
  new_rate: number;
  old_rate: number;
  payable_date: string;
  process_date: string;
  record_date: string;
  symbol: string;
}

export interface RawForwardSplit {
  due_bill_redemption_date: string;
  ex_date: string;
  new_rate: number;
  old_rate: number;
  payable_date: string;
  process_date: string;
  record_date: string;
  symbol: string;
}

export interface RawUnitSplit {
  alternate_rate: number;
  alternate_symbol: string;
  effective_date: string;
  new_rate: number;
  new_symbol: string;
  old_rate: number;
  old_symbol: string;
  process_date: string;
}

export interface RawCashMerger {
  acquiree_symbol: string;
  acquirer_symbol: string;
  effective_date: string;
  process_date: string;
  rate: number;
}

export interface RawStockMerger {
  acquiree_rate: number;
  acquiree_symbol: string;
  acquirer_rate: number;
  acquirer_symbol: string;
  effective_date: string;
  payable_date: string;
  process_date: string;
}

export interface RawStockAndCashMerger extends RawStockMerger {
  cash_rate: number;
}

export interface RawStockDividends {
  ex_date: string;
  payable_date: string;
  process_date: string;
  rate: number;
  record_date: string;
  symbol: string;
}

export interface RawRedemption {
  payable_date: string;
  process_date: string;
  rate: number;
  symbol: string;
}

export interface RawSpinOff {
  ex_date: string;
  new_rate: number;
  new_symbol: string;
  process_date: string;
  record_date: string;
  rate: number;
  source_rate: number;
  source_symbol: string;
}

export interface RawNameChange {
  new_symbol: string;
  old_symbol: string;
  process_date: string;
}

export interface RawWorthlessRemoval {
  symbol: string;
  process_date: string;
}

export interface RawRightsDistribution {
  source_symbol: string;
  new_symbol: string;
  rate: number;
  process_date: string;
  ex_date: string;
  payable_date: string;
  record_date: string;
  expiration_date: string;
}

export interface CorporateActions {
  CashDividends: Array<CashDividend>;
  ReverseSplits: Array<ReverseSplit>;
  ForwardSplits: Array<ForwardSplit>;
  UnitSplits: Array<UnitSplit>;
  CashMergers: Array<CashMerger>;
  StockMergers: Array<StockMerger>;
  StockAndCashMerger: Array<StockAndCashMerger>;
  StockDividends: Array<StockDividends>;
  Redemptions: Array<Redemption>;
  SpinOffs: Array<SpinOff>;
  NameChanges: Array<NameChange>;
  WorthlessRemovals: Array<WorthlessRemoval>;
  RightsDistributions: Array<RightsDistribution>;
}

export interface CashDividend {
  ExDate: string;
  Foreign: boolean;
  PayableDate: string;
  ProcessDate: string;
  Rate: number;
  RecordDate: string;
  Special: boolean;
  Symbol: string;
}

export interface ReverseSplit {
  ExDate: string;
  NewRate: number;
  OldRate: number;
  PayableDate: string;
  ProcessDate: string;
  RecordDate: string;
  Symbol: string;
}

export interface ForwardSplit {
  DueBillRedemptionDate: string;
  ExDate: string;
  NewRate: number;
  OldRate: number;
  PayableDate: string;
  ProcessDate: string;
  RecordDate: string;
  Symbol: string;
}

export interface UnitSplit {
  AlternateRate: number;
  AlternateSymbol: string;
  EffectiveDate: string;
  NewRate: number;
  NewSymbol: string;
  OldRate: number;
  OldSymbol: string;
  ProcessDate: string;
}

export interface CashMerger {
  AcquireeSymbol: string;
  AcquirerSymbol: string;
  EffectiveDate: string;
  ProcessDate: string;
  Rate: number;
}

export interface StockMerger {
  AcquireeRate: number;
  AcquireeSymbol: string;
  AcquirerRate: number;
  AcquirerSymbol: string;
  EffectiveDate: string;
  PayableDate: string;
  ProcessDate: string;
}

export interface StockAndCashMerger extends StockMerger {
  CashRate: number;
}

export interface StockDividends {
  ExDate: string;
  PayableDate: string;
  ProcessDate: string;
  Rate: number;
  RecordDate: string;
  Symbol: string;
}

export interface Redemption {
  PayableDate: string;
  ProcessDate: string;
  Rate: number;
  Symbol: string;
}

export interface SpinOff {
  ExDate: string;
  NewRate: number;
  NewSymbol: string;
  ProcessDate: string;
  RecordDate: string;
  Rate: number;
  SourceSymbol: string;
}

export interface NameChange {
  NewSymbol: string;
  OldSymbol: string;
  ProcessDate: string;
}

export interface WorthlessRemoval {
  Symbol: string;
  ProcessDate: string;
}

export interface RightsDistribution {
  SourceSymbol: string;
  NewSymbol: string;
  Rate: number;
  ProcessDate: string;
  ExDate: string;
  PayableDate: string;
  RecordDate: string;
  ExpirationDate: string;
}

export function convertCorporateActions(
  data: RawCorporateActions
): CorporateActions {
  const cas = {} as CorporateActions;

  if (data.cash_dividends?.length) {
    cas.CashDividends ??= Array<CashDividend>();

    data.cash_dividends.forEach((cd) => {
      cas.CashDividends.push({
        ExDate: cd.ex_date,
        Foreign: cd.foreign,
        PayableDate: cd.payable_date,
        ProcessDate: cd.process_date,
        Rate: cd.rate,
        RecordDate: cd.record_date,
        Special: cd.special,
        Symbol: cd.symbol,
      });
    });
  }
  if (data.reverse_splits?.length) {
    cas.ReverseSplits ??= Array<ReverseSplit>();

    data.reverse_splits.forEach((rs) => {
      cas.ReverseSplits.push({
        ExDate: rs.ex_date,
        NewRate: rs.new_rate,
        OldRate: rs.old_rate,
        PayableDate: rs.payable_date,
        ProcessDate: rs.process_date,
        RecordDate: rs.record_date,
        Symbol: rs.symbol,
      });
    });
  }
  if (data.forward_splits?.length) {
    cas.ForwardSplits ??= Array<ForwardSplit>();

    data.forward_splits.forEach((fs) => {
      cas.ForwardSplits.push({
        DueBillRedemptionDate: fs.due_bill_redemption_date,
        ExDate: fs.ex_date,
        NewRate: fs.new_rate,
        OldRate: fs.old_rate,
        PayableDate: fs.payable_date,
        ProcessDate: fs.process_date,
        RecordDate: fs.record_date,
        Symbol: fs.symbol,
      });
    });
  }
  if (data.unit_splits?.length) {
    cas.UnitSplits ??= Array<UnitSplit>();

    data.unit_splits.forEach((fs) => {
      cas.UnitSplits.push({
        AlternateRate: fs.alternate_rate,
        AlternateSymbol: fs.alternate_symbol,
        EffectiveDate: fs.effective_date,
        NewRate: fs.new_rate,
        NewSymbol: fs.new_symbol,
        OldRate: fs.old_rate,
        OldSymbol: fs.old_symbol,
        ProcessDate: fs.process_date,
      });
    });
  }
  if (data.cash_mergers?.length) {
    cas.CashMergers ??= Array<CashMerger>();

    data.cash_mergers.forEach((cm) => {
      cas.CashMergers.push({
        AcquireeSymbol: cm.acquiree_symbol,
        AcquirerSymbol: cm.acquirer_symbol,
        EffectiveDate: cm.effective_date,
        ProcessDate: cm.process_date,
        Rate: cm.rate,
      });
    });
  }
  if (data.stock_mergers?.length) {
    cas.StockMergers ??= Array<StockMerger>();

    data.stock_mergers.forEach((sm) => {
      cas.StockMergers.push({
        AcquireeRate: sm.acquiree_rate,
        AcquireeSymbol: sm.acquiree_symbol,
        AcquirerRate: sm.acquirer_rate,
        AcquirerSymbol: sm.acquirer_symbol,
        EffectiveDate: sm.effective_date,
        PayableDate: sm.payable_date,
        ProcessDate: sm.process_date,
      });
    });
  }
  if (data.stock_and_cash_mergers?.length) {
    cas.StockAndCashMerger ??= Array<StockAndCashMerger>();

    data.stock_and_cash_mergers.forEach((scm) => {
      cas.StockAndCashMerger.push({
        AcquireeRate: scm.acquiree_rate,
        AcquireeSymbol: scm.acquiree_symbol,
        AcquirerRate: scm.acquirer_rate,
        AcquirerSymbol: scm.acquirer_symbol,
        EffectiveDate: scm.effective_date,
        PayableDate: scm.payable_date,
        ProcessDate: scm.process_date,
        CashRate: scm.cash_rate,
      });
    });
  }
  if (data.stock_dividends?.length) {
    cas.StockDividends ??= Array<StockDividends>();

    data.stock_dividends.forEach((sd) => {
      cas.StockDividends.push({
        ExDate: sd.ex_date,
        PayableDate: sd.payable_date,
        ProcessDate: sd.process_date,
        Rate: sd.rate,
        RecordDate: sd.record_date,
        Symbol: sd.symbol,
      });
    });
  }
  if (data.redemptions?.length) {
    cas.Redemptions ??= Array<Redemption>();

    data.redemptions.forEach((r) => {
      cas.Redemptions.push({
        PayableDate: r.payable_date,
        ProcessDate: r.process_date,
        Rate: r.rate,
        Symbol: r.symbol,
      });
    });
  }
  if (data.spin_offs?.length) {
    cas.SpinOffs ??= Array<SpinOff>();
    data.spin_offs.forEach((so) => {
      cas.SpinOffs.push({
        ExDate: so.ex_date,
        NewRate: so.new_rate,
        NewSymbol: so.new_symbol,
        ProcessDate: so.process_date,
        RecordDate: so.record_date,
        Rate: so.source_rate,
        SourceSymbol: so.source_symbol,
      });
    });
  }
  if (data.name_changes?.length) {
    cas.NameChanges = cas.NameChanges ? cas.NameChanges : Array<NameChange>();
    data.name_changes.forEach((nc) => {
      cas.NameChanges.push({
        NewSymbol: nc.new_symbol,
        OldSymbol: nc.old_symbol,
        ProcessDate: nc.process_date,
      });
    });
  }
  if (data.worthless_removals?.length) {
    cas.WorthlessRemovals = cas.WorthlessRemovals
      ? cas.WorthlessRemovals
      : Array<WorthlessRemoval>();
    data.worthless_removals.forEach((wr) => {
      cas.WorthlessRemovals.push({
        Symbol: wr.symbol,
        ProcessDate: wr.process_date,
      });
    });
  }
  if (data.rights_distributions?.length) {
    cas.RightsDistributions = cas.RightsDistributions
      ? cas.RightsDistributions
      : Array<RightsDistribution>();
    data.rights_distributions.forEach((rd) => {
      cas.RightsDistributions.push({
        SourceSymbol: rd.source_symbol,
        NewSymbol: rd.new_symbol,
        Rate: rd.rate,
        ProcessDate: rd.process_date,
        ExDate: rd.ex_date,
        PayableDate: rd.payable_date,
        RecordDate: rd.record_date,
        ExpirationDate: rd.expiration_date,
      });
    });
  }
  return cas;
}

export function getCorporateActionsSize(cas: CorporateActions): number {
  let sum = 0;
  for (const key in cas) {
    sum += cas[key as keyof CorporateActions]
      ? cas[key as keyof CorporateActions].length
      : 0;
  }
  return sum;
}

export function mergeCorporateActions(
  ca1: CorporateActions,
  ca2: CorporateActions
): CorporateActions {
  return {
    CashDividends: (ca1.CashDividends || []).concat(ca2.CashDividends || []),
    ReverseSplits: (ca1.ReverseSplits || []).concat(ca2.ReverseSplits || []),
    ForwardSplits: (ca1.ForwardSplits || []).concat(ca2.ForwardSplits || []),
    UnitSplits: (ca1.UnitSplits || []).concat(ca2.UnitSplits || []),
    CashMergers: (ca1.CashMergers || []).concat(ca2.CashMergers || []),
    StockMergers: (ca1.StockMergers || []).concat(ca2.StockMergers || []),
    StockAndCashMerger: (ca1.StockAndCashMerger || []).concat(
      ca2.StockAndCashMerger || []
    ),
    StockDividends: (ca1.StockDividends || []).concat(ca2.StockDividends || []),
    Redemptions: (ca1.Redemptions || []).concat(ca2.Redemptions || []),
    SpinOffs: (ca1.SpinOffs || []).concat(ca2.SpinOffs || []),
    NameChanges: (ca1.NameChanges || []).concat(ca2.NameChanges || []),
    WorthlessRemovals: (ca1.WorthlessRemovals || []).concat(
      ca2.WorthlessRemovals || []
    ),
    RightsDistributions: (ca1.RightsDistributions || []).concat(
      ca2.RightsDistributions || []
    ),
  };
}
