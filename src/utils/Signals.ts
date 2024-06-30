interface Listener<T> {
	callback: Callback<T>,
	context: unknown
}

type Callback<T> = (value: T) => void;

export class Signal<T> {
	private listeners: Listener<T>[] = [];

	public add(callback: Callback<T>, context?: unknown): void {
		this.listeners.push({ callback, context });
	}

	public addForHook(callback: Callback<T>, context?: unknown): () => void {
		this.add(callback, context);

		return () => this.remove(callback, context);
	}

	public remove(callback: Callback<T>, context?: unknown): void {
		this.listeners = this.listeners.filter(listener => {
			if (context === undefined) {
				return listener.callback !== callback;
			} else {
				return listener.callback !== callback || listener.context !== context;
			}
		});
	}

	public removeAll(context?: unknown) {
		if (context === undefined) {
			this.listeners.length = 0;
		} else {
			this.listeners = this.listeners.filter(listener => listener.context !== context);
		}
	}

	public dispatch(value: T): void {
		for (const listener of this.listeners) {
			listener.callback.call(listener.context, value);
		}
	}
}