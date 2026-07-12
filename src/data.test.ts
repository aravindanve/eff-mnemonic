import { rejects, strictEqual } from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { oneToZeroBaseIndex } from "./base-index";
import {
  clearEffCache,
  EffWordListType,
  getEffNumberToWordMap,
  getEffWordToNumberMap,
} from "./data";

const base6 = (sequence: string) => oneToZeroBaseIndex(sequence);

describe("EFF Wordlist Utility", () => {
  beforeEach(() => {
    clearEffCache();
  });

  it("should correctly load and parse the large wordlist into a number-to-word map", async () => {
    const map = await getEffNumberToWordMap("large");

    strictEqual(map.get(base6("13512")), "bluish");
    strictEqual(map.get(base6("43612")), "partake");
    strictEqual(map.get(base6("65442")), "vastness");
  });

  it("should correctly load and parse the large wordlist into a word-to-number map", async () => {
    const map = await getEffWordToNumberMap("large");

    strictEqual(map.get("domain"), base6("23634"));
    strictEqual(map.get("possible"), base6("44663"));
    strictEqual(map.get("trembling"), base6("62524"));
  });

  it("should correctly load and parse the short_1 wordlist into a number-to-word map", async () => {
    const map = await getEffNumberToWordMap("short_1");

    strictEqual(map.get(base6("1545")), "cheer");
    strictEqual(map.get(base6("3416")), "heat");
    strictEqual(map.get(base6("5246")), "scoff");
  });

  it("should correctly load and parse the short_1 wordlist into a word-to-number map", async () => {
    const map = await getEffWordToNumberMap("short_1");

    strictEqual(map.get("turf"), base6("6363"));
    strictEqual(map.get("rogue"), base6("5145"));
    strictEqual(map.get("agent"), base6("1122"));
  });

  it("should correctly load and parse the short_2_0 wordlist into a number-to-word map", async () => {
    const map = await getEffNumberToWordMap("short_2_0");

    strictEqual(map.get(base6("1135")), "acoustics");
    strictEqual(map.get(base6("4114")), "kerosene");
    strictEqual(map.get(base6("5542")), "shack");
  });

  it("should correctly load and parse the short_2_0 wordlist into a word-to-number map", async () => {
    const map = await getEffWordToNumberMap("short_2_0");

    strictEqual(map.get("tablespoon"), base6("6144"));
    strictEqual(map.get("oomph"), base6("4616"));
    strictEqual(map.get("eruption"), base6("2561"));
  });

  it("should throw a TypeError if an invalid type is passed", async () => {
    await rejects(
      () => getEffNumberToWordMap("invalid_type" as EffWordListType),
      {
        name: "TypeError",
        message: 'Invalid type "invalid_type"',
      },
    );
  });
});
