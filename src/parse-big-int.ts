export function parseBigInt(string: string, radix: number) {
  if (radix < 2 || radix > 36) {
    throw new TypeError("Radix must be between 2 and 36");
  }

  const bigRadix = BigInt(radix);

  let result = 0n;
  for (const char of string) {
    const digit = parseInt(char, radix);

    if (isNaN(digit)) {
      throw new TypeError(`Invalid character "${char}" for radix ${radix}`);
    }

    result = result * bigRadix + BigInt(digit);
  }

  return result;
}
