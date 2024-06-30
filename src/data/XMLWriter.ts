import { PackedVars } from "./PackedVars";
import { writePackedVars } from "./PackedVarsUtils";
import { DrodText } from "./datatypes/DrodText";

export class XMLWriter {
	private _xml = "";

	public write(text: string) {
		this._xml += text;
	}

	public xml(xml: string) {
		this._xml += xml;
	}

	public tag(tagName: string) {
		this._xml += `<${tagName}`;

		return this;
	}

	public attr(name: string, value: string|number|DrodText|boolean|PackedVars) {
		this._xml += ` ${name}="`;

		if (value instanceof PackedVars) {
			this._xml += writePackedVars(value);

		} else if (value instanceof DrodText) {
			this._xml += value.encoded;

		} else if (typeof value === 'boolean') {
			this._xml += value ? '1' : '0';

		} else if (typeof value === 'number') {
			this._xml += value.toString();

		} else {
			this._xml += value.replace(/"/g, "&quote;");
		}
		this._xml += '"';

		return this;
	}

	public nest() {
		this._xml += ">\n";

		return this;
	}

	end(tagName?: string) {
		if (tagName) {
			this._xml += `</${tagName}>\n`;
		} else {
			this._xml += "/>\n";
		}

		return this;
	}

	getXml() {
		return this._xml;
	}
}