/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  AlpacaBar,
  AlpacaBarV2,
  AlpacaCryptoBar,
  AlpacaCryptoOrderbook,
  AlpacaCryptoQuote,
  AlpacaCryptoSnapshot,
  AlpacaCryptoTrade,
  AlpacaNews,
  AlpacaOptionBar,
  AlpacaOptionBarV1Beta1,
  AlpacaOptionQuote,
  AlpacaOptionQuoteV1Beta1,
  AlpacaOptionSnapshot,
  AlpacaOptionSnapshotV1Beta1,
  AlpacaOptionTrade,
  AlpacaOptionTradeV1Beta1,
  AlpacaQuote,
  AlpacaQuoteV2,
  AlpacaSnapshot,
  AlpacaSnapshotV2,
  AlpacaTrade,
  AlpacaTradeV2,
  CorporateActions,
  CryptoBar,
  CryptoOrderbook,
  CryptoQuote,
  CryptoSnapshot,
  CryptoTrade,
  convertCorporateActions,
  getCorporateActionsSize,
  mergeCorporateActions,
} from "./entityv2";

// Number of data points to return.
const V2_MAX_LIMIT = 10000;
const V2_NEWS_MAX_LIMIT = 50;
const V1_BETA1_MAX_LIMIT = 1000;

export enum Adjustment {
  RAW = "raw",
  DIVIDEND = "dividend",
  SPLIT = "split",
  ALL = "all",
}

export enum TYPE {
  TRADES = "trades",
  QUOTES = "quotes",
  BARS = "bars",
  SNAPSHOTS = "snapshots",
}

export type PaginationOptions = {
  limit?: number;
  pageLimit?: number;
};

export type HttpRequestConfig = {
  dataBaseUrl: string;
  keyId: string;
  secretKey: string;
  oauth: string;
  signal?: AbortSignal;
};

export async function dataV2HttpRequest(
  url: string,
  queryParams: Record<
    string,
    boolean | string | string[] | number | null | undefined
  >,
  config: HttpRequestConfig
) {
  const { dataBaseUrl, keyId, secretKey, oauth, signal } = config;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Encoding": "gzip",
  };
  if (oauth == "") {
    headers["APCA-API-KEY-ID"] = keyId;
    headers["APCA-API-SECRET-KEY"] = secretKey;
  } else {
    headers["Authorization"] = "Bearer " + oauth;
  }

  const urlObj = new URL(`${dataBaseUrl}${url}`);

  for (const [k, v] of Object.entries(queryParams)) {
    if (v == null) continue;

    urlObj.searchParams.append(k, v.toString());
  }

  const response = await fetch(urlObj, {
    method: "GET",
    headers: headers,
    signal: signal,
  });

  const responseText = await response.text();
  const responseJson = JSON.parse(responseText);

  if (!response.ok) {
    throw new Error(
      `code: ${responseJson.status || response.status}, message: ${
        responseJson.message
      }`
    );
  }

  if (typeof responseJson !== "object" || responseJson === null) {
    throw new Error("invalid response format");
  }

  return responseJson;
}

function getQueryLimit(
  totalLimit: number,
  pageLimit: number,
  received: number
): number {
  let limit = 0;
  if (pageLimit !== 0) {
    limit = pageLimit;
  }
  if (totalLimit !== 0) {
    const remaining = totalLimit - received;
    if (remaining <= 0) {
      // this should never happen
      return -1;
    }
    if (limit == 0 || limit > remaining) {
      limit = remaining;
    }
  }
  return limit;
}

export async function* getDataV2(
  endpoint: TYPE,
  path: string,
  options: PaginationOptions,
  config: HttpRequestConfig
) {
  let pageToken: string | undefined = undefined;
  let received = 0;
  const pageLimit = options.pageLimit
    ? Math.min(options.pageLimit, V2_MAX_LIMIT)
    : V2_MAX_LIMIT;

  delete options.pageLimit;
  options.limit = options.limit ?? 0;

  while (options.limit > received || options.limit === 0) {
    let limit;

    if (options.limit !== 0) {
      limit = getQueryLimit(options.limit, pageLimit, received);

      if (limit == -1) {
        break;
      }
    } else {
      limit = null;
    }

    const resp = await dataV2HttpRequest(
      path,
      { ...options, limit, page_token: pageToken },
      config
    );

    const items = resp[endpoint] || [];

    for (const item of items) {
      // Allow signal to be cancelled during item emission, on top of fetch.
      config.signal?.throwIfAborted();

      yield item;
    }

    received += items.length;
    pageToken = resp.next_page_token;

    if (!pageToken) {
      break;
    }
  }
}

export async function* getMultiDataV2(
  symbols: Array<string>,
  url: string,
  endpoint: string,
  options: PaginationOptions,
  config: HttpRequestConfig
): AsyncGenerator<{ symbol: string; data: any }, void, unknown> {
  let pageToken: string | null = null;
  let received = 0;
  const pageLimit = options.pageLimit
    ? Math.min(options.pageLimit, V2_MAX_LIMIT)
    : V2_MAX_LIMIT;
  delete options.pageLimit;
  options.limit = options.limit ?? 0;
  while (options.limit > received || options.limit === 0) {
    const limit = getQueryLimit(options.limit, pageLimit, received);
    if (limit == -1) {
      break;
    }

    const params = {
      ...options,
      symbols: symbols.join(","),
      limit: limit,
      page_token: pageToken,
    };
    const resp = await dataV2HttpRequest(`${url}${endpoint}`, params, config);
    const items = resp[endpoint];
    for (const symbol in items) {
      for (const data of items[symbol]) {
        received++;
        yield { symbol: symbol, data: data };
      }
    }
    pageToken = resp.next_page_token;
    if (!pageToken) {
      break;
    }
  }
}

export interface GetTradesParams {
  start?: string;
  end?: string;
  pageLimit?: number;
  limit?: number;
  feed?: string;
  asof?: string;
  page_token?: string;
  sort?: Sort;
}

export async function* getTrades(
  symbol: string,
  options: GetTradesParams,
  config: HttpRequestConfig
): AsyncGenerator<AlpacaTrade, void, unknown> {
  const trades = getDataV2(
    TYPE.TRADES,
    `/v2/stocks/${symbol}/${TYPE.TRADES}`,
    options,
    config
  );
  for await (const trade of trades) {
    yield AlpacaTradeV2(trade);
  }
}

export async function* getMultiTrades(
  symbols: string | string[],
  options: GetTradesParams,
  config: HttpRequestConfig
): AsyncGenerator<AlpacaTrade, void, unknown> {
  const multiTrades = getMultiDataV2(
    Array.isArray(symbols) ? symbols : [symbols],
    "/v2/stocks/",
    TYPE.TRADES,
    options,
    config
  );
  for await (const t of multiTrades) {
    yield AlpacaTradeV2({ S: t.symbol, ...t.data });
  }
}

export interface GetQuotesParams {
  start?: string;
  end?: string;
  pageLimit?: number;
  limit?: number;
  feed?: string;
  asof?: string;
  page_token?: string;
  sort?: Sort;
}

export async function* getQuotes(
  symbol: string,
  options: GetQuotesParams,
  config: HttpRequestConfig
): AsyncGenerator<AlpacaQuote, void, unknown> {
  const quotes = getDataV2(
    TYPE.QUOTES,
    `/v2/stocks/${symbol}/${TYPE.QUOTES}`,
    options,
    config
  );
  for await (const quote of quotes) {
    yield AlpacaQuoteV2(quote);
  }
}

export async function* getMultiQuotes(
  symbols: string | string[],
  options: GetQuotesParams,
  config: HttpRequestConfig
): AsyncGenerator<AlpacaQuote, void, unknown> {
  const multiQuotes = getMultiDataV2(
    Array.isArray(symbols) ? symbols : [symbols],
    "/v2/stocks/",
    TYPE.QUOTES,
    options,
    config
  );
  for await (const q of multiQuotes) {
    yield AlpacaQuoteV2({ S: q.symbol, ...q.data });
  }
}

export interface GetBarsParams {
  timeframe: string;
  adjustment?: Adjustment;
  start?: string;
  end?: string;
  pageLimit?: number;
  limit?: number;
  feed?: string;
  asof?: string;
  page_token?: string;
  sort?: Sort;
}

export async function* getBars(
  symbol: string,
  options: GetBarsParams,
  config: HttpRequestConfig
): AsyncGenerator<AlpacaBar, void, unknown> {
  const bars = getDataV2(
    TYPE.BARS,
    `/v2/stocks/${symbol}/${TYPE.BARS}`,
    options,
    config
  );
  for await (const bar of bars || []) {
    yield AlpacaBarV2({ S: symbol, ...bar });
  }
}

export async function* getMultiBars(
  symbols: string | string[],
  options: GetBarsParams,
  config: HttpRequestConfig
): AsyncGenerator<AlpacaBar, void, unknown> {
  const multiBars = getMultiDataV2(
    Array.isArray(symbols) ? symbols : [symbols],
    "/v2/stocks/",
    TYPE.BARS,
    options,
    config
  );
  for await (const b of multiBars) {
    yield AlpacaBarV2({ S: b.symbol, ...b.data });
  }
}

export async function getLatestTrade(
  symbol: string,
  config: HttpRequestConfig
): Promise<AlpacaTrade> {
  const resp = await dataV2HttpRequest(
    `/v2/stocks/${symbol}/trades/latest`,
    {},
    config
  );
  return AlpacaTradeV2(resp.trade);
}

export async function* getLatestTrades(
  symbols: string | string[],
  config: HttpRequestConfig
): AsyncGenerator<AlpacaTrade, void, unknown> {
  const resp = await dataV2HttpRequest(
    `/v2/stocks/${TYPE.TRADES}/latest`,
    { symbols: Array.isArray(symbols) ? symbols.join(",") : symbols },
    config
  );
  for (const symbol in resp.trades) {
    yield AlpacaTradeV2({ S: symbol, ...resp.trades[symbol] });
  }
}

export async function getLatestQuote(
  symbol: string,
  config: HttpRequestConfig
): Promise<AlpacaQuote> {
  const resp = await dataV2HttpRequest(
    `/v2/stocks/${symbol}/quotes/latest`,
    {},
    config
  );
  return AlpacaQuoteV2(resp.quote);
}

export async function* getLatestQuotes(
  symbols: string | string[],
  config: HttpRequestConfig
): AsyncGenerator<AlpacaQuote, void, unknown> {
  const resp = await dataV2HttpRequest(
    `/v2/stocks/${TYPE.QUOTES}/latest`,
    { symbols: Array.isArray(symbols) ? symbols.join(",") : symbols },
    config
  );
  for (const symbol in resp.quotes) {
    yield AlpacaQuoteV2({ S: symbol, ...resp.quotes[symbol] });
  }
}

export async function getLatestBar(
  symbol: string,
  config: HttpRequestConfig
): Promise<AlpacaBar> {
  const resp = await dataV2HttpRequest(
    `/v2/stocks/${symbol}/bars/latest`,
    {},
    config
  );
  return AlpacaBarV2(resp.bar);
}

export async function* getLatestBars(
  symbols: string | string[],
  config: HttpRequestConfig
): AsyncGenerator<AlpacaBar, void, unknown> {
  const resp = await dataV2HttpRequest(
    `/v2/stocks/${TYPE.BARS}/latest`,
    { symbols: Array.isArray(symbols) ? symbols.join(",") : symbols },
    config
  );
  for (const symbol in resp.bars) {
    yield AlpacaBarV2({ S: symbol, ...resp.bars[symbol] });
  }
}

export async function getSnapshot(
  symbol: string,
  config: HttpRequestConfig
): Promise<AlpacaSnapshot> {
  const resp = await dataV2HttpRequest(
    `/v2/stocks/${symbol}/snapshot`,
    {},
    config
  );

  return AlpacaSnapshotV2(resp);
}

export async function* getSnapshots(
  symbols: string | string[],
  config: HttpRequestConfig
): AsyncGenerator<AlpacaSnapshot, void, unknown> {
  const snapshots = await dataV2HttpRequest(
    `/v2/stocks/snapshots?symbols=${
      Array.isArray(symbols) ? symbols.join(",") : symbols
    }`,
    {},
    config
  );
  for (const [symbol, snapshot] of Object.entries<any>(snapshots)) {
    yield AlpacaSnapshotV2({ symbol: symbol, ...snapshot });
  }
}

export interface GetCryptoTradesParams {
  start?: string;
  end?: string;
  limit?: number;
  pageLimit?: number;
  sort?: Sort;
}

export async function* getCryptoTrades(
  symbols: string | string[],
  options: GetCryptoTradesParams,
  config: HttpRequestConfig
): AsyncGenerator<CryptoTrade, void, unknown> {
  const cryptoTrades = getMultiDataV2(
    Array.isArray(symbols) ? symbols : [symbols],
    "/v1beta3/crypto/us/",
    TYPE.TRADES,
    options,
    config
  );
  for await (const t of cryptoTrades) {
    yield AlpacaCryptoTrade({ S: t.symbol, ...t.data });
  }
}

export interface GetCryptoQuotesParams {
  start?: string;
  end?: string;
  limit?: number;
  pageLimit?: number;
  sort?: Sort;
}

export async function* getCryptoQuotes(
  symbols: string | string[],
  options: GetCryptoQuotesParams,
  config: HttpRequestConfig
): AsyncGenerator<CryptoQuote, void, unknown> {
  const cryptoQuotes = getMultiDataV2(
    Array.isArray(symbols) ? symbols : [symbols],
    "/v1beta3/crypto/us/",
    TYPE.QUOTES,
    options,
    config
  );

  for await (const t of cryptoQuotes) {
    yield AlpacaCryptoQuote({ S: t.symbol, ...t.data });
  }
}

export interface GetCryptoBarsParams {
  start?: string;
  end?: string;
  timeframe: string;
  limit?: number;
  pageLimit?: number;
  sort?: Sort;
}

export async function* getCryptoBars(
  symbol: string | string[],
  options: GetCryptoBarsParams,
  config: HttpRequestConfig
): AsyncGenerator<CryptoBar, void, unknown> {
  const cryptoBars = getMultiDataV2(
    Array.isArray(symbol) ? symbol : [symbol],
    "/v1beta3/crypto/us/",
    TYPE.BARS,
    options,
    config
  );
  for await (const t of cryptoBars) {
    yield AlpacaCryptoBar({ T: "b", S: t.symbol, ...t.data });
  }
}

export async function* getLatestCryptoBars(
  symbols: string | string[],
  config: HttpRequestConfig
): AsyncGenerator<CryptoBar, void, unknown> {
  const resp = await dataV2HttpRequest(
    `/v1beta3/crypto/us/latest/bars`,
    { symbols: Array.isArray(symbols) ? symbols.join(",") : symbols },
    config
  );

  for (const [symbol, bar] of Object.entries<any>(resp.bars)) {
    yield AlpacaCryptoBar({ T: "b", S: symbol, ...bar });
  }
}

export async function* getLatestCryptoTrades(
  symbols: string | string[],
  config: HttpRequestConfig
): AsyncGenerator<CryptoTrade, void, unknown> {
  const resp = await dataV2HttpRequest(
    `/v1beta3/crypto/us/latest/trades`,
    { symbols: Array.isArray(symbols) ? symbols.join(",") : symbols },
    config
  );

  for (const [symbol, trade] of Object.entries<any>(resp.trades)) {
    yield AlpacaCryptoTrade({ T: "t", S: symbol, ...trade });
  }
}

export async function* getLatestCryptoQuotes(
  symbols: string | string[],
  config: HttpRequestConfig
): AsyncGenerator<CryptoQuote, void, unknown> {
  const resp = await dataV2HttpRequest(
    `/v1beta3/crypto/us/latest/quotes`,
    { symbols: Array.isArray(symbols) ? symbols.join(",") : symbols },
    config
  );

  for (const [symbol, quote] of Object.entries<any>(resp.quotes)) {
    yield AlpacaCryptoQuote({ T: "q", S: symbol, ...quote });
  }
}

export async function* getCryptoSnapshots(
  symbols: string | string[],
  config: HttpRequestConfig
): AsyncGenerator<CryptoSnapshot, void, unknown> {
  const resp = await dataV2HttpRequest(
    `/v1beta3/crypto/us/snapshots`,
    { symbols: Array.isArray(symbols) ? symbols.join(",") : symbols },
    config
  );

  for (const [symbol, snapshot] of Object.entries<any>(resp.snapshots)) {
    yield AlpacaCryptoSnapshot({ symbol, ...snapshot });
  }
}

export async function* getLatestCryptoOrderbooks(
  symbols: string | string[],
  config: HttpRequestConfig
): AsyncGenerator<CryptoOrderbook, void, unknown> {
  const resp = await dataV2HttpRequest(
    `/v1beta3/crypto/us/latest/orderbooks`,
    { symbols: Array.isArray(symbols) ? symbols.join(",") : symbols },
    config
  );

  for (const [symbol, orderbook] of Object.entries<any>(resp.orderbooks)) {
    yield AlpacaCryptoOrderbook({ S: symbol, ...orderbook });
  }
}

export enum Sort {
  ASC = "asc",
  DESC = "desc",
}

export interface GetNewsParams {
  // Symbols filters the news to the related symbols.
  // If empty or nil, all articles will be returned.
  symbols: Array<string>;
  // Start is the inclusive beginning of the interval
  start?: string;
  // End is the inclusive end of the interval
  end?: string;
  // Sort sets the sort order of the results. Sorting will be done by the UpdatedAt field.
  sort?: Sort;
  // IncludeContent tells the server to include the article content in the response.
  includeContent?: boolean;
  // ExcludeContentless tells the server to exclude articles that has no content.
  excludeContentless?: boolean;
  // TotalLimit is the limit of the total number of the returned news.
  totalLimit?: number;
  // PageLimit is the pagination size. If empty, the default page size will be used.
  pageLimit?: number;
}

function getNewsParams(options: GetNewsParams) {
  const query = {} as {
    symbols: string | null;
    start?: string;
    end?: string;
    sort?: Sort;
    include_content?: boolean;
    exclude_contentless?: boolean;
  };
  query.symbols =
    options.symbols?.length > 0 ? options.symbols.join(",") : null;
  query.start = options.start;
  query.end = options.end;
  query.sort = options.sort;
  query.include_content = options.includeContent;
  query.exclude_contentless = options.excludeContentless;
  return query;
}

export async function* getNews(
  options: GetNewsParams,
  config: HttpRequestConfig
): AsyncGenerator<AlpacaNews, void, unknown> {
  if (options.totalLimit && options.totalLimit < 0) {
    throw new Error("negative total limit");
  }
  if (options.pageLimit && options.pageLimit < 0) {
    throw new Error("negative page limit");
  }

  let pageToken: string | null = null;
  let received = 0;
  const pageLimit = options?.pageLimit
    ? Math.min(options.pageLimit, V2_NEWS_MAX_LIMIT)
    : V2_NEWS_MAX_LIMIT;
  delete options?.pageLimit;
  const totalLimit = options.totalLimit ?? 10;
  const params = getNewsParams(options);
  let limit;
  for (;;) {
    limit = getQueryLimit(totalLimit, pageLimit, received);
    if (limit < 1) {
      break;
    }

    const resp = await dataV2HttpRequest(
      "/v1beta1/news",
      { ...params, limit: limit, page_token: pageToken },
      config
    );
    for (const news of resp.news) {
      yield AlpacaNews(news);
    }
    received += resp.news.length;
    pageToken = resp.next_page_token;
    if (!pageToken) {
      break;
    }
  }
}

export interface GetOptionBarsParams {
  timeframe: string;
  start?: string;
  end?: string;
  pageLimit?: number;
  limit?: number;
  feed?: string;
  page_token?: string;
  sort?: Sort;
}

export async function* getMultiOptionBars(
  symbols: string | Array<string>,
  options: GetOptionBarsParams,
  config: HttpRequestConfig
): AsyncGenerator<AlpacaOptionBar, void, unknown> {
  const multiBars = getMultiDataV2(
    Array.isArray(symbols) ? symbols : [symbols],
    "/v1beta1/options/",
    TYPE.BARS,
    options,
    config
  );
  for await (const b of multiBars) {
    yield AlpacaOptionBarV1Beta1({ S: b.symbol, ...b.data });
  }
}

export interface GetOptionTradesParams {
  start?: string;
  end?: string;
  pageLimit?: number;
  limit?: number;
  feed?: string;
  page_token?: string;
  sort?: Sort;
}

export async function* getMultiOptionTrades(
  symbols: string | string[],
  options: GetOptionTradesParams,
  config: HttpRequestConfig
): AsyncGenerator<AlpacaOptionTrade, void, unknown> {
  const multiBars = getMultiDataV2(
    Array.isArray(symbols) ? symbols : [symbols],
    "/v1beta1/options/",
    TYPE.TRADES,
    options,
    config
  );
  for await (const b of multiBars) {
    yield AlpacaOptionTradeV1Beta1({ S: b.symbol, ...b.data });
  }
}

export async function* getLatestOptionTrades(
  symbols: string | string[],
  config: HttpRequestConfig
): AsyncGenerator<AlpacaOptionTrade, void, unknown> {
  const resp = await dataV2HttpRequest(
    `/v1beta1/options/${TYPE.TRADES}/latest`,
    { symbols: Array.isArray(symbols) ? symbols.join(",") : symbols },
    config
  );
  for (const symbol in resp.trades) {
    yield AlpacaOptionTradeV1Beta1({ S: symbol, ...resp.trades[symbol] });
  }
}

export async function* getLatestOptionQuotes(
  symbols: string | string[],
  config: HttpRequestConfig
): AsyncGenerator<AlpacaOptionQuote, void, unknown> {
  const resp = await dataV2HttpRequest(
    `/v1beta1/options/${TYPE.QUOTES}/latest`,
    { symbols: Array.isArray(symbols) ? symbols.join(",") : symbols },
    config
  );
  for (const symbol in resp.quotes) {
    yield AlpacaOptionQuoteV1Beta1({ S: symbol, ...resp.quotes[symbol] });
  }
}

export async function* getOptionSnapshots(
  symbols: string | string[],
  config: HttpRequestConfig
): AsyncGenerator<AlpacaOptionSnapshot, void, unknown> {
  const resp = await dataV2HttpRequest(
    `/v1beta1/options/snapshots?symbols=${
      Array.isArray(symbols) ? symbols.join(",") : symbols
    }`,
    {},
    config
  );
  for (const [key, val] of Object.entries<any>(resp.snapshots)) {
    yield AlpacaOptionSnapshotV1Beta1({ Symbol: key, ...val });
  }
}

export interface GetOptionChainParams {
  feed?: string;
  type?: string;
  pageLimit?: number;
  totalLimit?: number;
  strike_price_gte?: number;
  strike_price_lte?: number;
  expiration_date?: string;
  expiration_date_gte?: string;
  expiration_date_lte?: string;
  root_symbol?: string;
  page_token?: string;
}

export async function* getOptionChain(
  underlyingSymbol: string,
  options: GetOptionChainParams,
  config: HttpRequestConfig
): AsyncGenerator<AlpacaOptionSnapshot, void, unknown> {
  if (options.totalLimit && options.totalLimit < 0) {
    throw new Error("negative total limit");
  }
  if (options.pageLimit && options.pageLimit < 0) {
    throw new Error("negative page limit");
  }
  let pageToken: string | null = null;
  let received = 0;
  const pageLimit = options?.pageLimit
    ? Math.min(options.pageLimit, V1_BETA1_MAX_LIMIT)
    : V1_BETA1_MAX_LIMIT;
  delete options.pageLimit;
  const totalLimit = options?.totalLimit ?? 10000;
  delete options.totalLimit;
  let limit;
  for (;;) {
    limit = getQueryLimit(totalLimit, pageLimit, received);
    if (limit < 1) {
      break;
    }
    const resp = await dataV2HttpRequest(
      `/v1beta1/options/snapshots/${underlyingSymbol}`,
      { ...options, limit: limit, page_token: pageToken },
      config
    );

    for (const [key, val] of Object.entries<any>(resp.snapshots)) {
      yield AlpacaOptionSnapshotV1Beta1({ Symbol: key, ...val });
    }
    received = received + resp.snapshots.length;

    pageToken = resp.next_page_token;
    if (!pageToken) {
      break;
    }
  }
}

export interface GetCorporateActionParams {
  types?: Array<string>;
  start?: string;
  end?: string;
  pageLimit?: number;
  totalLimit?: number;
  page_token?: string;
  sort?: Sort;
}

export async function getCorporateActions(
  symbols: string | string[],
  options: GetCorporateActionParams,
  config: HttpRequestConfig
): Promise<CorporateActions | undefined> {
  if (options.totalLimit && options.totalLimit < 0) {
    throw new Error("negative total limit");
  }
  if (options.pageLimit && options.pageLimit < 0) {
    throw new Error("negative page limit");
  }

  let pageToken: string | null = null;
  let received = 0;
  const pageLimit = options?.pageLimit
    ? Math.min(options.pageLimit, V1_BETA1_MAX_LIMIT)
    : V1_BETA1_MAX_LIMIT;
  delete options?.pageLimit;
  const totalLimit = options?.totalLimit ?? V2_MAX_LIMIT;
  delete options.totalLimit;
  let result = {} as CorporateActions;
  const types = options?.types?.join(",");
  const params = {
    ...options,
    symbols: Array.isArray(symbols) ? symbols.join(",") : symbols,
    types,
  };
  let limit;
  for (;;) {
    limit = getQueryLimit(totalLimit, pageLimit, received);
    if (limit < 1) {
      break;
    }

    const resp = await dataV2HttpRequest(
      `/v1beta1/corporate-actions`,
      { ...params, limit: limit, page_token: pageToken },
      config
    );
    const cas = convertCorporateActions(resp.corporate_actions);
    result = mergeCorporateActions(result, cas);
    received += getCorporateActionsSize(cas);

    pageToken = resp.next_page_token;
    if (!pageToken) {
      break;
    }
  }
  return result;
}
