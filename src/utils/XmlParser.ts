
export async function parseXml(xmlString: string, updateCallback?: (log: string) => void): Promise<XMLDocument> {
	const reader = new XmlBufferReader(xmlString, updateCallback);
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
	if (reader.isSleepTime) {
		await reader.sleep();
	}

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

	if (!reader.consumeTagClose()) {
		reader.throwError("Parse failure - expected tag close because not self-closing but it wasn't found");
	}

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
const Whitespace = new Set([' ', "\n", "\r", "\t"]);
const CharCode_a = 'a'.charCodeAt(0);
const CharCode_z = 'z'.charCodeAt(0);
const CharCode_A = 'A'.charCodeAt(0);
const CharCode_Z = 'Z'.charCodeAt(0);
const CharCode_0 = '0'.charCodeAt(0);
const CharCode_9 = '9'.charCodeAt(0);
const CharCode_Dash = '-'.charCodeAt(0);
const CharCode_Underscore = '_'.charCodeAt(0);
const CharCode_Colon = ':'.charCodeAt(0);

class XmlBufferReader {
	private _xml: string;
	private _length: number;
	private _pos: number;
	private _updateCallback?: (log: string) => void;
	private _lastSleep: number = Date.now();

	public get isSleepTime() {
		return Date.now() > this._lastSleep + 100;
	}

	public async sleep() {
		return new Promise<void>(resolve => {
			if (this.isSleepTime) {
				setTimeout(() => {
		this._lastSleep = Date.now();
		resolve();
				}, 1)
			} else {
				resolve();
			}
		})
	}

	public get isFinished() {
		return this._pos >= this._xml.length;
	}

	public constructor(xml: string, updateCallback?: (log: string) => void) {
		this._xml = xml.replace(/\r|\n/g, '');
		this._length = xml.length;
		this._pos = 0;
		this._updateCallback = updateCallback;
	}

	public consumeHeader() {
		const match = this._xml.substring(this._pos).match(/^<\?(.+?)\s+(.+?)\s*\?>/);

		if (match) {
			this._pos += match[0].length;
			this._pos = this.getWhitespaceEnd(this._pos);
			return [match[1], match[2]];
		}

		return "";
	}

	public consumeTagOpen() {
		this._log();

		if (this._xml.charAt(this._pos) === '<') {
			this._pos++;
			this._pos = this.getWhitespaceEnd(this._pos);
			return true;
		}

		return false;
	}

	public consumeTagClose() {
		this._log();

		if (this._xml[this._pos] === '>') {
			this._pos++;
			this._pos = this.getWhitespaceEnd(this._pos);
			return true;
		}

		return false;
	}

	public consumeSlash() {
		this._log();

		if (this._xml[this._pos] === '/') {
			this._pos++;
			this._pos = this.getWhitespaceEnd(this._pos);
			return true;
		}

		return false;
	}

	public consumeTagName() {
		this._log();

		let i = this._pos;
		for (; i < this._length; i++) {
			const code = this._xml.charCodeAt(i);

			if (
				(code >= CharCode_a && code <= CharCode_z)
				|| (code >= CharCode_A && code <= CharCode_Z)
				|| (code >= CharCode_0 && code <= CharCode_9)
				|| code === CharCode_Dash
				|| code === CharCode_Underscore
			) {
				continue;
			}

			break;
		}

		if (i > this._pos) {
			const tagName = this._xml.substring(this._pos, i);
			this._pos = this.getWhitespaceEnd(i);
			return tagName;
		}

		return "";
	}

	private getWhitespaceEnd(from: number) {
		this._log();

		while (Whitespace.has(this._xml[from])) {
			from++;
		}

		return from;
	}

	public consumeAttr(): Attr | undefined {
		let i = this._pos;
		{
			const code = this._xml.charCodeAt(i);
			if (
				(code < CharCode_a || code > CharCode_z)
				&& (code < CharCode_A || code > CharCode_Z)
			) {
				return undefined;
			}
		}

		i++;
		for (; i < this._length; i++) {
			const code = this._xml.charCodeAt(i);

			if (
				(code >= CharCode_a && code <= CharCode_z)
				|| (code >= CharCode_A && code <= CharCode_Z)
				|| (code >= CharCode_0 && code <= CharCode_9)
				|| code === CharCode_Dash
				|| code === CharCode_Colon
				|| code === CharCode_Underscore
			) {
				continue;
			}

			break;
		}

		const attributeName = this._xml.substring(this._pos, i);
		this._pos = this.getWhitespaceEnd(i);

		if (this._xml[this._pos++] !== '=') {
			this.throwError("Invalid XML - Expected an equality sign after attribute name");
		}

		this._pos = this.getWhitespaceEnd(this._pos);

		const quoteChar = this._xml[this._pos++];

		i = this._pos
		while (i < this._length && this._xml[i] !== quoteChar) {
			i++;
		}

		const value = this._xml.substring(this._pos, i);
		this._pos = this.getWhitespaceEnd(i + 1); // +1 to skip the quote character
		return [attributeName, value];
	}

	public consumeAttrs(): Attr[] {
		this._log();

		const attrs: Attr[] = [];

		let attr = this.consumeAttr();
		while (attr) {
			attrs.push(attr);
			attr = this.consumeAttr();
		}

		return attrs;
	}

	public lookaheadTagClose() {
		this._log();

		let i = this._pos;
		if (this._xml[i++] !== '<') {
			return false;
		}

		i = this.getWhitespaceEnd(i);
		if (this._xml[i] !== '/') {
			return false;
		}

		return true;
	}

	public throwError(message: string) {
		throw new Error(message + ":" + this.context());
	}

	public context(pos?: number) {
		pos = pos ?? this._pos;
		return this._xml.substring(pos - 20, pos)
			+ " -->"
			+ this._xml[pos]
			+ "<-- "
			+ this._xml.substring(pos + 1, pos + 20);
	}

	private _log() {
		if (!this._updateCallback) {
			return;
		}

		const lines = [
			this._xml.substring(
				this._pos - 20,
				this._pos + 20,
			),
			"^",
			`${(this._pos * 100 / this._xml.length).toFixed(2)}% (${this._pos}/${this._xml.length})`
		].join("\n");

		this._updateCallback(lines);
	}
}