import Fs from "fs";
import https from "https";
import msgpack5 from "msgpack5";
import WebSocket, { Server as WebSocketServer } from "ws";

const msgpack = msgpack5();

const client = {
  key: "key1",
  secret: "secret1",
};

const trade_appl = {
  T: "t",
  i: 1532,
  S: "AAPL",
  x: "Q",
  p: 144.6,
  s: 25,
  t: "2021-01-27T10:35:34.82840127Z",
  c: ["@", "F", "T", "I"],
  z: "C",
};

const quote_appl = {
  T: "q",
  S: "AAPL",
  bx: "Z",
  bp: 139.74,
  bs: 3,
  ax: "Q",
  ap: 139.77,
  as: 1,
  t: "2021-01-28T15:20:41.384564Z",
  c: "R",
  z: "C",
};

const bar_aapl = {
  T: "b",
  S: "AAPL",
  o: 127.82,
  h: 128.32,
  l: 126.32,
  c: 126.9,
  v: 72015712,
  t: "2021-05-25T04:00:00Z",
  vw: 127.07392,
  n: 462915,
};

const status_AAPL = {
  T: "s",
  S: "AAPL",
  sc: "StatusCode",
  sm: "StatusMessage",
  rc: "ReasonCode",
  rm: "ReasonMessage",
  t: "Timestamp",
  z: "Tape",
};

const barUpdate_AAPL = {
  T: "u",
  S: "AAPL",
  o: 100,
  h: 101.2,
  l: 98.67,
  c: 101.3,
  v: 2570,
  t: "2021-03-05T16:00:30Z",
  n: 1235,
  vw: 100.123457,
};

type SubscriptionState = {
  trades: string[];
  quotes: string[];
  bars: string[];
  updatedBars: string[];
  dailyBars: string[];
  statuses: string[];
  lulds: string[];
  cancelErrors: string[];
  corrections: string[];
};

export class StreamingWsMock {
  httpsServer: https.Server;
  conn: WebSocketServer;
  subscriptions: SubscriptionState;
  ready: Promise<void>;

  constructor(port: number) {
    this.httpsServer = https.createServer({
      key: Fs.readFileSync("test/support/key.pem"),
      cert: Fs.readFileSync("test/support//cert.pem"),
    });

    this.conn = new WebSocketServer({
      server: this.httpsServer,
      path: "/v2/sip",
      perMessageDeflate: {
        serverNoContextTakeover: false,
        clientNoContextTakeover: false,
      },
    });

    this.conn.on("connection", (socket: WebSocket) => {
      socket.send(msgpack.encode([{ T: "success", msg: "connected" }]));
      this.conn.emit("open");

      socket.on("message", (msg: WebSocket.RawData) => {
        this.messageHandler(msg, socket);
      });

      socket.on("error", (err) => console.log(err));
    });

    this.conn.on("ping", (data) => {
      this.conn.pong(data);
    });

    this.ready = new Promise((resolve) => {
      this.httpsServer.listen(port, () => {
        resolve();
      });
    });

    this.subscriptions = {
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
  }

  messageHandler(msg: WebSocket.RawData, socket: WebSocket) {
    const message = msgpack.decode(msg as Buffer) as any;
    const action = message.action ?? null;

    if (!action) {
      socket.send(
        msgpack.encode([
          {
            T: "error",
            code: 400,
            msg: "invalid syntax",
          },
        ])
      );
      return;
    }

    switch (action) {
      case "auth":
        this.authenticate(message, socket);
        break;
      case "subscribe":
        this.handleSubscription(message, socket);
        break;
      case "unsubscribe":
        this.handleUnsubscription(message, socket);
        break;
    }
  }

  handleSubscription(msg: any, socket: WebSocket) {
    if (!this.checkSubMsgSyntax(msg, socket)) {
      return;
    }

    this.subscriptions.trades = [...this.subscriptions.trades, ...msg.trades];
    this.subscriptions.quotes = [...this.subscriptions.quotes, ...msg.quotes];
    this.subscriptions.bars = [...this.subscriptions.bars, ...msg.bars];
    this.subscriptions.updatedBars = [
      ...this.subscriptions.updatedBars,
      ...msg.updatedBars,
    ];
    this.subscriptions.dailyBars = [
      ...this.subscriptions.dailyBars,
      ...msg.dailyBars,
    ];
    this.subscriptions.statuses = [
      ...this.subscriptions.statuses,
      ...msg.statuses,
    ];
    this.subscriptions.lulds = [...this.subscriptions.lulds, ...msg.lulds];

    socket.send(msgpack.encode(this.createSubMsg()));
    this.streamData(socket);
  }

  handleUnsubscription(msg: any, socket: WebSocket) {
    if (!this.checkSubMsgSyntax(msg, socket)) {
      return;
    }

    this.subscriptions.trades = this.subscriptions.trades.filter(
      (val) => msg.trades.indexOf(val) === -1
    );
    this.subscriptions.quotes = this.subscriptions.quotes.filter(
      (val) => msg.quotes.indexOf(val) === -1
    );
    this.subscriptions.bars = this.subscriptions.bars.filter(
      (val) => msg.bars.indexOf(val) === -1
    );
    this.subscriptions.updatedBars = this.subscriptions.updatedBars.filter(
      (val) => msg.updatedBars.indexOf(val) === -1
    );
    this.subscriptions.dailyBars = this.subscriptions.dailyBars.filter(
      (val) => msg.dailyBars.indexOf(val) === -1
    );
    this.subscriptions.statuses = this.subscriptions.statuses.filter(
      (val) => msg.statuses.indexOf(val) === -1
    );
    this.subscriptions.lulds = this.subscriptions.lulds.filter(
      (val) => msg.lulds.indexOf(val) === -1
    );

    socket.send(msgpack.encode(this.createSubMsg()));
  }

  checkSubMsgSyntax(msg: any, socket: WebSocket) {
    if (!msg.trades || !msg.quotes || !msg.bars) {
      socket.send(
        msgpack.encode([
          {
            T: "error",
            code: 400,
            msg: "invalid syntax",
          },
        ])
      );
      return false;
    }
    return true;
  }

  createSubMsg() {
    return [
      {
        T: "subscription",
        trades: this.subscriptions.trades,
        quotes: this.subscriptions.quotes,
        bars: this.subscriptions.bars,
        updatedBars: this.subscriptions.updatedBars,
        dailyBars: this.subscriptions.dailyBars,
        statuses: this.subscriptions.statuses,
        lulds: this.subscriptions.lulds,
        cancelErrors: this.subscriptions.trades, // Subscribed automatically.
        corrections: this.subscriptions.trades, // Subscribed automatically.
      },
    ];
  }

  streamData(socket: WebSocket) {
    if (this.subscriptions.trades.length > 0) {
      socket.send(msgpack.encode([trade_appl]));
    }
    if (this.subscriptions.quotes.length > 0) {
      socket.send(msgpack.encode([quote_appl]));
    }
    if (this.subscriptions.statuses.length > 0) {
      socket.send(msgpack.encode([status_AAPL]));
    }
    if (this.subscriptions.bars.length > 0) {
      socket.send(msgpack.encode([bar_aapl]));
    }
    if (this.subscriptions.updatedBars.length > 0) {
      socket.send(msgpack.encode([barUpdate_AAPL]));
    }
  }

  authenticate(message: any, socket: WebSocket) {
    if (message.key === client.key && message.secret === client.secret) {
      socket.send(
        msgpack.encode([
          {
            T: "success",
            msg: "authenticated",
          },
        ])
      );
    } else {
      socket.send(
        msgpack.encode([
          {
            T: "error",
            code: 402,
            msg: "auth failed",
          },
        ])
      );
    }
  }

  close() {
    for (const client of this.conn.clients) {
      client.close();
    }
    this.httpsServer.close(() => {
      this.conn.close();
    });
  }
}
