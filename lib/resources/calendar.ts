"use strict";

import type { Alpaca } from "../alpaca-trade-api";
import { toDateString } from "../utils/dateformat";

export type CalendarGetOptions = {
  start?: Date;
  end?: Date;
};

export function get(this: Alpaca, { start, end }: CalendarGetOptions = {}) {
  return this.sendRequest("/calendar", {
    start: toDateString(start),
    end: toDateString(end),
  });
}
