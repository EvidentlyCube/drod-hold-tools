import * as SAX from "sax";

(SAX as any).MAX_BUFFER_LENGTH = 64 * 1024 * 1024;

export class XmlDecode {
	private readonly _sax: SAX.SAXParser;
	private readonly _xml: XMLDocument;
	private readonly _elementStack: Element[];

	public get xml(): XMLDocument {
		return this._xml;
	}

	constructor() {
		this._sax = new SAX.SAXParser(true);
		this._xml = document.implementation.createDocument(null, null);
		this._elementStack = [];

		this._sax.onopentag = this.onOpenTag;
		this._sax.onclosetag = this.onCloseTag;
		this._sax.ontext = this.onText;
	}

	public write(string: string) {
		this._sax.write(string);
	}

	private onOpenTag = (tag: SAX.Tag) => {
		const element = this._xml.createElement(tag.name);
		for (const attribute in tag.attributes) {
			element.setAttribute(attribute, tag.attributes[attribute]);
		}

		const parent = this._elementStack[this._elementStack.length - 1] || this._xml;
		parent.appendChild(element);

		this._elementStack.push(element);
	};

	private onCloseTag = () => {
		this._elementStack.pop();
	};

	private onText = (text: string) => {
		const textNode = this._xml.createTextNode(text);

		const parent = this._elementStack[this._elementStack.length - 1];
		parent && parent.appendChild(textNode);
	};
}