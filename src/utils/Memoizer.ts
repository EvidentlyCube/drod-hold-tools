interface Memoized<TValue> {
	createdAt: number;
	value: TValue;
}

export class Memoizer<TKey, TValue> {
	private readonly _memoized = new Map<TKey, Memoized<TValue>>();
	private readonly _memoizeDuration: number;

	public constructor(duration: number = 1000) {
		this._memoizeDuration = duration;
	}

	public grab(key: TKey, valueConstructor: () => TValue) {
		const memoized = this._memoized.get(key);

		if (!memoized || memoized.createdAt + this._memoizeDuration < Date.now()) {
			const value = valueConstructor();

			this._memoized.set(key, {
				createdAt: Date.now(),
				value,
			});

			return value;
		}

		return memoized.value;
	}
}