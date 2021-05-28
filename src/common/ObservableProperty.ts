type ObservablePropertyCallback<T> = (value: T) => void;

export class ObservableProperty<T> {
	private _value: T;
	private _callbacks: ObservablePropertyCallback<T>[];

	public get value(): T {
		return this._value;
	}

	public set value(val: T) {
		if (this._value !== val) {
			this._value = val;

			this._callbacks.forEach(callback => callback(val));
		}
	}

	constructor(value: T) {
		this._value = value;
		this._callbacks = [];
	}

	public addListener(callback: ObservablePropertyCallback<T>): void {
		if (this._callbacks.indexOf(callback) === -1) {
			this._callbacks.push(callback);
		}
	}

	public removeListener(callback: ObservablePropertyCallback<T>): void {
		const index = this._callbacks.indexOf(callback);

		if (index !== -1) {
			this._callbacks.splice(index, 1);
		}
	}
}