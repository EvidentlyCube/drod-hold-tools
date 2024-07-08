import { Signal } from "./Signals";


export class SignalNullable<T> {
	private _value?: T;
	public onChange = new Signal<T | undefined>();

	public get value() {
		return this._value;
	}

	public set value(value: T | undefined) {
		if (this._value !== value) {
			this._value = value;
			this.onChange.dispatch(value);
		}
	}

	public constructor(value?: T) {
		this._value = value;
	}

	public unset() {
		this.value = undefined;
	}
}