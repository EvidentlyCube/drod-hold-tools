import { Signal } from "../../utils/Signals";
import { wcharBase64ToString, stringToWCharBase64 } from "../Utils";

export class DrodText {
	public readonly text: string;

	public readonly onNewTextChange = new Signal<string | undefined>();

	private readonly _encodedText: string;
	private  _newText?: string;

	public get newText() {
		return this._newText;
	}

	public set newText(value: string | undefined) {
		if (value !== this._newText) {
			this._newText = value;
			this.onNewTextChange.dispatch(value);
		}
	}

	public constructor(encodedText: string) {
		this._encodedText = encodedText;
		this.text = wcharBase64ToString(this._encodedText);
	}

	public get encoded() {
		return this._newText !== undefined
			? stringToWCharBase64(this._newText)
			: this._encodedText;
	}
}
