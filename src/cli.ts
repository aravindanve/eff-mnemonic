import readline from "node:readline";
import { parseArgs } from "node:util";
import { EffWordListType } from "./data";
import { bufferToMnemonic, mnemonicToBuffer } from "./mnemonic";

const { values } = parseArgs({
  options: {
    encode: { type: "boolean", short: "e", default: true },
    decode: { type: "boolean", short: "d" },
    wordlist: { type: "string", short: "w" },
  },
  tokens: true,
});

// determine mode
const mode = values.decode ? "decode" : "encode";

// determine wordlist
let wordlist: EffWordListType;
if (
  values.wordlist === "large" ||
  values.wordlist === "short_1" ||
  values.wordlist === "short_2_0"
) {
  wordlist = values.wordlist;
} else if (values.wordlist) {
  console.error(
    `Error: Invalid value for wordlist, must be "large", "short_1", or "short_2_0"`,
  );
  process.exit(1);
}

/** Captures input to encode without printing it on screen */
function captureEncodeInput(): Promise<string> {
  const query = "🔑 ";
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stderr, // write ui to stderr to keep stdout clear
    });

    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();

    let password = "";
    process.stderr.write(query);

    const onData = (char: Buffer) => {
      const charStr = char.toString("utf8");

      let end = false;
      let exitCode;
      switch (charStr) {
        case "\n":
        case "\r":
        case "\u0004": // ctrl+d
          resolve(password);
          end = true;
          break;
        case "\u0003": // ctrl+c
          exitCode = 130;
          process.exit(130);
          end = true;
          break;
        case "\u007f": // backspace
        case "\b":
          if (password.length > 0) {
            password = password.slice(0, -1);
          }
          break;
        default:
          if (charStr.charCodeAt(0) >= 32) {
            password += charStr;
          }
          break;
      }

      if (end) {
        stdin.removeListener("data", onData);
        stdin.setRawMode(false);
        rl.close();

        if (exitCode) {
          process.exit(exitCode);
        }
      } else {
        readline.clearLine(process.stderr, 0);
        readline.cursorTo(process.stderr, 0);
        process.stderr.write(query);
      }
    };

    stdin.on("data", onData);
  });
}

/** Captures input to decode transparently */
function captureDecodeInput(): Promise<string> {
  const query = "🔎 ";
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(query, (value) => {
      rl.close();
      resolve(value);
    });
  });
}

async function main(): Promise<void> {
  let input;

  // capture tty input
  if (process.stdin.isTTY) {
    let text;
    if (mode === "encode") {
      text = await captureEncodeInput();
    } else {
      text = await captureDecodeInput();
    }

    input = Buffer.from(text, "utf8");
  }

  // capture piped input
  else {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }

    input = Buffer.concat(chunks);
  }

  if (!input) {
    console.error("Error: No input provided");
    process.exit(1);
  }

  // handle encode or decode
  if (mode === "encode") {
    // encode mnemonic
    const words = await bufferToMnemonic(input);

    // handle tty output
    if (process.stdout.isTTY) {
      // pretty format
      const table = words.reduce((acc, it, i) => {
        const j = Math.floor(i / 5);
        const k = i % 5;
        acc[j] ??= [];
        acc[j][k] = it;

        return acc;
      }, [] as string[][]);

      // print table
      console.table(table);
    } else {
      // write directly to stdout
      process.stdout.write(words.join(" "));
    }
  } else {
    // sanitize and parse input
    const words = input
      .toString("utf8")
      .replace(/[\s\t\-\_\,\:\;\.\n\'\"|\\]+/g, " ")
      .trim()
      .split(" ");

    // decode mnemonic
    const decoded = await mnemonicToBuffer(words);

    // write directly to stdout so it can be redirected
    process.stdout.write(decoded);
  }
}

void main();
