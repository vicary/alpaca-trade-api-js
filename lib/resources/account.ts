"use strict";

import type { Alpaca } from "../alpaca-trade-api";

export type AccountStatus =
  | "ACTIVE"
  | "ONBOARDING"
  | "SUBMITTED"
  | "APPROVAL_PENDING"
  | "ACCOUNT_UPDATED"
  | "SUBMISSION_FAILED"
  | "REJECTED";

export type Account = {
  id: string;
  account_number: string;
  status: AccountStatus;
  currency: string;
  cash: string;
  portfolio_value: string;
  buying_power: string;
  regt_buying_power: string;
  daytrading_buying_power: string;
  non_marginable_buying_power: string;
  accrued_fees: string;
  pending_transfer_in: string;
  pending_transfer_out: string;
  pattern_day_trader: boolean;
  trade_suspended_by_user: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  created_at: string;
  shorting_enabled: boolean;
  long_market_value: string;
  short_market_value: string;
  equity: string;
  last_equity: string;
  multiplier: string;
  initial_margin: string;
  maintenance_margin: string;
  sma: string;
  daytrade_count: number;
  balance_asof: string;
  last_maintenance_margin: string;
  options_approved_level: number;
  options_trading_level: number;
  intraday_adjustments: string;
  pending_reg_taf_fees: string;
};

export type AccountConfigurations = {
  dtbp_check: "entry" | "exit" | "both";
  trade_confirm_email: "all" | "none";
  suspend_trade: boolean;
  no_shorting: boolean;
  fractional_trading: boolean;
  max_margin_multiplier: "1" | "2" | "4";
  max_options_trading_level: 0 | 1 | 2 | 3;
  pdt_check: "entry" | "exit" | "both";
  ptp_no_exception_entry: boolean;
  disable_overnight_trading: boolean;
};

export type TradeActivity = {
  activity_type: "FILL";
  cum_qty: string;
  id: string;
  leaves_qty: string;
  price: string;
  qty: string;
  side: string;
  symbol: string;
  transaction_time: string;
  order_id: string;
  type: "fill";
};

export type NonTradeActivity = {
  activity_type: "DIV";
  id: string;
  date: string;
  net_amount: string;
  symbol: string;
  cusip: string;
  qty: string;
  per_share_amount: string;
};

export type PortfolioHistory = {
  timestamp: number[];
  equity: number[];
  profit_loss: number[];
  profit_loss_pct: number[];
  base_value: number;
  timeframe: string;
};

export function get(this: Alpaca): Promise<Account> {
  return this.sendRequest("/account");
}

export function updateConfigs(
  this: Alpaca,
  configs: Record<string, unknown>,
): Promise<AccountConfigurations> {
  return this.sendRequest(
    "/account/configurations",
    undefined,
    configs,
    "PATCH",
  );
}

export function getConfigs(this: Alpaca): Promise<AccountConfigurations> {
  return this.sendRequest("/account/configurations");
}

export type GetActivitiesOptions = {
  activityTypes?: string | Array<string>;
  until?: string;
  after?: string;
  direction?: "asc" | "desc";
  date?: string;
  pageSize?: number;
  pageToken?: string;
};

export function getActivities(
  this: Alpaca,
  {
    activityTypes,
    until,
    after,
    direction,
    date,
    pageSize,
    pageToken,
  }: GetActivitiesOptions,
): Promise<(TradeActivity | NonTradeActivity)[]> {
  if (Array.isArray(activityTypes)) {
    activityTypes = activityTypes.join(",");
  }

  return this.sendRequest("/account/activities", {
    activity_types: activityTypes,
    until,
    after,
    direction,
    date,
    page_size: pageSize,
    page_token: pageToken,
  });
}

export type GetPortfolioHistoryOptions = {
  date_start?: string;
  date_end?: string;
  period?: string;
  timeframe?: string;
  extended_hours?: boolean;
};

export function getPortfolioHistory(
  this: Alpaca,
  {
    date_start,
    date_end,
    period,
    timeframe,
    extended_hours,
  }: GetPortfolioHistoryOptions,
): Promise<PortfolioHistory> {
  return this.sendRequest("/account/portfolio/history", {
    date_start,
    date_end,
    period,
    timeframe,
    extended_hours,
  });
}
