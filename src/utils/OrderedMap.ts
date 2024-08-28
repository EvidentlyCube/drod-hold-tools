import { removeArrayElementInline } from "./ArrayUtils";
import { assertNotNull } from "./Asserts";
import { Signal } from "./Signals";


export enum OrderedMapOperator {
	Add = 0,
	BeforeUpdate = 1,
	AfterUpdate = 2,
	Remove = 3,
}

export interface OrderedMapOperation<TKey, TValue> {
	operator: OrderedMapOperator;
	key: TKey;
	value: TValue;
	map: OrderedMap<TKey, TValue>;
}

export class OrderedMap<TKey, TValue> {
	private readonly _map = new Map<TKey, TValue>();
	private readonly _orderedKeys: TKey[] = [];

	public readonly onChange = new Signal<OrderedMapOperation<TKey, TValue>>();

	public get size() {
		return this._map.size;
	}

	public has(key: TKey) {
		return this._map.has(key);
	}

	public del(key: TKey) {
		const value = this._map.get(key);

		if (value) {
			removeArrayElementInline(this._orderedKeys, key);
			this._map.delete(key);

			this.onChange.dispatch({
				key, value,
				operator: OrderedMapOperator.Remove,
				map: this
			});
		}
	}

	public set(key: TKey, value: TValue) {
		if (!this._map.has(key)) {
			this._map.set(key, value);
			this._orderedKeys.push(key);

			this.onChange.dispatch({
				key, value,
				operator: OrderedMapOperator.Add,
				map: this
			});
		} else if (this._map.get(key) !== value) {
			this.onChange.dispatch({
				key, value,
				operator: OrderedMapOperator.BeforeUpdate,
				map: this
			});

			this._map.set(key, value);
			this._orderedKeys.push(key);

			this.onChange.dispatch({
				key, value,
				operator: OrderedMapOperator.AfterUpdate,
				map: this
			});
		}
	}

	public get(key: TKey): TValue | undefined {
		return this._map.get(key);
	}

	public getOrError(key: TKey): TValue {
		const value = this.get(key);

		assertNotNull(value, `Failed to retrieve not undefined result for key ${String(key)}`);

		return value;
	}

	public keys(): ReadonlyArray<TKey> {
		return this._orderedKeys;
	}

	public values(): TValue[] {
		return this._orderedKeys.map(key => this._map.get(key)!);
	}

	public forEach(predicate: (value: TValue) => void) {
		for (const item of this._map.values()) {
			predicate(item);
		}
	}

	public find(predicate: (value: TValue) => boolean) {
		for (const item of this._map.values()) {
			if (predicate(item)) {
				return item;
			}
		}

		return undefined;
	}

	public filterToArray(predicate: (value: TValue) => boolean) {
		const items = []
		for (const item of this._map.values()) {
			if (predicate(item)) {
				items.push(item);
			}
		}

		return items;
	}
}