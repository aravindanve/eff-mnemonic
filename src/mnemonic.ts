import { zeroToOneBaseIndex } from "./base-index";
import {
  EffWordListType,
  getEffNumberToWordMap,
  getEffWordToNumberMap,
} from "./data";
import { parseBigInt } from "./parse-big-int";

export async function bufferToMnemonic(
  buffer: Buffer,
  type: EffWordListType = "large",
) {
  // handle empty input
  if (!buffer.length) {
    return [];
  }

  const numberToWordMap = await getEffNumberToWordMap(type);
  const bigint = BigInt("0x" + buffer.toString("hex"));
  const base6 = bigint.toString(6);

  // pad string to ensure length is a multiple of number of dice rolls
  const rolls = type === "large" ? 5 : 4;
  const base6PaddedLength = Math.ceil(base6.length / rolls) * rolls;
  const base6Padded = base6.padStart(base6PaddedLength, "0");

  // split base6 string into chunks and map to words
  const base6Chunks = base6Padded.match(new RegExp(`.{1,${rolls}}`, "g")) ?? [];
  return base6Chunks.map((chunk) => {
    const word = numberToWordMap.get(chunk);
    if (!word) {
      const sequence = zeroToOneBaseIndex(chunk);
      throw TypeError(`Sequence "${sequence}" not in ${type} list`);
    }
    return word;
  });
}

export async function mnemonicToBuffer(
  words: string[],
  type: EffWordListType = "large",
) {
  // handle empty input
  if (!words.length) {
    return Buffer.alloc(0);
  }

  const wordToBase6Map = await getEffWordToNumberMap(type);
  const base6Chunks = words.map((word) => {
    const chunk = wordToBase6Map.get(word.toLowerCase());
    if (!chunk) {
      throw TypeError(`Word "${word}" not in ${type} list`);
    }
    return chunk;
  });

  const bigint = parseBigInt(base6Chunks.join(""), 6);
  let hex = bigint.toString(16);

  // ensure hex has even length
  if (hex.length % 2 !== 0) {
    hex = "0" + hex;
  }

  return Buffer.from(hex, "hex");
}
