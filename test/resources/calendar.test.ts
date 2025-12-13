import { Alpaca } from "../../dist/alpaca-trade-api";
import * as mock from "../support/mock-server";

const alpaca = new Alpaca(mock.getConfig());

describe("calendar resource", function () {
  describe("get", function () {
    it("returns valid results without a parameter", async function () {
      const result = await alpaca.getCalendar();
      expect(Array.isArray(result)).toBe(true);
    });

    it("returns valid results with `start` parameter", async function () {
      const result = await alpaca.getCalendar({ start: "2018-01-01" });
      expect(Array.isArray(result)).toBe(true);
    });

    it("returns valid results with `end` parameter", async function () {
      const result = await alpaca.getCalendar({ end: "2018-01-01" });
      expect(Array.isArray(result)).toBe(true);
    });

    it("returns valid results with both parameters", async function () {
      const result = await alpaca.getCalendar({
        start: new Date("July 20, 69 00:20:18"),
        end: new Date("2018-01-01"),
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
