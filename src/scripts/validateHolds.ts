import { JSDOM } from 'jsdom';
import { lstatSync, writeFileSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path, { basename, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { Constants } from "../Constants";
import { holdToXml } from "../data/HoldToXml";
import { getHoldCommandsExport } from "../data/Utils";
import { XmlToHoldError } from "../data/xmlToHold";
import { readHold } from '../processor/readHold';
import { DiffXmlError } from '../utils/DiffXml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dom = new JSDOM();

const ANSI_BOLD = (text: string) => `\x1b[1m${text}\x1b[0m`;
const ANSI_UNDERLINE = (text: string) => `\x1b[4m${text}\x1b[0m`;
const ANSI_GRAY = (text: string) => `\x1b[90m${text}\x1b[0m`;
const ANSI_RED = (text: string) => `\x1b[31m${text}\x1b[0m`;
const LOG_FIELD = (name: string, value: string) => console.log(ANSI_BOLD(` - ${name}: `) + ANSI_GRAY(value));

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- It works
global.window = (dom.window as any);
global.document = dom.window.document;
global.Document = dom.window.Document;
global.Node = dom.window.Node;
global.XMLSerializer = dom.window.XMLSerializer;

const givenPath = process.argv[2];

if (!givenPath) {
	console.error("Please provide holds directory");
	process.exit(1);
}

(async () => {
	const holds = await getHolds(givenPath);

	holds.sort((l, r) => l.toLocaleLowerCase().localeCompare(r.toLocaleLowerCase()));

	Constants.isDev = true;
	Constants.diffXmlSleep = 1;
	Constants.xmlReaderFrameDuration = 1000;
	Constants.xmlToHoldSleep = 1;
	Constants.xmlToHoldFrameDuration = 1000;

	for (const holdFullPath of holds) {
		const hold = basename(holdFullPath);

		if (lstatSync(holdFullPath).isDirectory()) {
			continue;
		}

		console.log("");
		console.log(ANSI_UNDERLINE(ANSI_BOLD(`## ${hold} ##`)));
		LOG_FIELD("PATH", holdFullPath);

		const holdBuffer = await readFile(holdFullPath);

		let lastLogTime = 0;
		let lastLog = '';
		const result = await readHold(1, { data: new Uint8Array(holdBuffer) }, [], (s, l, t) => {
			lastLog = `${s} (${(l * 100).toFixed(2)}%): ${t}`;

			if (lastLogTime + 100 < Date.now()) {
				process.stdout.write(" ".repeat(process.stdout.columns) + "\r");
				process.stdout.write(` :: ${lastLog}\r`);
				lastLogTime = Date.now();
			}
		});
		process.stdout.write(" ".repeat(process.stdout.columns) + "\r");

		if (result.isSuccess) {
			continue;
		}

		const { holdXml, causedBy } = result;

		console.log("");
		console.log(ANSI_UNDERLINE(ANSI_BOLD(ANSI_RED(`## ERROR ##`))));

		console.log("");
		console.log(ANSI_BOLD("LAST LOG:"))
		console.log(ANSI_GRAY(lastLog));

		console.log("");
		console.log(ANSI_BOLD("MESSAGE:"))
		console.log(ANSI_GRAY(causedBy.message));

		console.log("");
		console.log(ANSI_BOLD("STACK TRACE:"))
		console.log(ANSI_GRAY(causedBy.stack ?? "<no stack trace>"));

		if (!holdXml) {
			console.log(ANSI_RED(`No hold XML retrieved`));
			break;
		}

		console.log("");
		console.log(ANSI_UNDERLINE(ANSI_BOLD(ANSI_RED(`## DETAILS: ##`))));

		LOG_FIELD("Imported hold in:", `${__dirname}/validateHolds.log.imported`);
		const originalHoldXml = new XMLSerializer().serializeToString(holdXml);
		writeFileSync(`${__dirname}/validateHolds.log.imported`, truncateHold(originalHoldXml), 'utf-8');

		if (causedBy instanceof XmlToHoldError) {
			LOG_FIELD("Exported hold in:", `${__dirname}/validateHolds.log.exported`);
			writeFileSync(`${__dirname}/validateHolds.log.exported`, truncateHold(await holdToXml(causedBy.hold)), 'utf-8');

			LOG_FIELD("Hold scripts in:", `${__dirname}/validateHolds.log.exported`);
			writeFileSync(`${__dirname}/validateHolds.log.scripts`, getHoldCommandsExport(causedBy.hold));

			const rootError = causedBy.rootError;
			if (rootError && rootError instanceof DiffXmlError) {
				for (const detail of rootError.details) {
					if (detail.type === 'to-store') {
						LOG_FIELD(`${detail.name} in:`, `${__dirname}/validateHolds.log.${detail.fileSuffix}`);
						writeFileSync(`${__dirname}/validateHolds.log.${detail.fileSuffix}`, detail.value);
					} else {
						LOG_FIELD(detail.name, detail.value);
					}
				}
			}

			if (rootError) {
				LOG_FIELD("Root cause", rootError.message);
				LOG_FIELD("Root trace", rootError.stack ?? "<no stack trace>");
			}
		}

		break;
	}
})()

async function getHolds(path: string): Promise<string[]> {
	path = path.replace(/\/$|\\$/, '');

	const pathStat = await stat(path);

	if (pathStat.isDirectory()) {
		return (await readdir(path)).map(file => `${path}${sep}${file}`);

	} else {
		return [ path ];
	}

}

function truncateHold(holdXml: string) {
	return holdXml
		.replace(/"/g, "'")
		.replace(/RawData='(.*?)'/g, (a, b) => `RawData='[TRUNCATED ${b.length} bytes]'`)
		.replace(/ExtraVars='(.*?)'/g, (a, b) => `ExtraVars='[TRUNCATED ${b.length} bytes]'`)
		.replace(/Squares='(.*?)'/g, (a, b) => `Squares='[TRUNCATED ${b.length} bytes]'`)
		.replace(/Message='(.*?)'/g, (a, b) => `Message='[TRUNCATED ${b.length} bytes]'`)
		.replace(/TileLights='(.*?)'/g, (a, b) => `TileLights='[TRUNCATED ${b.length} bytes]'`)
}