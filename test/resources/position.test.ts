import { Alpaca } from "../../dist/alpaca-trade-api";
import * as mock from "../support/mock-server";

const alpaca = new Alpaca(mock.getConfig());

describe("position resource", function () {
  describe("getAll", function () {
    it("returns valid results", async function () {
      const result = await alpaca.getPositions();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getOne", function () {
    it("returns 422 error if unknown symbol is used", async function () {
      await expect(alpaca.getPosition("FAKE")).rejects.toThrow("422");
    });

    it("returns valid results if valid symbol is used", async function () {
      const position = await alpaca.getPosition("SPY");
      expect(position).toHaveProperty("asset_id");
    });

    it("returns 404 if you have no position for that symbol", async function () {
      await expect(alpaca.getPosition("NONE")).rejects.toThrow("404");
    });
  });
});
