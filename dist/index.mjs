import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
//#region src/base-index.ts
function oneToZeroBaseIndex(string) {
	if (!/^[1-9]*$/.test(string)) throw new TypeError(`Input "${string}" contains characters other than 1-9`);
	return string.replace(/\d/g, (d) => String(Number(d) - 1));
}
function zeroToOneBaseIndex(string) {
	if (!/^[0-8]*$/.test(string)) throw new TypeError(`Input "${string}" contains characters other than 0-8`);
	return string.replace(/\d/g, (d) => String(Number(d) + 1));
}
//#endregion
//#region node_modules/tsdown/esm-shims.js
const getFilename = () => fileURLToPath(import.meta.url);
const getDirname = () => path.dirname(getFilename());
const __dirname = /* @__PURE__ */ getDirname();
//#endregion
//#region src/data.ts
const numberToWordMapByType = /* @__PURE__ */ new Map();
const wordToNumberMapByType = /* @__PURE__ */ new Map();
const getEffNumberToWordMap = async (type) => {
	let map = numberToWordMapByType.get(type);
	if (!map) {
		if (type !== "large" && type !== "short_1" && type !== "short_2_0") throw new TypeError(`Invalid type "${type}"`);
		const file = await readFile(__dirname + `/../data/eff_wordlist_${type}.txt`, "utf8");
		map = new Map(file.split("\n").map((it) => it.split("	")).map(([k, v]) => [oneToZeroBaseIndex(k), v]));
		numberToWordMapByType.set(type, map);
	}
	return map;
};
const getEffWordToNumberMap = async (type) => {
	let map = wordToNumberMapByType.get(type);
	if (!map) {
		const numberToWordMap = await getEffNumberToWordMap(type);
		map = new Map(numberToWordMap.entries().map(([k, v]) => [v, k]));
		wordToNumberMapByType.set(type, map);
	}
	return map;
};
const clearEffCache = () => {
	numberToWordMapByType.clear();
	wordToNumberMapByType.clear();
};
//#endregion
//#region src/parse-big-int.ts
function parseBigInt(string, radix) {
	if (radix < 2 || radix > 36) throw new TypeError("Radix must be between 2 and 36");
	const bigRadix = BigInt(radix);
	let result = 0n;
	for (const char of string) {
		const digit = parseInt(char, radix);
		if (isNaN(digit)) throw new TypeError(`Invalid character "${char}" for radix ${radix}`);
		result = result * bigRadix + BigInt(digit);
	}
	return result;
}
//#endregion
//#region src/mnemonic.ts
async function bufferToMnemonic(buffer, type = "large") {
	if (!buffer.length) return [];
	const numberToWordMap = await getEffNumberToWordMap(type);
	const base6 = BigInt("0x" + buffer.toString("hex")).toString(6);
	const rolls = type === "large" ? 5 : 4;
	const base6PaddedLength = Math.ceil(base6.length / rolls) * rolls;
	return (base6.padStart(base6PaddedLength, "0").match(new RegExp(`.{1,${rolls}}`, "g")) ?? []).map((chunk) => {
		const word = numberToWordMap.get(chunk);
		if (!word) {
			const sequence = zeroToOneBaseIndex(chunk);
			throw TypeError(`Sequence "${sequence}" not in ${type} list`);
		}
		return word;
	});
}
async function mnemonicToBuffer(words, type = "large") {
	if (!words.length) return Buffer.alloc(0);
	const wordToBase6Map = await getEffWordToNumberMap(type);
	let hex = parseBigInt(words.map((word) => {
		const chunk = wordToBase6Map.get(word.toLowerCase());
		if (!chunk) throw TypeError(`Word "${word}" not ${type} list`);
		return chunk;
	}).join(""), 6).toString(16);
	if (hex.length % 2 !== 0) hex = "0" + hex;
	return Buffer.from(hex, "hex");
}
//#endregion
export { bufferToMnemonic, clearEffCache, getEffNumberToWordMap, getEffWordToNumberMap, mnemonicToBuffer, oneToZeroBaseIndex, parseBigInt, zeroToOneBaseIndex };

//# sourceMappingURL=index.mjs.map