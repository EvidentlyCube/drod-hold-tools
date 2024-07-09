import { Signal } from "./Signals";

export interface SignalUpdatableChangeData<T> {
	value: T;
	hasNewValue: boolean;
}
export class SignalUpdatableValue<T> {
	private _newValue: T;
	private _hasNewValue = false;

	public readonly oldValue: T;

	public onChange = new Signal<SignalUpdatableChangeData<T>>();

	public get isChanged() {
		return this._hasNewValue;
	}

	/**
	 * @deprecated use `newValue` instead as it's always set to oldValue when not changed
	 */
	public get finalValue(): T {
		return this._hasNewValue ? this._newValue : this.oldValue;
	}

	public get newValue() {
		return this._newValue;
	}

	public set newValue(value: T) {
		if (this._newValue !== value || !this._hasNewValue) {
			this._newValue = value;
			this._hasNewValue = true;

			this.onChange.dispatch({ value, hasNewValue: true });
		}
	}

	public constructor(oldValue: T) {
		this.oldValue = oldValue;
		this._newValue = oldValue;
	}

	public set(isChanged: boolean, newValue: T) {
		if (!isChanged) {
			this.unset();
		} else {
			this.newValue = newValue;
		}
	}

	public unset() {
		if (!this._hasNewValue) {
			return;
		}

		this._newValue = this.oldValue;
		this._hasNewValue = false;

		this.onChange.dispatch({ value: this.oldValue, hasNewValue: false });
	}
}