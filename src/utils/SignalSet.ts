import { Signal } from "./Signals";

export enum SignalSetOperator {
	Add = 0,
	Remove = 1,
}

export interface SignalSetOperation<T> {
	operator: SignalSetOperator;
	operand: T;
	set: SignalSet<T>;
}

export class SignalSet<TElement> {
	private _set = new Set<TElement>()
	public onChange = new Signal<SignalSetOperation<TElement>>();

	public get set(): ReadonlySet<TElement> {
		return this._set;
	}

	public add(element: TElement) {
		if (!this._set.has(element)) {
			this._set.add(element);
			this.onChange.dispatch({
				operand: element,
				operator: SignalSetOperator.Add,
				set: this
			});
		}
	}

	public delete(element: TElement) {
		if (this._set.has(element)) {
			this._set.delete(element);
			this.onChange.dispatch({
				operand: element,
				operator: SignalSetOperator.Remove,
				set: this
			});
		}
	}

	public has(element: TElement) {
		return this._set.has(element);
	}

	public find(predicate: (item: TElement) => boolean) {
		for (const item of this._set.values()) {
			if (predicate(item)) {
				return item;
			}
		}

		return undefined;
	}

	public values() {
		return Array.from(this._set.values());
	}
}