import { Signal } from "./Signals";

export enum SignalArrayOperator {
	Add = 0,
	Remove = 1,
}

export interface SignalArrayOperation<T> {
	operator: SignalArrayOperator;
	elements: T[];
	array: SignalArray<T>;
}

export class SignalArray<TElement> {
	private _array: TElement[] = [];
	public onChange = new Signal<SignalArrayOperation<TElement>>();

	public get array(): ReadonlyArray<TElement> {
		return this._array;
	}

	public get copy() {
		return this._array.concat();
	}

	public add(element: TElement) {
		const index = this._array.indexOf(element);

		if (index === -1) {
			this._array.push(element);
			this.onChange.dispatch({ array: this, operator: SignalArrayOperator.Add, elements: [element] });
		}
	}

	public contains(element: TElement) {
		return this._array.indexOf(element) !== -1;
	}

	public push(element: TElement) {
		this._array.push(element);
		this.onChange.dispatch({ array: this, operator: SignalArrayOperator.Add, elements: [element] });
	}

	public remove(element: TElement) {
		const index = this._array.indexOf(element);

		if (index !== -1) {
			this._array.splice(index, 1);
		this.onChange.dispatch({ array: this, operator: SignalArrayOperator.Remove, elements: [element] });
		}
	}

	public removeBy(predicate: (element: TElement) => boolean) {
		const filteredOut: TElement[] = [];

		for (let i = 0; i < this._array.length; i++) {
			const element = this._array[i];

			if (predicate(element)) {
				filteredOut.push(...this._array.splice(i, 1));
				i--;
			}
		}

		this.onChange.dispatch({ array: this, operator: SignalArrayOperator.Remove, elements: filteredOut });
	}
}