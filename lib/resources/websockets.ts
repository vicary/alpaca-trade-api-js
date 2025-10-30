"use strict";

import events from "events";
import { TextDecoder } from "util";
import WebSocket from "ws";
import * as entity from "./entity";

// Listeners
// A client can listen on any of the following events, states, or errors
// Connection states. Each of these will also emit EVENT.STATE_CHANGE
export enum STATE {
  AUTHENTICATING = "authenticating",
  CONNECTED = "connected",
  CONNECTING = "connecting",
  DISCONNECTED = "disconnected",
  WAITING_TO_CONNECT = "waiting to connect",
  WAITING_TO_RECONNECT = "waiting to reconnect",
}
// Client events
export enum EVENT {
  CLIENT_ERROR = "client_error",
  STATE_CHANGE = "state_change",
  AUTHORIZED = "authorized",
  UNAUTHORIZED = "unauthorized",
  ORDER_UPDATE = "trade_updates",
  ACCOUNT_UPDATE = "account_updates",
  STOCK_TRADES = "stock_trades",
  STOCK_QUOTES = "stock_quotes",
  STOCK_AGG_SEC = "stock_agg_sec",
  STOCK_AGG_MIN = "stock_agg_min",
}
// Connection errors Each of these will also emit EVENT.ERROR
export enum ERROR {
  BAD_KEY_OR_SECRET = "bad key id or secret",
  CONNECTION_REFUSED = "connection refused",
  MISSING_API_KEY = "missing api key",
  MISSING_SECRET_KEY = "missing secret key",
  PROTOBUF = "protobuf error",
  UNKNOWN = "unknown error",
}

export type AlpacaStreamClientOptions = {
  backoff?: boolean;
  backoffIncrement?: number;
  maxReconnectTimeout?: number;
  reconnect?: boolean;
  reconnectTimeout?: number;
  url?: string;
  apiKey?: string;
  secretKey?: string;
  oauth?: string;
};

/**
 * AlpacaStreamClient manages a connection to Alpaca's websocket api
 */
export class AlpacaStreamClient extends events.EventEmitter {
  constructor(opts: AlpacaStreamClientOptions = {}) {
    super();

    // Set minimum reconnectTimeout of 1s if backoff=false
    if (!opts.backoff && (opts.reconnectTimeout ?? 0) < 1) {
      opts.reconnectTimeout = 1;
    }
    // Merge supplied options with defaults
    this.session = Object.assign(this.defaultOptions, opts);

    this.session.url = this.session.url?.replace(/^http/, "ws") + "/stream";
    // Keep track of subscriptions in case we need to reconnect after the client
    // has called subscribe()

    this.session.subscriptions.forEach((x) => {
      this.subscriptionState[x] = true;
    });

    // Register internal event handlers
    // Log and emit every state change
    Object.keys(STATE).forEach((s) => {
      const state = STATE[s as keyof typeof STATE];
      this.on(state, () => {
        this.currentState = state;
        this.log("info", `state change: ${state}`);
        this.emit(EVENT.STATE_CHANGE, state);
      });
    });
    // Log and emit every error
    Object.keys(ERROR).forEach((e) => {
      const error = ERROR[e as keyof typeof ERROR];
      this.on(error, () => {
        this.log("error", error);
        this.emit(EVENT.CLIENT_ERROR, error);
      });
    });
  }

  STATE = STATE;

  EVENT = EVENT;

  ERROR = ERROR;

  readonly defaultOptions = {
    // A list of subscriptions to subscribe to on connection
    subscriptions: [],
    // Whether the library should reconnect automatically
    reconnect: true,
    // Reconnection backoff: if true, then the reconnection time will be initially
    // reconnectTimeout, then will double with each unsuccessful connection attempt.
    // It will not exceed maxReconnectTimeout
    backoff: true,
    // Initial reconnect timeout (seconds) a minimum of 1 will be used if backoff=false
    reconnectTimeout: 0,
    // The maximum amount of time between reconnect tries (applies to backoff)
    maxReconnectTimeout: 30,
    // The amount of time to increment the delay between each reconnect attempt
    backoffIncrement: 0.5,
    // If true, client outputs detailed log messages
    verbose: false,
    // If true we will use the polygon ws data source, otherwise we use
    // alpaca ws data source
    usePolygon: false,
  };

  session: typeof this.defaultOptions & {
    url?: string;
    apiKey?: string;
    secretKey?: string;
    oauth?: string;
  };

  subscriptionState: Record<string, boolean> = {};

  currentState = STATE.WAITING_TO_CONNECT;

  conn?: WebSocket;

  reconnectDisabled = false;

  polygon?: any;

  connect() {
    // Check the credentials
    if (!this.session.apiKey && !this.session.oauth) {
      throw new Error(ERROR.MISSING_API_KEY);
    }
    if (!this.session.secretKey && !this.session.oauth) {
      throw new Error(ERROR.MISSING_SECRET_KEY);
    }
    if (!this.session.url) {
      throw new Error("missing url");
    }
    // Reset reconnectDisabled since the user called connect() again
    this.reconnectDisabled = false;
    this.emit(STATE.CONNECTING);
    this.conn = new WebSocket(this.session.url);
    this.conn.once("open", () => {
      this.authenticate();
    });
    this.conn.on("message", (data) => this.handleMessage(data));
    this.conn.once("error", () => {
      this.emit(ERROR.CONNECTION_REFUSED);
    });
    this.conn.once("close", () => {
      this.emit(STATE.DISCONNECTED);
      if (this.session.reconnect && !this.reconnectDisabled) {
        this.reconnect();
      }
    });
  }

  _ensure_polygon(channels: string[]) {
    if (this.polygon.connectCalled) {
      if (channels) {
        this.polygon.subscribe(channels);
      }
      return;
    }
    this.polygon.connect(channels);
  }

  _unsubscribe_polygon(channels: string[]) {
    if (this.polygon.connectCalled) {
      if (channels) {
        this.polygon.unsubscribe(channels);
      }
    }
  }

  subscribe(keys: string[]) {
    const wsChannels: string[] = [];
    const polygonChannels: string[] = [];
    keys.forEach((key) => {
      const poly = ["Q.", "T.", "A.", "AM."];
      const found = poly.filter((channel) => key.startsWith(channel));
      if (found.length > 0) {
        polygonChannels.push(key);
      } else {
        wsChannels.push(key);
      }
    });
    if (wsChannels.length > 0) {
      const subMsg = {
        action: "listen",
        data: {
          streams: wsChannels,
        },
      };
      this.send(JSON.stringify(subMsg));
    }
    if (polygonChannels.length > 0) {
      this._ensure_polygon(polygonChannels);
    }
    keys.forEach((x) => {
      this.subscriptionState[x] = true;
    });
  }

  unsubscribe(keys: string[]) {
    // Currently, only Polygon channels can be unsubscribed from
    const polygonChannels: string[] = [];
    keys.forEach((key) => {
      const poly = ["Q.", "T.", "A.", "AM."];
      const found = poly.filter((channel) => key.startsWith(channel));
      if (found.length > 0) {
        polygonChannels.push(key);
      }
    });
    if (polygonChannels.length > 0) {
      this._unsubscribe_polygon(polygonChannels);
    }
    keys.forEach((x) => {
      this.subscriptionState[x] = false;
    });
  }

  subscriptions() {
    // if the user unsubscribes from certain equities, they will still be
    // under this.subscriptionState but with value "false", so we need to
    // filter them out
    return Object.keys(this.subscriptionState).filter(
      (x) => this.subscriptionState[x]
    );
  }

  onConnect(fn: () => void) {
    this.on(STATE.CONNECTED, () => fn());
  }

  onDisconnect(fn: () => void) {
    this.on(STATE.DISCONNECTED, () => fn());
  }

  onStateChange(fn: (newState: string) => void) {
    this.on(EVENT.STATE_CHANGE, (newState) => fn(newState));
  }

  onError(fn: (err: Error) => void) {
    this.on(EVENT.CLIENT_ERROR, (err) => fn(err));
  }

  onOrderUpdate(fn: (orderUpdate: any) => void) {
    this.on(EVENT.ORDER_UPDATE, (orderUpdate) => fn(orderUpdate));
  }

  onAccountUpdate(fn: (accountUpdate: any) => void) {
    this.on(EVENT.ACCOUNT_UPDATE, (accountUpdate) => fn(accountUpdate));
  }

  onPolygonConnect(fn: () => void) {
    this.polygon.on(STATE.CONNECTED, () => fn());
  }

  onPolygonDisconnect(fn: () => void) {
    this.polygon.on(STATE.DISCONNECTED, () => fn());
  }

  onStockTrades(fn: (subject: string, data: unknown) => void) {
    if (this.session.usePolygon) {
      this.polygon.on(
        EVENT.STOCK_TRADES,
        function (subject: string, data: unknown) {
          fn(subject, data);
        }
      );
    } else {
      this.on(EVENT.STOCK_TRADES, function (subject: string, data: unknown) {
        fn(subject, data);
      });
    }
  }

  onStockQuotes(fn: (subject: string, data: unknown) => void) {
    if (this.session.usePolygon) {
      this.polygon.on(
        EVENT.STOCK_QUOTES,
        function (subject: string, data: unknown) {
          fn(subject, data);
        }
      );
    } else {
      this.on(EVENT.STOCK_QUOTES, function (subject: string, data: unknown) {
        fn(subject, data);
      });
    }
  }

  onStockAggSec(fn: (subject: string, data: unknown) => void) {
    this.polygon.on(
      EVENT.STOCK_AGG_SEC,
      function (subject: string, data: unknown) {
        fn(subject, data);
      }
    );
  }

  onStockAggMin(fn: (subject: string, data: unknown) => void) {
    if (this.session.usePolygon) {
      this.polygon.on(
        EVENT.STOCK_AGG_MIN,
        function (subject: string, data: unknown) {
          fn(subject, data);
        }
      );
    } else {
      this.on(EVENT.STOCK_AGG_MIN, function (subject: string, data: unknown) {
        fn(subject, data);
      });
    }
  }

  send(data: unknown) {
    this.conn?.send(data);
  }

  disconnect() {
    this.reconnectDisabled = true;
    this.conn?.close();
    if (this.polygon) {
      this.polygon.close();
    }
  }

  state() {
    return this.currentState;
  }

  get(key: keyof typeof this.session) {
    return this.session[key];
  }

  reconnect() {
    setTimeout(() => {
      if (this.session.backoff) {
        this.session.reconnectTimeout += this.session.backoffIncrement;
        if (this.session.reconnectTimeout > this.session.maxReconnectTimeout) {
          this.session.reconnectTimeout = this.session.maxReconnectTimeout;
        }
      }
      this.connect();
    }, this.session.reconnectTimeout * 1000);
    this.emit(STATE.WAITING_TO_RECONNECT, this.session.reconnectTimeout);
  }

  authenticate() {
    this.emit(STATE.AUTHENTICATING);

    const authMsg = {
      action: "authenticate",
      data: {
        key_id: this.session.apiKey,
        secret_key: this.session.secretKey,
      },
    };
    this.send(JSON.stringify(authMsg));
  }

  handleMessage(data: Buffer | ArrayBuffer | Buffer[]) {
    // Heartbeat
    const bytes = new Uint8Array(
      data instanceof ArrayBuffer
        ? data
        : Array.isArray(data)
        ? Buffer.concat(data.map((buffer) => Uint8Array.from(buffer)))
        : data
    );
    if (bytes.length === 1 && bytes[0] === 1) {
      return;
    }
    const message = JSON.parse(new TextDecoder("utf-8").decode(bytes));
    const subject = message.stream;
    if ("error" in message.data) {
      console.log(message.data.error);
    }
    switch (subject) {
      case "authorization":
        this.authResultHandler(message.data.status);
        break;
      case "listening":
        this.log("debug", `listening to the streams: ${message.data.streams}`);
        break;
      case "trade_updates":
        this.emit(EVENT.ORDER_UPDATE, message.data);
        break;
      case "account_updates":
        this.emit(EVENT.ACCOUNT_UPDATE, message.data);
        break;
      default:
        if (message.stream.startsWith("T.")) {
          this.emit(
            EVENT.STOCK_TRADES,
            subject,
            entity.AlpacaTrade(message.data)
          );
        } else if (message.stream.startsWith("Q.")) {
          this.emit(
            EVENT.STOCK_QUOTES,
            subject,
            entity.AlpacaQuote(message.data)
          );
        } else if (message.stream.startsWith("AM.")) {
          this.emit(
            EVENT.STOCK_AGG_MIN,
            subject,
            entity.AggMinuteBar(message.data)
          );
        } else {
          this.emit(ERROR.PROTOBUF);
        }
    }
  }

  authResultHandler(authResult: string) {
    switch (authResult) {
      case "authorized":
        this.emit(STATE.CONNECTED);
        break;
      case "unauthorized":
        this.emit(ERROR.BAD_KEY_OR_SECRET);
        this.disconnect();
        break;
      default:
        break;
    }
  }

  log(level: "debug" | "log" | "info" | "error" | "warn", ...msg: unknown[]) {
    if (this.session.verbose) {
      console[level](...msg);
    }
  }
}
exports.AlpacaStreamClient = AlpacaStreamClient;
