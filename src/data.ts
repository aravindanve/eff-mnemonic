import { readFile } from "node:fs/promises";
import { oneToZeroBaseIndex } from "./base-index";

const numberToWordMapByType = new Map<EffWordListType, EffWordMap>();
const wordToNumberMapByType = new Map<EffWordListType, EffWordMap>();

export type EffWordListType = "large" | "short_1" | "short_2_0";
export type EffWordMap = Map<string, string>;

export const getEffNumberToWordMap = async (type: EffWordListType) => {
  let map = numberToWordMapByType.get(type);

  // load map from file if already not loaded
  if (!map) {
    if (type !== "large" && type !== "short_1" && type !== "short_2_0") {
      throw new TypeError(`Invalid type "${type}"`);
    }

    const file = await readFile(
      __dirname + `/../data/eff_wordlist_${type}.txt`,
      "utf8",
    );

    // parse wordlist and build a map
    // NOTE: the dice rolls use numbers from 1 to 6, we convert this to a
    // zero based index or a base6 number
    map = new Map(
      file
        .split("\n")
        .map((it) => it.split("\t") as [string, string])
        .map(([k, v]) => [oneToZeroBaseIndex(k), v]),
    );

    // cache map
    numberToWordMapByType.set(type, map);
  }

  return map;
};

export const getEffWordToNumberMap = async (type: EffWordListType) => {
  let map = wordToNumberMapByType.get(type);

  // load map from file if already not loaded
  if (!map) {
    const numberToWordMap = await getEffNumberToWordMap(type);

    // invert number to word map
    map = new Map(numberToWordMap.entries().map(([k, v]) => [v, k]));

    // cache map
    wordToNumberMapByType.set(type, map);
  }

  return map;
};

export const clearEffCache = () => {
  numberToWordMapByType.clear();
  wordToNumberMapByType.clear();
};
