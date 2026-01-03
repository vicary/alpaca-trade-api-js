import "dotenv/config";

import * as api from "./api";
import * as account from "./resources/account";
import * as asset from "./resources/asset";
import * as calendar from "./resources/calendar";
import * as clock from "./resources/clock";
import * as order from "./resources/order";
import * as position from "./resources/position";
import * as watchlist from "./resources/watchlist";

import * as crypto_websocket from "./resources/datav2/crypto_websocket_v1beta3";
import * as entityV2 from "./resources/datav2/entityv2";
import * as news_stream from "./resources/datav2/news_websocket";
import * as option_stream from "./resources/datav2/option_websocket_v1beta1";
import * as dataV2 from "./resources/datav2/rest_v2";
import * as websockets_v2 from "./resources/datav2/stock_websocket_v2";

import * as websockets from "./resources/websockets";

export type AlpacaOptions = {
  baseUrl?: string;
  dataBaseUrl?: string;
  dataStreamUrl?: string;
  keyId?: string;
  secretKey?: string;
  apiVersion?: string;
  oauth?: string;
  feed?: string;
  optionFeed?: string;
  verbose?: boolean;
  timeout?: number;
  paper?: boolean;
};

export class Alpaca {
  constructor(config: AlpacaOptions = {}) {
    this.configuration = {
      baseUrl:
        config.baseUrl ||
        process.env.APCA_API_BASE_URL ||
        (config.paper
          ? "https://paper-api.alpaca.markets"
          : "https://api.alpaca.markets"),
      dataBaseUrl:
        config.dataBaseUrl ||
        process.env.APCA_DATA_BASE_URL ||
        process.env.DATA_PROXY_WS ||
        "https://data.alpaca.markets",
      dataStreamUrl:
        config.dataStreamUrl ||
        process.env.APCA_API_STREAM_URL ||
        "https://stream.data.alpaca.markets",
      keyId: config.keyId || process.env.APCA_API_KEY_ID || "",
      secretKey: config.secretKey || process.env.APCA_API_SECRET_KEY || "",
      apiVersion: config.apiVersion || process.env.APCA_API_VERSION || "v2",
      oauth: config.oauth || process.env.APCA_API_OAUTH || "",
      feed: config.feed || "iex", // use 'sip' if you have PRO subscription
      optionFeed: config.optionFeed || "indicative", // use 'opra' if you have PRO subscription
      verbose: config.verbose ?? false,
      paper: config.paper ?? false,
      timeout: config.timeout || 10000,
    };
    this.data_ws = new websockets.AlpacaStreamClient({
      url: this.configuration.dataBaseUrl,
      apiKey: this.configuration.keyId,
      secretKey: this.configuration.secretKey,
      oauth: this.configuration.oauth,
    });

    this.trade_ws = new websockets.AlpacaStreamClient({
      url: this.configuration.baseUrl,
      apiKey: this.configuration.keyId,
      secretKey: this.configuration.secretKey,
      oauth: this.configuration.oauth,
    });

    this.data_stream_v2 = new websockets_v2.AlpacaStocksClient({
      url: this.configuration.dataStreamUrl,
      feed: this.configuration.feed,
      apiKey: this.configuration.keyId,
      secretKey: this.configuration.secretKey,
      verbose: this.configuration.verbose,
    });

    this.adjustment = dataV2.Adjustment;
    this.timeframeUnit = entityV2.TimeFrameUnit;
    this.crypto_stream_v1beta3 = new crypto_websocket.AlpacaCryptoClient({
      url: this.configuration.dataStreamUrl,
      apiKey: this.configuration.keyId,
      secretKey: this.configuration.secretKey,
      verbose: this.configuration.verbose,
    });

    this.news_stream = new news_stream.AlpacaNewsCLient({
      url: this.configuration.dataStreamUrl,
      apiKey: this.configuration.keyId,
      secretKey: this.configuration.secretKey,
      verbose: this.configuration.verbose,
    });

    this.option_stream = new option_stream.AlpacaOptionClient({
      url: this.configuration.dataStreamUrl,
      feed: this.configuration.optionFeed,
      apiKey: this.configuration.keyId,
      secretKey: this.configuration.secretKey,
      verbose: this.configuration.verbose,
    });
  }

  configuration: Required<AlpacaOptions>;

  data_ws: websockets.AlpacaStreamClient;

  trade_ws: websockets.AlpacaStreamClient;

  data_stream_v2: websockets_v2.AlpacaStocksClient;

  adjustment: typeof dataV2.Adjustment;

  timeframeUnit: typeof entityV2.TimeFrameUnit;

  crypto_stream_v1beta3: crypto_websocket.AlpacaCryptoClient;

  news_stream: news_stream.AlpacaNewsCLient;

  option_stream: option_stream.AlpacaOptionClient;

  // Helper methods
  httpRequest = api.httpRequest.bind(this);
  dataHttpRequest = api.dataHttpRequest.bind(this);
  sendRequest(
    endpoint: string,
    queryParams?: Record<string, unknown>,
    body?: unknown,
    method?: string
  ): Promise<any> {
    return api.sendRequest.call(
      this,
      this.httpRequest,
      endpoint,
      queryParams,
      body,
      method
    );
  }

  // Account
  getAccount = account.get;
  updateAccountConfigurations = account.updateConfigs;
  getAccountConfigurations = account.getConfigs;
  getAccountActivities = account.getActivities;
  getPortfolioHistory = account.getPortfolioHistory;

  // Positions
  getPositions = position.getAll;
  getPosition = position.getOne;
  closeAllPositions = position.closeAll;
  closePosition = position.closeOne;

  // Calendar
  getCalendar = calendar.get;

  // Clock
  getClock = clock.get;

  // Asset
  getAssets = asset.getAll;
  getAsset = asset.getOne;

  // Order
  getOrders = order.getAll;
  getOrder = order.getOne;
  getOrderByClientId = order.getByClientOrderId;
  createOrder = order.post;
  replaceOrder = order.patchOrder;
  cancelOrder = order.cancel;
  cancelAllOrders = order.cancelAll;

  //DataV2
  getTradesV2(
    symbol: string,
    options: dataV2.GetTradesParams,
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getTrades(symbol, options, {
      ...this.configuration,
      ...config,
    });
  }
  getMultiTradesV2(
    symbols: string | string[],
    options: dataV2.GetTradesParams,
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getMultiTrades(symbols, options, {
      ...this.configuration,
      ...config,
    });
  }
  getQuotesV2(
    symbol: string,
    options: dataV2.GetQuotesParams,
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getQuotes(symbol, options, {
      ...this.configuration,
      ...config,
    });
  }
  getMultiQuotesV2(
    symbols: string | string[],
    options: dataV2.GetQuotesParams,
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getMultiQuotes(symbols, options, {
      ...this.configuration,
      ...config,
    });
  }
  getBarsV2(
    symbol: string,
    options: dataV2.GetBarsParams,
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getBars(symbol, options, {
      ...this.configuration,
      ...config,
    });
  }
  getMultiBarsV2(
    symbols: string | string[],
    options: dataV2.GetBarsParams,
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getMultiBars(symbols, options, {
      ...this.configuration,
      ...config,
    });
  }
  getLatestTrade(symbol: string, config?: Partial<dataV2.HttpRequestConfig>) {
    return dataV2.getLatestTrade(symbol, {
      ...this.configuration,
      ...config,
    });
  }
  getLatestTrades(
    symbols: string | string[],
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getLatestTrades(symbols, {
      ...this.configuration,
      ...config,
    });
  }
  getLatestQuote(symbol: string, config?: Partial<dataV2.HttpRequestConfig>) {
    return dataV2.getLatestQuote(symbol, {
      ...this.configuration,
      ...config,
    });
  }
  getLatestQuotes(
    symbols: string | string[],
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getLatestQuotes(symbols, {
      ...this.configuration,
      ...config,
    });
  }
  getLatestBar(symbol: string, config?: Partial<dataV2.HttpRequestConfig>) {
    return dataV2.getLatestBar(symbol, {
      ...this.configuration,
      ...config,
    });
  }
  getLatestBars(
    symbols: string | string[],
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getLatestBars(symbols, {
      ...this.configuration,
      ...config,
    });
  }
  getSnapshot(symbol: string, config?: Partial<dataV2.HttpRequestConfig>) {
    return dataV2.getSnapshot(symbol, {
      ...this.configuration,
      ...config,
    });
  }
  getSnapshots(
    symbols: string | string[],
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getSnapshots(symbols, {
      ...this.configuration,
      ...config,
    });
  }
  getCryptoTrades(
    symbols: string | string[],
    options: dataV2.GetCryptoTradesParams,
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getCryptoTrades(symbols, options, {
      ...this.configuration,
      ...config,
    });
  }
  getCryptoQuotes(
    symbols: string | string[],
    options: dataV2.GetCryptoQuotesParams,
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getCryptoQuotes(symbols, options, {
      ...this.configuration,
      ...config,
    });
  }
  getCryptoBars(
    symbols: string | string[],
    options: dataV2.GetCryptoBarsParams,
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getCryptoBars(symbols, options, {
      ...this.configuration,
      ...config,
    });
  }
  getLatestCryptoTrades(
    symbols: string | string[],
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getLatestCryptoTrades(symbols, {
      ...this.configuration,
      ...config,
    });
  }
  getLatestCryptoQuotes(
    symbols: string | string[],
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getLatestCryptoQuotes(symbols, {
      ...this.configuration,
      ...config,
    });
  }
  getLatestCryptoBars(
    symbols: string | string[],
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getLatestCryptoBars(symbols, {
      ...this.configuration,
      ...config,
    });
  }
  getCryptoSnapshots(
    symbols: string | string[],
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getCryptoSnapshots(symbols, {
      ...this.configuration,
      ...config,
    });
  }
  getCryptoOrderbooks(
    symbols: string | string[],
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getLatestCryptoOrderbooks(symbols, {
      ...this.configuration,
      ...config,
    });
  }
  getOptionBars(
    symbols: string | string[],
    options: dataV2.GetOptionBarsParams,
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getMultiOptionBars(symbols, options, {
      ...this.configuration,
      ...config,
    });
  }
  getOptionTrades(
    symbols: string | string[],
    options: dataV2.GetOptionTradesParams,
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getMultiOptionTrades(symbols, options, {
      ...this.configuration,
      ...config,
    });
  }
  getOptionLatestTrades(
    symbols: string | string[],
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getLatestOptionTrades(symbols, {
      ...this.configuration,
      ...config,
    });
  }
  getOptionLatestQuotes(
    symbols: string | string[],
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getLatestOptionQuotes(symbols, {
      ...this.configuration,
      ...config,
    });
  }
  getOptionSnapshots(
    symbols: string | string[],
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getOptionSnapshots(symbols, {
      ...this.configuration,
      ...config,
    });
  }
  getOptionChain(
    underlying_symbol: string,
    options: dataV2.GetQuotesParams,
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getOptionChain(underlying_symbol, options, {
      ...this.configuration,
      ...config,
    });
  }
  getCorporateActions(
    symbols: string | string[],
    options: dataV2.GetQuotesParams,
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getCorporateActions(symbols, options, {
      ...this.configuration,
      ...config,
    });
  }
  getNews(
    options: dataV2.GetNewsParams,
    config?: Partial<dataV2.HttpRequestConfig>
  ) {
    return dataV2.getNews(options, {
      ...this.configuration,
      ...config,
    });
  }
  newTimeframe(amount: number, unit: entityV2.TimeFrameUnit) {
    return entityV2.NewTimeframe(amount, unit);
  }

  // Watchlists
  getWatchlists = watchlist.getAll;
  getWatchlist = watchlist.getOne;
  addWatchlist = watchlist.addWatchlist;
  addToWatchlist = watchlist.addToWatchlist;
  updateWatchlist = watchlist.updateWatchlist;
  deleteWatchlist = watchlist.deleteWatchlist;
  deleteFromWatchlist = watchlist.deleteFromWatchlist;
}
