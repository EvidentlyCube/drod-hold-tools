import { useCallback, useEffect, useState } from "react";
import { SignalNullable } from "../utils/SignalNullable";

export function useSignalNullable<T>(signal: SignalNullable<T>): T|undefined {
	const [value, setValue] = useState(signal.value);

	const refresh  = useCallback((value?: T) => setValue(value), [setValue]);
	useEffect(() => signal.onChange.addForHook(refresh), [signal, refresh]);

	return value;
}