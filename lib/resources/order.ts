"use strict";

import type { Alpaca } from "../alpaca-trade-api";

export type GetAllOrdersOptions = {
  status?: "open" | "closed" | "all";
  until?: string;
  after?: string;
  limit?: number;
  direction?: "asc" | "desc";
  nested?: boolean;
  symbols?: string | Array<string>;
};

export function getAll(this: Alpaca, options?: GetAllOrdersOptions) {
  return this.sendRequest("/orders", options);
}

export function getOne(this: Alpaca, id: string) {
  return this.sendRequest("/orders/" + id);
}

export function getByClientOrderId(this: Alpaca, clientOrderId: string) {
  return this.sendRequest("/orders:by_client_order_id", {
    client_order_id: clientOrderId,
  });
}

export function post(this: Alpaca, order: unknown) {
  return this.sendRequest("/orders", undefined, order, "POST");
}

export function cancel(this: Alpaca, id: string) {
  return this.sendRequest("/orders/" + id, undefined, undefined, "DELETE");
}

export function cancelAll(this: Alpaca) {
  return this.sendRequest("/orders", undefined, undefined, "DELETE");
}

export function patchOrder(this: Alpaca, id: string, newOrder: unknown) {
  return this.sendRequest(`/orders/${id}`, undefined, newOrder, "PATCH");
}
