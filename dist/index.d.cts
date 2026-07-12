//#region src/base-index.d.ts
declare function oneToZeroBaseIndex(string: string): string;
declare function zeroToOneBaseIndex(string: string): string;
//#endregion
//#region src/data.d.ts
type EffWordListType = "large" | "short_1" | "short_2_0";
type EffWordMap = Map<string, string>;
declare const getEffNumberToWordMap: (type: EffWordListType) => Promise<EffWordMap>;
declare const getEffWordToNumberMap: (type: EffWordListType) => Promise<EffWordMap>;
declare const clearEffCache: () => void;
//#endregion
//#region src/mnemonic.d.ts
declare function bufferToMnemonic(buffer: Buffer, type?: EffWordListType): Promise<string[]>;
declare function mnemonicToBuffer(words: string[], type?: EffWordListType): Promise<Buffer<ArrayBuffer>>;
//#endregion
//#region src/parse-big-int.d.ts
declare function parseBigInt(string: string, radix: number): bigint;
//#endregion
export { EffWordListType, EffWordMap, bufferToMnemonic, clearEffCache, getEffNumberToWordMap, getEffWordToNumberMap, mnemonicToBuffer, oneToZeroBaseIndex, parseBigInt, zeroToOneBaseIndex };
//# sourceMappingURL=index.d.cts.map