import { Alpaca } from "../../dist/alpaca-trade-api";
import * as mock from "../support/mock-server";

describe("order resource", function () {
  const alpaca = new Alpaca(mock.getConfig());

  describe("getAll", function () {
    it("returns valid results without a parameter", async function () {
      const result = await alpaca.getOrders();
      expect(Array.isArray(result)).toBe(true);
    });

    it("returns valid results with parameters", async function () {
      const result = await alpaca.getOrders({
        status: "open",
        until: new Date(),
        after: new Date(),
        direction: "asc",
        limit: 4,
        nested: false,
        symbols: "AAPL",
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getOne", function () {
    it("returns 404 error if unknown order id is used", async function () {
      const fakeOrderId = "nonexistent_order_id";
      await expect(alpaca.getOrder(fakeOrderId)).rejects.toThrow("404");
    });
  });

  describe("getByClientOrderId", function () {
    it("returns valid results if valid client order id", async function () {
      const orderId = "904837e3-3b76-47ec-b432-046db621571b";
      const asset = await alpaca.getOrderByClientId(orderId);
      expect(asset).toHaveProperty("client_order_id");
    });
  });

  describe("post", function () {
    it("returns 422 error if market order contains stop_price or limit price", async function () {
      const testOrder = {
        symbol: "AAPL",
        qty: 15,
        side: "buy",
        type: "market",
        time_in_force: "day",
        limit_price: "107.00",
        stop_price: "106.00",
        client_order_id: "string",
      };
      await expect(alpaca.createOrder(testOrder)).rejects.toThrow("422");
    });

    it("returns 403 error(insufficient qty) if buying power or shares is not sufficient", async function () {
      const testOrder = {
        symbol: "INSUFFICIENT",
        qty: 150000,
        side: "sell",
        type: "market",
        time_in_force: "day",
      };
      await expect(alpaca.createOrder(testOrder)).rejects.toThrow("403");
    });

    it("creates a new valid order", async function () {
      const testOrder = {
        symbol: "AAPL",
        qty: 15,
        side: "buy",
        type: "market",
        time_in_force: "day",
      };
      const newOrder = await alpaca.createOrder(testOrder);
      expect(newOrder).toHaveProperty("client_order_id");
    });
  });

  describe("remove", function () {
    it("returns 404 error if unknown order id is used", async function () {
      const fakeOrderId = "nonexistent_order_id";
      await expect(alpaca.cancelOrder(fakeOrderId)).rejects.toThrow("404");
    });

    it("removes order correctly", async function () {
      const testOrder = {
        symbol: "AAPL",
        qty: 15,
        side: "sell",
        type: "market",
        time_in_force: "day",
      };
      const newOrder = await alpaca.createOrder(testOrder);
      await expect(alpaca.cancelOrder(newOrder.id)).resolves.not.toThrow();
    });
  });
});
