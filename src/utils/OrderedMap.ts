export class OrderedMap<TKey, TValue> {
	private readonly _map = new Map<TKey, TValue>();
	private readonly _orderedKeys: TKey[] = [];

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

	public values(): TValue[] {
		return this._orderedKeys.map(key => this._map.get(key)!);
	}

	public forEach(predicate: (value: TValue) => void) {
		for (const item of this._map.values()) {
			predicate(item);
		}
	}
}