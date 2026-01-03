"use strict";

import type { Alpaca } from "../alpaca-trade-api";

export type OrderStatus =
  | "new"
  | "partially_filled"
  | "filled"
  | "done_for_day"
  | "canceled"
  | "expired"
  | "rejected";

export type OrderType =
  | "market"
  | "limit"
  | "stop"
  | "stop_limit"
  | "trailing_stop";

export type OrderSide = "buy" | "sell";

export type TimeInForce = "day" | "gtc" | "opg" | "ioc" | "fok" | "cls";

export type Order = {
  id: string;
  client_order_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  filled_at: string | null;
  expired_at: string | null;
  canceled_at: string | null;
  failed_at: string | null;
  asset_id: string;
  symbol: string;
  asset_class: string;
  qty: string;
  filled_qty: string;
  type: OrderType;
  side: OrderSide;
  time_in_force: TimeInForce;
  limit_price: string | null;
  stop_price: string | null;
  filled_avg_price: string | null;
  status: OrderStatus;
  extended_hours: boolean;
  legs: Order[] | null;
  trail_price: string | null;
  trail_percent: string | null;
  hwm: string | null;
};

export type CancelAllResponse = {
  id: string;
  status: number;
};

export type GetAllOrdersOptions = {
  status?: "open" | "closed" | "all";
  until?: string;
  after?: string;
  limit?: number;
  direction?: "asc" | "desc";
  nested?: boolean;
  symbols?: string | Array<string>;
};

export function getAll(
  this: Alpaca,
  options?: GetAllOrdersOptions,
): Promise<Order[]> {
  return this.sendRequest("/orders", options);
}

export function getOne(this: Alpaca, id: string): Promise<Order> {
  return this.sendRequest("/orders/" + id);
}

export function getByClientOrderId(
  this: Alpaca,
  clientOrderId: string,
): Promise<Order> {
  return this.sendRequest("/orders:by_client_order_id", {
    client_order_id: clientOrderId,
  });
}

export function post(this: Alpaca, order: unknown): Promise<Order> {
  return this.sendRequest("/orders", undefined, order, "POST");
}

export function cancel(this: Alpaca, id: string): Promise<void> {
  return this.sendRequest("/orders/" + id, undefined, undefined, "DELETE");
}

export function cancelAll(this: Alpaca): Promise<CancelAllResponse[]> {
  return this.sendRequest("/orders", undefined, undefined, "DELETE");
}

export function patchOrder(
  this: Alpaca,
  id: string,
  newOrder: unknown,
): Promise<Order> {
  return this.sendRequest(`/orders/${id}`, undefined, newOrder, "PATCH");
}
