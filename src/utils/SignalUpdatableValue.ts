import { Signal } from "./Signals";

export class SignalUpdatableValue<T> {
	public readonly oldValue: T;
	private _newValue: T | undefined;
	public onChange = new Signal<T | undefined>();

	public get finalValue(): T {
		return this._newValue ?? this.oldValue;
	}

	public get newValue() {
		return this._newValue;
	}

	public set newValue(value: T | undefined) {
		if (this._newValue !== value) {
			this._newValue = value;
			this.onChange.dispatch(value);
		}
	}

	public constructor(oldValue: T, newValue?: T) {
		this.oldValue = oldValue;
		this._newValue = newValue;
	}
}