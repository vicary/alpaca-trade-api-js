"use strict";

import type { Alpaca } from "../alpaca-trade-api";

export function getAll(this: Alpaca) {
  return this.sendRequest("/positions");
}

export function getOne(this: Alpaca, symbol: string) {
  return this.sendRequest("/positions/" + symbol);
}

export function closeAll(this: Alpaca) {
  return this.sendRequest("/positions", undefined, undefined, "DELETE");
}

export function closeOne(this: Alpaca, symbol: string) {
  return this.sendRequest(
    "/positions/" + symbol,
    undefined,
    undefined,
    "DELETE"
  );
}
