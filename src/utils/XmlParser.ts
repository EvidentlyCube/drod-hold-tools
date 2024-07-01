

export async function parseXml(xmlString: string): Promise<XMLDocument> {
	const reader = new XmlBufferReader(xmlString);
	const xmlDoc = document.implementation.createDocument(null, null, null);

	const [headerType, headerData] = reader.consumeHeader();
	const processingInstruction = xmlDoc.createProcessingInstruction(headerType, headerData);
	xmlDoc.insertBefore(processingInstruction, null);

	while (!reader.isFinished) {
		if (!await readElement(xmlDoc, reader)) {
			break;
		}
	}

	return xmlDoc;
}

async function readElement(parent: Element|XMLDocument, reader: XmlBufferReader) {
	await sleep();

	const document = 'createElement' in parent ? parent : parent.ownerDocument;

	if (!reader.consumeTagOpen()) {
		return false;
	}

	const element = document.createElement(reader.consumeTagName());
	for (const attr of reader.consumeAttrs()) {
		element.setAttribute(attr[0], attr[1]);
	}
	parent.appendChild(element);

	// Self closing tag
	if (reader.consumeSlash()) {
		reader.consumeTagClose();
		return true;
	}

	reader.consumeTagClose();
	element.appendChild(document.createTextNode("\n"));

	while (!reader.isFinished) {
		if (reader.lookaheadTagClose()) {
			reader.consumeTagOpen();
			reader.consumeSlash();
			reader.consumeTagName();
			reader.consumeTagClose();
			break;
		}

		if (!await readElement(element, reader)) {
			break;
		}
	}

	return true;
}

type Attr = [string, string];

class XmlBufferReader {
	private _xml: string;
	private _pos: number;

	public get isFinished() {
		return this._pos >= this._xml.length;
	}

	public constructor(xml: string) {
		this._xml = xml;
		this._pos = 0;
	}

	public log() {
		console.log(this._pos);
		console.log(this._xml.substring(
			Math.max(0, this._pos - 40),
			Math.min(this._xml.length, this._pos + 40),
		));
	}

	public consumeHeader() {
		const match = this._xml.substring(this._pos).match(/^<\?(.+?)\s+(.+?)\s*\?>/);

		if (match) {
			this._pos += match[0].length;
			this.consumeWhitespace();
			return [match[1], match[2]];
		}

		return "";
	}

	public consumeTagOpen() {
		if (this._xml.charAt(this._pos) === '<') {
			this._pos++;
			this.consumeWhitespace();
			return true;
		}

		return false;
	}

	public consumeTagClose() {
		if (this._xml.charAt(this._pos) === '>') {
			this._pos++;
			this.consumeWhitespace();
			return true;
		}

		return false;
	}

	public consumeSlash() {
		if (this._xml.charAt(this._pos) === '/') {
			this._pos++;
			this.consumeWhitespace();
			return true;
		}

		return false;
	}

	public consumeTagName() {
		const match = this._xml.substring(this._pos).match(/^([a-zA-Z0-9_-]+)/);

		if (match) {
			this._pos += match[0].length;
			this.consumeWhitespace();
			return match[1];
		}

		return "";
	}

	public consumeWhitespace() {
		const match = this._xml.substring(this._pos).match(/^\s*/);

		if (match) {
			this._pos += match[0].length;
		}
	}

	public consumeAttr(): Attr | undefined {
		const nameMatch = this._xml.substring(this._pos).match(/^([a-zA-Z_:][-a-zA-Z0-9_:.]*)/);

		if (!nameMatch) {
			return undefined;
		}

		const attributeName = nameMatch[1];
		this._pos += nameMatch[0].length;
		this.consumeWhitespace();

		if (this._xml.charAt(this._pos) !== '=') {
			return [attributeName, ''];
		}

		this._pos++;
		this.consumeWhitespace();

		const valueMatch = this._xml.substring(this._pos).match(/^'([^']*)'|^"([^"]*)"/);

		if (!valueMatch) {
			return [attributeName, ''];
		}

		this._pos += valueMatch[0].length;
		this.consumeWhitespace();
		return [attributeName, valueMatch[1] ?? valueMatch[2]];
	}

	public consumeAttrs(): Attr[] {
		const attrs: Attr[] = [];

		let attr = this.consumeAttr();
		while (attr) {
			attrs.push(attr);
			attr = this.consumeAttr();
		}

		return attrs;
	}

	public lookaheadTagClose() {
		return !!this._xml.substring(this._pos).match(/^<\/\s*([a-zA-Z0-9_-]+)\s*>/);
	}
}

let lastSleep = 0;
async function sleep() {
	return new Promise<void>(resolve => {
		if (Date.now() > lastSleep + 16) {
			setTimeout(() => {
				lastSleep = Date.now();
				resolve();
			}, 100)
		} else {
			resolve();
		}
	})

}