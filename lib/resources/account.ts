"use strict";

import type { Alpaca } from "../alpaca-trade-api";

export function get(this: Alpaca) {
  return this.sendRequest("/account");
}

export function updateConfigs(this: Alpaca, configs: Record<string, unknown>) {
  return this.sendRequest(
    "/account/configurations",
    undefined,
    configs,
    "PATCH"
  );
}

export function getConfigs(this: Alpaca) {
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
  }: GetActivitiesOptions
) {
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
  }: GetPortfolioHistoryOptions
) {
  return this.sendRequest("/account/portfolio/history", {
    date_start,
    date_end,
    period,
    timeframe,
    extended_hours,
  });
}
