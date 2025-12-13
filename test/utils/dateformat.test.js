"use strict";

const dateformat = require("../../dist/utils/dateformat");

describe("date formatting", () => {
  it("formats timestamps as dates", () => {
    const date = new Date(Date.UTC(1969, 6, 20, 0, 20, 18));
    const formatted = dateformat.toDateString(date);
    expect(formatted).toBe("1969-07-20");
  });

  it("passes nil through", () => {
    expect(dateformat.toDateString(null)).toBe(null);
  });

  it("passes strings through", () => {
    expect(dateformat.toDateString("2018-12-03")).toBe("2018-12-03");
  });
});
