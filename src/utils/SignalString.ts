import { Signal } from "./Signals";


export class SignalString {
	private _value = "";
	public onChange = new Signal<string>();

	public get value() {
		return this._value;
	}

	public set value(value: string) {
		if (this._value !== value) {
			this._value = value;
			this.onChange.dispatch(value);
		}
	}

	public constructor(value: string = "") {
		this._value = value;
	}
}