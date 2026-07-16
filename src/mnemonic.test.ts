import { deepStrictEqual, ok, rejects, strictEqual } from "node:assert";
import { randomBytes } from "node:crypto";
import { describe, it } from "node:test";
import { bufferToMnemonic, mnemonicToBuffer } from "./mnemonic";

describe("mnemonic", () => {
  describe("bufferToMnemonic", () => {
    it("should encode and decode a simple buffer", async () => {
      const input = Buffer.from([1, 2, 3, 4, 5]);
      const words = await bufferToMnemonic(input, "large");

      ok(Array.isArray(words), "should return an array of words");
      ok(words.length, "returned array should not be empty");

      const output = await mnemonicToBuffer(words, "large");

      strictEqual(
        input.toString("hex"),
        output.toString("hex"),
        "decoded output should match input",
      );
    });

    it("should encode and decode a simple utf8 string", async () => {
      const input = Buffer.from("hello world", "utf8");

      const wordsLarge = await bufferToMnemonic(input, "large");
      const outputLarge = await mnemonicToBuffer(wordsLarge, "large");
      deepStrictEqual(outputLarge, input);

      const wordsShort1 = await bufferToMnemonic(input, "short_1");
      const outputShort1 = await mnemonicToBuffer(wordsShort1, "short_1");
      deepStrictEqual(outputShort1, input);

      const wordsShort2 = await bufferToMnemonic(input, "short_2_0");
      const outputShort2 = await mnemonicToBuffer(wordsShort2, "short_2_0");
      deepStrictEqual(outputShort2, input);
    });

    it("should strip preceeding null characters", async () => {
      const input = Buffer.from("\0\0hello world", "utf8");
      const expected = Buffer.from("hello world", "utf8");

      const wordsLarge = await bufferToMnemonic(input, "large");
      const outputLarge = await mnemonicToBuffer(wordsLarge, "large");
      deepStrictEqual(outputLarge, expected);

      const wordsShort1 = await bufferToMnemonic(input, "short_1");
      const outputShort1 = await mnemonicToBuffer(wordsShort1, "short_1");
      deepStrictEqual(outputShort1, expected);

      const wordsShort2 = await bufferToMnemonic(input, "short_2_0");
      const outputShort2 = await mnemonicToBuffer(wordsShort2, "short_2_0");
      deepStrictEqual(outputShort2, expected);
    });

    it("should keep preceeding null characters when prefixed with a non null byte", async () => {
      const input = Buffer.concat([
        Buffer.from([0xff]),
        Buffer.from("\0\0hello world", "ascii"),
      ]);

      const expected = Buffer.from("\0\0hello world", "ascii");

      const wordsLarge = await bufferToMnemonic(input, "large");
      const outputLarge = await mnemonicToBuffer(wordsLarge, "large");
      deepStrictEqual(outputLarge.subarray(1), expected);

      const wordsShort1 = await bufferToMnemonic(input, "short_1");
      const outputShort1 = await mnemonicToBuffer(wordsShort1, "short_1");
      deepStrictEqual(outputShort1.subarray(1), expected);

      const wordsShort2 = await bufferToMnemonic(input, "short_2_0");
      const outputShort2 = await mnemonicToBuffer(wordsShort2, "short_2_0");
      deepStrictEqual(outputShort2.subarray(1), expected);
    });

    it("should encode and decode a binary string", async () => {
      const input = Buffer.from(
        "lznTz+/8+fYw4ht/A03eVb1W9BREZzrm8Dbw17k5eeF5k1xOXcw813PqbYrkx8wIrW7AkvoANmvn8UxnzwALng==",
        "base64",
      );

      const wordsLarge = await bufferToMnemonic(input, "large");
      const outputLarge = await mnemonicToBuffer(wordsLarge, "large");
      deepStrictEqual(outputLarge, input);

      const wordsShort1 = await bufferToMnemonic(input, "short_1");
      const outputShort1 = await mnemonicToBuffer(wordsShort1, "short_1");
      deepStrictEqual(outputShort1, input);

      const wordsShort2 = await bufferToMnemonic(input, "short_2_0");
      const outputShort2 = await mnemonicToBuffer(wordsShort2, "short_2_0");
      deepStrictEqual(outputShort2, input);
    });

    it("should handle mixed-case inputs when decoding back to buffer", async () => {
      const input = Buffer.from([
        104, 105, 32, 119, 104, 97, 116, 99, 104, 97, 32, 100, 111, 105, 110,
        103, 32, 116, 111, 100, 97, 121, 63,
      ]);

      const words = await bufferToMnemonic(input, "large");
      const wordsCapitalized = words.map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1),
      );

      const output = await mnemonicToBuffer(wordsCapitalized, "large");
      deepStrictEqual(output, input);
    });

    it("should encode and decode large random bytes", async () => {
      const input = Buffer.concat([
        Buffer.from([0xff]), // prefix with non null byte in case the leading bytes are null
        randomBytes(64),
      ]);

      const wordsLarge = await bufferToMnemonic(input, "large");
      const outputLarge = await mnemonicToBuffer(wordsLarge, "large");
      deepStrictEqual(outputLarge.subarray(1), input.subarray(1));

      const wordsShort1 = await bufferToMnemonic(input, "short_1");
      const outputShort1 = await mnemonicToBuffer(wordsShort1, "short_1");
      deepStrictEqual(outputShort1.subarray(1), input.subarray(1));

      const wordsShort2 = await bufferToMnemonic(input, "short_2_0");
      const outputShort2 = await mnemonicToBuffer(wordsShort2, "short_2_0");
      deepStrictEqual(outputShort2.subarray(1), input.subarray(1));
    });

    it("should handle empty inputs", async () => {
      const input = Buffer.from([]);
      const words = await bufferToMnemonic(input, "large");
      const output = await mnemonicToBuffer(words, "large");
      deepStrictEqual(output, input);
    });

    it("should reject invalid words with a TypeError", async () => {
      const invalidWords = ["badword"];

      await rejects(() => mnemonicToBuffer(invalidWords, "large"), {
        name: "TypeError",
        message: /Word ".*" not in large list/,
      });
    });
  });
});
