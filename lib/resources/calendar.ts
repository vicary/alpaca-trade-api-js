"use strict";

import type { Alpaca } from "../alpaca-trade-api";
import { toDateString } from "../utils/dateformat";

export type CalendarGetOptions = {
  start?: Date | string;
  end?: Date | string;
};

/**
 * Represents a market calendar day.
 * @see https://docs.alpaca.markets/reference/getcalendar-1
 */
export type Calendar = {
  /** Date string in "YYYY-MM-DD" format */
  date: string;
  /** Market open time in "HH:MM" format (e.g., "09:30") */
  open: string;
  /** Market close time in "HH:MM" format (e.g., "16:00") */
  close: string;
  /** Extended hours session open time in "HHMM" format (e.g., "0400") */
  session_open: string;
  /** Extended hours session close time in "HHMM" format (e.g., "2000") */
  session_close: string;
  /** Settlement date string in "YYYY-MM-DD" format */
  settlement_date: string;
};

export function get(
  this: Alpaca,
  { start, end }: CalendarGetOptions = {},
): Promise<Calendar[]> {
  return this.sendRequest("/calendar", {
    start: toDateString(start),
    end: toDateString(end),
  });
}
