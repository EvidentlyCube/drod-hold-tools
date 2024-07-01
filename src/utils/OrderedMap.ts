import { assertNotNull } from "./Asserts";

export class OrderedMap<TKey, TValue> {
	private readonly _map = new Map<TKey, TValue>();
	private readonly _orderedKeys: TKey[] = [];

	public get size() {
		return this._map.size;
	}

	public has(key: TKey) {
		return this._map.has(key);
	}

	public set(key: TKey, value: TValue) {
		if (!this._map.has(key)) {
			this._map.set(key, value);
			this._orderedKeys.push(key);
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