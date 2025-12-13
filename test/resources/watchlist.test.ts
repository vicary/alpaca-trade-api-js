import { Alpaca } from "../../dist/alpaca-trade-api";
import * as mock from "../support/mock-server";

describe("watchlist resource", function () {
  const alpaca = new Alpaca(mock.getConfig());

  describe("getAll", function () {
    it("returns valid results with no parameters", async function () {
      const result = await alpaca.getWatchlists();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getOne", function () {
    it("returns a watchlist object if valid watchlist id is used", async function () {
      const id = "test_watchlist_id";
      const result = await alpaca.getWatchlist(id);
      expect(typeof result).toBe("object");
    });

    it("returns 404 error if unknown watchlist id is used", async function () {
      const id = "nonexistent_watchlist_id";
      await expect(alpaca.getWatchlist(id)).rejects.toThrow("404");
    });
  });

  describe("addWatchlist", function () {
    it("creates a new empty watchlist", async function () {
      const result = await alpaca.addWatchlist("Watchlist Name");
      expect(result).toHaveProperty("account_id");
    });

    it("creates a new watchlist with something in in", async function () {
      const result = await alpaca.addWatchlist("Watchlist Name", "AAPL");
      expect(result).toHaveProperty("assets");
    });
  });

  describe("addToWatchlist", function () {
    it("adds a symbol to a watchlist if a valid watchlist id and valid symbol are used", async function () {
      const id = "test_watchlist_id";
      const result = await alpaca.addToWatchlist(id, "AAPL");
      expect(result).toHaveProperty("account_id");
    });

    it("returns a 404 if unknown watchlist id is used", async function () {
      const id = "nonexistent_watchlist_id";
      await expect(alpaca.addToWatchlist(id, "AAPL")).rejects.toThrow("404");
    });
  });

  describe("updateWatchlist", function () {
    it("updates a watchlist name if a valid watchlist id and a name are used", async function () {
      const id = "test_watchlist_id";
      const result = await alpaca.updateWatchlist(id, {
        name: "new name",
        symbols: "AAPL",
      });
      expect(result).toHaveProperty("account_id");
    });

    it("updates a watchlist contents if a valid watchlist id and a symbol or list of symbols are used", async function () {
      const id = "test_watchlist_id";
      const result = await alpaca.updateWatchlist(id, {
        name: "name",
        symbols: "AAPL",
      });
      expect(result).toHaveProperty("account_id");
    });

    it("updates a watchlist name and contents if a valid watchlist id, a name, and a symbol or list of symbols are used", async function () {
      const id = "test_watchlist_id";
      const result = await alpaca.updateWatchlist(id, { name: "new name" });
      expect(result).toHaveProperty("account_id");
    });

    it("returns a 404 if an unknown watchlist id is used", async function () {
      const id = "nonexistent_watchlist_id";
      await expect(
        alpaca.updateWatchlist(id, { name: "new name", symbols: "AAPL" })
      ).rejects.toThrow("404");
    });
  });

  describe("deleteWatchlist", function () {
    it("deletes a watchlist if a valid watchlist id is used", async function () {
      const id = "test_watchlist_id";
      await expect(alpaca.deleteWatchlist(id)).resolves.not.toThrow();
    });

    it("returns a 404 if an unknown watchlist id is used", async function () {
      const id = "nonexistent_watchlist_id";
      await expect(alpaca.deleteWatchlist(id)).rejects.toThrow("404");
    });
  });

  describe("deleteFromWatchlist", function () {
    it("deletes an asset from a watchlist if a valid watchlist id is used and the asset is in the watchlist", async function () {
      const id = "test_watchlist_id";
      const symbol = "TSLA";
      const result = await alpaca.deleteFromWatchlist(id, symbol);
      expect(result).toHaveProperty("account_id");
    });

    it("returns a 404 if an unknown watchlist id is used", async function () {
      const id = "nonexistent_watchlist_id";
      const symbol = "TSLA";
      await expect(alpaca.deleteFromWatchlist(id, symbol)).rejects.toThrow(
        "404"
      );
    });

    it("returns a 404 if an asset not presently in the watchlist is used", async function () {
      const id = "test_watchlist_id";
      const symbol = "FAKE";
      await expect(alpaca.deleteFromWatchlist(id, symbol)).rejects.toThrow(
        "404"
      );
    });
  });
});
