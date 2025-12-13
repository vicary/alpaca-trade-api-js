import { Alpaca } from "../../dist/alpaca-trade-api";
import * as mock from "../support/mock-server";

const alpaca = new Alpaca(mock.getConfig());

describe("clock resource", function () {
  describe("get", function () {
    it("returns valid results", async function () {
      const result = await alpaca.getClock();
      expect(result).toHaveProperty("timestamp");
    });
  });
});
