"use strict";

const expect = require("chai").expect;
const mock = require("../support/mock-server");
const { default: Alpaca } = require("../../dist/alpaca-trade-api");
const alpaca = new Alpaca(mock.getConfig());

describe("clock resource", function () {
  describe("get", function () {
    it("returns valid results", function () {
      return expect(alpaca.getClock()).to.eventually.have.property("timestamp");
    });
  });
});
