import { SignalNullable } from "../../utils/SignalNullable";
import { wcharBase64ToString, stringToWCharBase64 } from "../Utils";

export class DrodText {
	public readonly text: string;
	public readonly newText = new SignalNullable<string>();

	private readonly _encodedText: string;

	public constructor(encodedText: string) {
		this._encodedText = encodedText;
		this.text = wcharBase64ToString(this._encodedText);
	}

	public get encoded() {
		return this.newText.value
			? stringToWCharBase64(this.newText.value)
			: this._encodedText;
	}
}
