"use strict";

import type { Alpaca } from "../alpaca-trade-api";

export function getAll(this: Alpaca, options?: Record<string, unknown>) {
  return this.sendRequest("/assets", options);
}

export function getOne(this: Alpaca, symbol: string) {
  return this.sendRequest("/assets/" + symbol);
}
