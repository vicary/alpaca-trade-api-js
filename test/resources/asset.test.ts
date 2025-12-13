import { Alpaca } from "../../dist/alpaca-trade-api";
import * as mock from "../support/mock-server";

const alpaca = new Alpaca(mock.getConfig());

describe("asset resource", function () {
  describe("getAll", function () {
    it("returns valid results without parameters", async function () {
      const result = await alpaca.getAssets();
      expect(Array.isArray(result)).toBe(true);
    });

    it("returns valid results with a status parameter", async function () {
      const result = await alpaca.getAssets({ status: "active" });
      expect(Array.isArray(result)).toBe(true);
    });

    it("returns valid results with an asset_class parameter", async function () {
      const result = await alpaca.getAssets({ asset_class: "us_equity" });
      expect(Array.isArray(result)).toBe(true);
    });

    it("returns valid results with both parameters", async function () {
      const result = await alpaca.getAssets({
        status: "inactive",
        asset_class: "us_equity",
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getOne", function () {
    it("returns 404 error if unknown symbol is used", async function () {
      await expect(alpaca.getAsset("FAKE")).rejects.toThrow("404");
    });

    it("returns valid results if valid symbol is used otherwise, 404", async function () {
      const symbol = "7b8bfbfb-dea5-4de5-a557-40dc30532955";
      try {
        const asset = await alpaca.getAsset(symbol);
        expect(asset).toHaveProperty("asset_class");
      } catch (error: unknown) {
        expect((error as { statusCode: number }).statusCode).toBe(404);
      }
    });
  });
});
