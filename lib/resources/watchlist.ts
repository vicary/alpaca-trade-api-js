"use strict";

import type { Alpaca } from "../alpaca-trade-api";
import type { Asset } from "./asset";

export type Watchlist = {
  id: string;
  account_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  assets: Asset[];
};

export function getAll(this: Alpaca): Promise<Watchlist[]> {
  return this.sendRequest("/watchlists");
}

export function getOne(this: Alpaca, id: string): Promise<Watchlist> {
  return this.sendRequest(`/watchlists/${id}`);
}

export function addWatchlist(
  this: Alpaca,
  name: string,
  symbols?: string | string[],
): Promise<Watchlist> {
  if (typeof symbols === "string") {
    symbols = [symbols];
  }

  return this.sendRequest(
    "/watchlists",
    undefined,
    { name, symbols: symbols?.join(",") || undefined },
    "POST",
  );
}

export function addToWatchlist(
  this: Alpaca,
  id: string,
  symbol: string,
): Promise<Watchlist> {
  return this.sendRequest(`/watchlists/${id}`, undefined, { symbol }, "POST");
}

export function updateWatchlist(
  this: Alpaca,
  id: string,
  newWatchList: { name: string; symbols?: string | string[] },
): Promise<Watchlist> {
  return this.sendRequest(`/watchlists/${id}`, undefined, newWatchList, "PUT");
}

export function deleteWatchlist(this: Alpaca, id: string): Promise<void> {
  return this.sendRequest(`/watchlists/${id}`, undefined, undefined, "DELETE");
}

export function deleteFromWatchlist(
  this: Alpaca,
  id: string,
  symbol: string,
): Promise<Watchlist> {
  return this.sendRequest(
    `/watchlists/${id}/${symbol}`,
    undefined,
    undefined,
    "DELETE",
  );
}
