import { readdir, readFile, stat } from "node:fs/promises";
import { lstatSync, writeFileSync } from "node:fs";
import path, { basename, join, sep } from "node:path";
import { JSDOM } from 'jsdom';
import { HoldReader } from "../processor/HoldReader";
import { Constants } from "../Constants";
import { holdToXml } from "../data/HoldToXml";
import { XmlToHoldError } from "../data/xmlToHold";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dom = new JSDOM();

global.window = (dom.window as any);
global.document = dom.window.document;
global.Document = dom.window.Document;
global.Node = dom.window.Node;

const givenPath = process.argv[2];

if (!givenPath) {
	console.error("Please provide holds directory");
	process.exit(1);
}

(async () => {
	const holds = await getHolds(givenPath);

	Constants.isDev = true;
	Constants.diffXmlSleep = 1;

	for (const holdFullPath of holds) {
		const hold = basename(holdFullPath);

		if (lstatSync(holdFullPath).isDirectory()) {
			continue;
		}

		console.log(`## Parsing ${hold}`)
		console.log(` - PATH = ${holdFullPath}`);

		const holdBuffer = await readFile(holdFullPath);

		const reader = new HoldReader(1, { fileBinary: new Uint8Array(holdBuffer) }, []);

		while (!reader.isFinished) {
			reader.update();
			await nextFrame();
		}

		if (!reader.error.value) {
			continue;
		}

		console.log('## Error found: ##')
		console.log(` - Decoded imported hold in: ${__dirname}/validateHolds.log.imported`)
		writeFileSync(`${__dirname}/validateHolds.log.imported`, reader.sharedState.holdXmlText ?? "", 'utf-8');

		if (reader.errorInstance.value instanceof XmlToHoldError) {
			console.log(` - Decoded exported hold in: ${__dirname}/validateHolds.log.exported`)
			writeFileSync(`${__dirname}/validateHolds.log.exported`, await holdToXml(reader.errorInstance.value.hold), 'utf-8');

			const rootError = reader.errorInstance.value.rootError;
			if (rootError) {
				console.log(` - Root error: ${rootError.message}`);
			}
		}

		console.log(` - Error message: ${reader.error.value}`);
		console.log(` - Error stack trace: ${reader.errorStackTrace.value}`);

		break;
	}
})()

async function nextFrame() {
	return new Promise(resolve => {
		setImmediate(resolve);
	})
}

async function getHolds(path: string): Promise<string[]> {
	path = path.replace(/\/$|\\$/, '');

	const pathStat = await stat(path);

	if (pathStat.isDirectory()) {
		return (await readdir(path)).map(file => `${path}${sep}${file}`);

	} else {
		return [ path ];
	}

}