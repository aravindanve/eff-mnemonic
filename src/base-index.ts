export function oneToZeroBaseIndex(string: string) {
  if (!/^[1-9]*$/.test(string)) {
    throw new TypeError(`Input "${string}" contains characters other than 1-9`);
  }

  return string.replace(/\d/g, (d) => String(Number(d) - 1));
}

export function zeroToOneBaseIndex(string: string) {
  if (!/^[0-8]*$/.test(string)) {
    throw new TypeError(`Input "${string}" contains characters other than 0-8`);
  }

  return string.replace(/\d/g, (d) => String(Number(d) + 1));
}
