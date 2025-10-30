"use strict";

import type { Alpaca } from "../alpaca-trade-api";

export function get(this: Alpaca) {
  return this.sendRequest("/clock");
}
