"use strict";

import type { Alpaca } from "../alpaca-trade-api";

export function getAll(this: Alpaca) {
  return this.sendRequest("/watchlists");
}

export function getOne(this: Alpaca, id: string) {
  return this.sendRequest(`/watchlists/${id}`);
}

export function addWatchlist(
  this: Alpaca,
  name: string,
  symbols?: string | string[]
) {
  if (typeof symbols === "string") {
    symbols = [symbols];
  }

  return this.sendRequest(
    "/watchlists",
    undefined,
    { name, symbols: symbols?.join(",") || undefined },
    "POST"
  );
}

export function addToWatchlist(this: Alpaca, id: string, symbol: string) {
  return this.sendRequest(`/watchlists/${id}`, undefined, { symbol }, "POST");
}

export function updateWatchlist(
  this: Alpaca,
  id: string,
  newWatchList: { name: string; symbols?: string[] }
) {
  return this.sendRequest(`/watchlists/${id}`, undefined, newWatchList, "PUT");
}

export function deleteWatchlist(this: Alpaca, id: string) {
  return this.sendRequest(`/watchlists/${id}`, undefined, undefined, "DELETE");
}

export function deleteFromWatchlist(this: Alpaca, id: string, symbol: string) {
  return this.sendRequest(
    `/watchlists/${id}/${symbol}`,
    undefined,
    undefined,
    "DELETE"
  );
}
