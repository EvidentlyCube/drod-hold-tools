import { SignalUpdatableValue } from "../utils/SignalUpdatableValue";
import { PackedVars } from "./PackedVars";
import { writePackedVars } from "./PackedVarsUtils";
import { stringToWCharBase64 } from "./Utils";

type AttrValue = number|SignalUpdatableValue<string>|boolean|PackedVars|{_safeString: string};

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

	/**
	 * Write an attribute to the XML unless value is undefined, in which case it's skipped.
	 */
	public attrU(name: string, value: AttrValue | {_safeString: undefined} | undefined) {
		if (value === undefined) {
			return this;
		} else if (typeof value === 'object' && '_safeString' in value && value._safeString === undefined) {
			return this;
		}

		return this.attr(name, value);
	}

	public attrIf(name: string, value: AttrValue, isPrinted: boolean) {
		if (isPrinted) {
			return this.attr(name, value);
		}

		return this;
	}

	/**
	 * Write an attribute to the XML.
	 */
	public attr(name: string, value: AttrValue) {
		this._xml += ` ${name}='`;

		if (value instanceof PackedVars) {
			this._xml += writePackedVars(value);

		} else if (value instanceof SignalUpdatableValue) {
			this._xml += stringToWCharBase64(value.newValue);

		} else if (typeof value === 'boolean') {
			this._xml += value ? '1' : '0';

		} else if (typeof value === 'number') {
			this._xml += value.toString();

		} else if (typeof value === 'object' && '_safeString' in value) {
			this._xml += value._safeString;
		}
		this._xml += "'";

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