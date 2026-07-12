import { strictEqual, throws } from "node:assert";
import { describe, test } from "node:test";
import { parseBigInt } from "./parse-big-int";

describe("parseBigInt", () => {
  test("should parse binary strings", () => {
    strictEqual(parseBigInt("1011", 2), BigInt("0b1011"));
    strictEqual(parseBigInt("001010110", 2), BigInt("0b1010110"));
    strictEqual(parseBigInt("11111111", 2), BigInt("0b11111111"));
  });

  test("should parse decimal strings", () => {
    strictEqual(parseBigInt("123", 10), 123n);
    strictEqual(parseBigInt("0", 10), 0n);
    strictEqual(
      parseBigInt("9876543210123456789563457357243231222345234653563456", 10),
      9876543210123456789563457357243231222345234653563456n,
    );
  });

  test("should parse hexadecimal strings", () => {
    strictEqual(parseBigInt("1a", 16), 0x1an);
    strictEqual(parseBigInt("ffff", 16), 0xffffn);
    strictEqual(parseBigInt("1A2b3C", 16), 0x1a2b3cn);
  });

  test("should parse base36 strings", () => {
    strictEqual(parseBigInt("z", 36), 35n);
    strictEqual(parseBigInt("10", 36), 36n);
    strictEqual(parseBigInt("hello", 36), 29234652n);
  });

  test("should parse arbitrary base strings", () => {
    strictEqual(
      parseBigInt(7735128692155843684913924306936n.toString(3), 3),
      7735128692155843684913924306936n,
    );
    strictEqual(
      parseBigInt(192483853470520573173562959221732133818220n.toString(6), 6),
      192483853470520573173562959221732133818220n,
    );
    strictEqual(
      parseBigInt(840738509136725342125385326730715237557n.toString(23), 23),
      840738509136725342125385326730715237557n,
    );
    strictEqual(
      parseBigInt(9361852104742602346855075092467700n.toString(31), 31),
      9361852104742602346855075092467700n,
    );
  });

  test("should return 0n for an empty string", () => {
    strictEqual(parseBigInt("", 10), 0n);
  });

  test("should throw TypeError if radix is not between 2 and 36", () => {
    throws(() => parseBigInt("101", 1), {
      name: "TypeError",
      message: "Radix must be between 2 and 36",
    });
    throws(() => parseBigInt("101", -2), {
      name: "TypeError",
      message: "Radix must be between 2 and 36",
    });
    throws(() => parseBigInt("101", 37), {
      name: "TypeError",
      message: "Radix must be between 2 and 36",
    });
  });

  test("should throw a TypeError for invalid characters based on radix", () => {
    throws(() => parseBigInt("102", 2), {
      name: "TypeError",
      message: 'Invalid character "2" for radix 2',
    });
    throws(() => parseBigInt("1ag", 16), {
      name: "TypeError",
      message: 'Invalid character "g" for radix 16',
    });
    throws(() => parseBigInt("12-3", 10), {
      name: "TypeError",
      message: 'Invalid character "-" for radix 10',
    });
  });
});
