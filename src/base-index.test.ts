import { strictEqual, throws } from "node:assert";
import { describe, it } from "node:test";
import { oneToZeroBaseIndex, zeroToOneBaseIndex } from "./base-index";

describe("base-index", () => {
  describe("oneToZeroBaseIndex", () => {
    it("should allow empty strings", () => {
      strictEqual(oneToZeroBaseIndex(""), "");
    });

    it("should decrement numeric strings by one", () => {
      strictEqual(oneToZeroBaseIndex("123"), "012");
      strictEqual(oneToZeroBaseIndex("852"), "741");
      strictEqual(oneToZeroBaseIndex("999"), "888");
    });

    it("should throw TypeError if string contains characters outside 1-9", () => {
      throws(() => oneToZeroBaseIndex("123a"), {
        name: "TypeError",
        message: `Input "123a" contains characters other than 1-9`,
      });
      throws(() => oneToZeroBaseIndex("abc"), {
        name: "TypeError",
        message: `Input "abc" contains characters other than 1-9`,
      });
      throws(() => oneToZeroBaseIndex("12 3"), {
        name: "TypeError",
        message: `Input "12 3" contains characters other than 1-9`,
      });
      throws(() => oneToZeroBaseIndex("12-3"), {
        name: "TypeError",
        message: `Input "12-3" contains characters other than 1-9`,
      });
      throws(() => oneToZeroBaseIndex("102"), {
        name: "TypeError",
        message: `Input "102" contains characters other than 1-9`,
      });
    });
  });

  describe("zeroToOneBaseIndex", () => {
    it("should allow empty strings", () => {
      strictEqual(zeroToOneBaseIndex(""), "");
    });

    it("should increment numeric strings by one", () => {
      strictEqual(zeroToOneBaseIndex("123"), "234");
      strictEqual(zeroToOneBaseIndex("555"), "666");
      strictEqual(zeroToOneBaseIndex("000"), "111");
    });

    it("should throw TypeError if string contains characters outside 0-8", () => {
      throws(() => zeroToOneBaseIndex("123a"), {
        name: "TypeError",
        message: `Input "123a" contains characters other than 0-8`,
      });
      throws(() => zeroToOneBaseIndex("abc"), {
        name: "TypeError",
        message: `Input "abc" contains characters other than 0-8`,
      });
      throws(() => zeroToOneBaseIndex("12 3"), {
        name: "TypeError",
        message: `Input "12 3" contains characters other than 0-8`,
      });
      throws(() => zeroToOneBaseIndex("12-3"), {
        name: "TypeError",
        message: `Input "12-3" contains characters other than 0-8`,
      });
      throws(() => zeroToOneBaseIndex("192"), {
        name: "TypeError",
        message: `Input "192" contains characters other than 0-8`,
      });
    });
  });
});
