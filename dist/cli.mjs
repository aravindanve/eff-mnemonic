import { n as init_mnemonic, p as __commonJSMin, r as mnemonicToBuffer, t as bufferToMnemonic } from "./mnemonic-O11pWuyD.mjs";
import readline from "node:readline";
import { parseArgs } from "node:util";
//#region src/cli.ts
var require_cli = /* @__PURE__ */ __commonJSMin((() => {
	init_mnemonic();
	const { values } = parseArgs({
		options: {
			decode: {
				type: "boolean",
				short: "d"
			},
			wordlist: {
				type: "string",
				short: "w"
			}
		},
		tokens: true
	});
	const mode = values.decode ? "decode" : "encode";
	let wordlist;
	if (values.wordlist === "large" || values.wordlist === "short_1" || values.wordlist === "short_2_0") wordlist = values.wordlist;
	else if (values.wordlist) {
		console.error(`Error: Invalid value for wordlist, must be "large", "short_1", or "short_2_0"`);
		process.exit(1);
	}
	/** Captures input to encode without printing it on screen */
	function captureEncodeInput() {
		const query = "🔑 ";
		return new Promise((resolve) => {
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stderr
			});
			const stdin = process.stdin;
			stdin.setRawMode(true);
			stdin.resume();
			let password = "";
			process.stderr.write(query);
			const onData = (char) => {
				const charStr = char.toString("utf8");
				let end = false;
				let exitCode;
				switch (charStr) {
					case "\n":
					case "\r":
					case "":
						resolve(password);
						end = true;
						break;
					case "":
						exitCode = 130;
						process.exit(130);
						end = true;
						break;
					case "":
					case "\b":
						if (password.length > 0) password = password.slice(0, -1);
						break;
					default:
						if (charStr.charCodeAt(0) >= 32) password += charStr;
						break;
				}
				if (end) {
					stdin.removeListener("data", onData);
					stdin.setRawMode(false);
					rl.close();
					if (exitCode) process.exit(exitCode);
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
	function captureDecodeInput() {
		const query = "🔎 ";
		return new Promise((resolve) => {
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			});
			rl.question(query, (value) => {
				rl.close();
				resolve(value);
			});
		});
	}
	async function main() {
		let input;
		if (process.stdin.isTTY) {
			let text;
			if (mode === "encode") text = await captureEncodeInput();
			else text = await captureDecodeInput();
			input = Buffer.from(text, "utf8");
		} else {
			const chunks = [];
			for await (const chunk of process.stdin) chunks.push(chunk);
			input = Buffer.concat(chunks);
		}
		if (!input) {
			console.error("Error: No input provided");
			process.exit(1);
		}
		if (mode === "encode") {
			const words = await bufferToMnemonic(input, wordlist);
			if (process.stdout.isTTY) {
				const table = words.reduce((acc, it, i) => {
					const j = Math.floor(i / 5);
					const k = i % 5;
					acc[j] ??= [];
					acc[j][k] = it;
					return acc;
				}, []);
				console.table(table);
			} else process.stdout.write(words.join(" "));
		} else {
			const decoded = await mnemonicToBuffer(input.toString("utf8").replace(/[\s\t\-\_\,\:\;\.\n\'\"|\\]+/g, " ").trim().split(" "), wordlist);
			process.stdout.write(decoded);
		}
	}
	main();
}));
//#endregion
export default require_cli();
export {};

//# sourceMappingURL=cli.mjs.map