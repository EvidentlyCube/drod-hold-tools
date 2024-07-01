import { Signal } from "./Signals";


export class SignalValue<T> {
	private _value:T;
	public onChange = new Signal<T>();

	public get value() {
		return this._value;
	}

	public set value(value: T) {
		if (this._value !== value) {
			this._value = value;
			this.onChange.dispatch(value);
		}
	}

	public constructor(value: T) {
		this._value = value;
	}
}