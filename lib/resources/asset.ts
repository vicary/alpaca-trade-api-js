"use strict";

import type { Alpaca } from "../alpaca-trade-api";

export type AssetClass = "us_equity" | "us_option" | "crypto";

export type AssetExchange =
  | "AMEX"
  | "ARCA"
  | "BATS"
  | "NYSE"
  | "NASDAQ"
  | "NYSEARCA"
  | "OTC";

export type AssetStatus = "active" | "inactive";

export type AssetAttribute =
  | "ptp_no_exception"
  | "ptp_with_exception"
  | "ipo"
  | "has_options"
  | "options_late_close";

// Inferred from Alpaca Trading API OpenAPI schema for GET /v2/assets.
export type Asset = {
  id: string;
  class: AssetClass;
  cusip?: string | null;
  exchange: AssetExchange;
  symbol: string;
  name: string;
  status: AssetStatus;
  tradable: boolean;
  marginable: boolean;
  shortable: boolean;
  easy_to_borrow: boolean;
  fractionable: boolean;
  /** @deprecated Please use margin_requirement_long or margin_requirement_short instead. */
  maintenance_margin_requirement?: number;
  margin_requirement_long?: string;
  margin_requirement_short?: string;
  attributes?: AssetAttribute[];
};

export type AssetGetAllOptions = {
  status?: AssetStatus;
  asset_class?: AssetClass;
  exchange?: AssetExchange;
  attributes?: AssetAttribute[];
};

export function getAll(
  this: Alpaca,
  options?: AssetGetAllOptions
): Promise<Asset[]> {
  return this.sendRequest("/assets", options);
}

export function getOne(this: Alpaca, symbol: string): Promise<Asset> {
  return this.sendRequest("/assets/" + symbol);
}
