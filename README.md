# EFF Mnemonic

Convert buffers to and from a human-readable mnemonic phrase using eff wordlists. This library was built with the purpose of generating mnemonics from passwords or private keys so that they can be easily written down on paper.

## CLI Usage

You can use the cli to encode and decode secret phrases or files.

#### Encode in interactive mode

```sh
> npx eff-mnemonic
🔑 # enter your secret phrase
┌─────────┬────────────┬───────────┬────────────┬──────────┬───────────┐
│ (index) │ 0          │ 1         │ 2          │ 3        │ 4         │
├─────────┼────────────┼───────────┼────────────┼──────────┼───────────┤
│ 0       │ 'bloomers' │ 'triceps' │ 'shoptalk' │ 'travel' │ 'prodigy' │
│ 1       │ 'outlast'  │ 'shrank'  │            │          │           │
└─────────┴────────────┴───────────┴────────────┴──────────┴───────────┘
```

#### Decode in interactive mode

```sh
npx eff-mnemonic -d
🔎 bloomers triceps shoptalk travel prodigy outlast shranK
hello world%
```

#### Using pipes and redirection

```sh
# the cli pretty prints the mnemonic if output is not redirected
> echo -n "hello" | npx eff-mnemonic
┌─────────┬───────────┬─────────┬─────────┐
│ (index) │ 0         │ 1       │ 2       │
├─────────┼───────────┼─────────┼─────────┤
│ 0       │ 'uranium' │ 'frown' │ 'vowed' │
└─────────┴───────────┴─────────┴─────────┘

# the cli plays nice when the output is piped
> echo -n "hello" | npx eff-mnemonic | npx eff-mnemonic -d | cat
hello%

# the cli plays nice when the output is redirected
> echo -n "hello" | npx eff-mnemonic | npx eff-mnemonic -d > output.txt
```

#### Specify wordlist

```sh
> echo -n "hello" | npx eff-mnemonic -w "large"
┌─────────┬───────────┬─────────┬─────────┐
│ (index) │ 0         │ 1       │ 2       │
├─────────┼───────────┼─────────┼─────────┤
│ 0       │ 'uranium' │ 'frown' │ 'vowed' │
└─────────┴───────────┴─────────┴─────────┘

> echo -n "hello" | npx eff-mnemonic -w "short_1"
┌─────────┬────────┬─────────┬─────────┬─────────┐
│ (index) │ 0      │ 1       │ 2       │ 3       │
├─────────┼────────┼─────────┼─────────┼─────────┤
│ 0       │ 'clip' │ 'wound' │ 'spiny' │ 'storm' │
└─────────┴────────┴─────────┴─────────┴─────────┘

> echo -n "hello" | npx eff-mnemonic -w "short_2_0"
┌─────────┬─────────────┬─────────────┬───────────┬───────────┐
│ (index) │ 0           │ 1           │ 2         │ 3         │
├─────────┼─────────────┼─────────────┼───────────┼───────────┤
│ 0       │ 'clergyman' │ 'xylophone' │ 'sizable' │ 'sulphur' │
└─────────┴─────────────┴─────────────┴───────────┴───────────┘
```

## Programmatic Usage

Use `bufferToMnemonic` to encode and `mnemonicToBuffer` to decode.

```ts
import { bufferToMnemonic, mnemonicToBuffer } from "./dist/index.mjs";

const input = "hello world";
const encoded = await bufferToMnemonic(Buffer.from(input, "utf8"));

console.log(encoded.join(" ")); // bloomers triceps shoptalk travel prodigy outlast shrank

const decoded = (await mnemonicToBuffer(encoded)).toString("utf8");

console.log(decoded); // hello world
```

### bufferToMnemonic(buffer[, type])

- `buffer` `<Buffer>` The buffer to encode.
- `type` `<"large" | "short_1" | "short_2_0">` The eff wordlist to use. Default `"large"`.
- Returns: `<string[]>` An array of mnemonic words.

Encodes abuffer into a human-readable mnemonic word array from the eff wordlist.

### mnemonicToBuffer(words[, type])

- `words` `<string[]>` An array of mnemonic words.
- `type` `<"large" | "short_1" | "short_2_0">` The eff wordlist to use. Default `"large"`
- Returns: `<Buffer>` The decoded buffer.

Decodes a mnemonic word array back into its original buffer.

## Quirks

Internally, null characters `0x00` are used to pad the input if it's not divisible by 5 for the large list or 4 for the short lists. So the decoding process strips preceeding null characters before returning the output.

#### Default behaviour

```ts
const input = "\x00\x00hello world";
const encoded = await bufferToMnemonic(Buffer.from(input, "utf8"));
const decoded = (await mnemonicToBuffer(encoded)).toString("utf8");

console.dir(decoded); // "hello world"
console.log(input === decoded); // false
```

#### Preserve preceeding null characters

```ts
const input = "\0\0hello world";

// prepend a non zero byte such as 0xff
const encoded = await bufferToMnemonic(
  Buffer.concat([Buffer.from([0xff]), Buffer.from(input, "utf8")]),
);

// discard the prepended byte
const decoded = (await mnemonicToBuffer(encoded)).subarray(1).toString("utf8");

console.dir(decoded); // "\x00\x00hello world"
console.log(input === decoded); // true
```

## References

- [EFF's New Wordlists for Random Passphrases](https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases)
- [EFF's long word list (for use with five dice)](https://www.eff.org/files/2016/07/18/eff_large_wordlist.txt)
- [EFF's general short word list (for use with four dice)](https://www.eff.org/files/2016/09/08/eff_short_wordlist_1.txt)
- [EFF's short word list (with words that have unique three-character prefixes)](https://www.eff.org/files/2016/09/08/eff_short_wordlist_2_0.txt)
