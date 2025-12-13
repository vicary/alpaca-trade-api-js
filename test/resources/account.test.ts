import { Alpaca } from "../../dist/alpaca-trade-api";
import * as mock from "../support/mock-server";

describe("account resource", function () {
  it("returns 401 error if invalid API credentials are used", async function () {
    const alpaca = new Alpaca(
      Object.assign(mock.getConfig(), { secretKey: "invalid_secret" })
    );
    await expect(alpaca.getAccount()).rejects.toThrow("401");
  });

  describe("get", function () {
    it("returns valid results", async function () {
      const alpaca = new Alpaca(mock.getConfig());
      const account = await alpaca.getAccount();
      expect(account).toHaveProperty("id");
    });
  });
});
