"use strict";

import type { Alpaca } from "../alpaca-trade-api";

export type Clock = {
  timestamp: string;
  is_open: boolean;
  next_open: string;
  next_close: string;
};

export function get(this: Alpaca): Promise<Clock> {
  return this.sendRequest("/clock");
}
