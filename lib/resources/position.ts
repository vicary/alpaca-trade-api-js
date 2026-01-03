"use strict";

import type { Alpaca } from "../alpaca-trade-api";
import type { Order } from "./order";

export type Position = {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  avg_entry_price: string;
  qty: string;
  side: string;
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  unrealized_intraday_pl: string;
  unrealized_intraday_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
  asset_marginable: boolean;
  qty_available: string;
};

export type PositionClosed = {
  symbol: string;
  status: number;
  body: Order;
};

export function getAll(this: Alpaca): Promise<Position[]> {
  return this.sendRequest("/positions");
}

export function getOne(this: Alpaca, symbol: string): Promise<Position> {
  return this.sendRequest("/positions/" + symbol);
}

export function closeAll(this: Alpaca): Promise<PositionClosed[]> {
  return this.sendRequest("/positions", undefined, undefined, "DELETE");
}

export function closeOne(this: Alpaca, symbol: string): Promise<Order> {
  return this.sendRequest(
    "/positions/" + symbol,
    undefined,
    undefined,
    "DELETE",
  );
}
