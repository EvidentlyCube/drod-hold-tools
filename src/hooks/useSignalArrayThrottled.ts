import { useCallback, useEffect, useState } from "react";
import { SignalArray, SignalArrayOperation } from "../utils/SignalArray";
import { useThrottledCallback } from "use-debounce";

export function useSignalArrayThrottled<T>(signalArray: SignalArray<T>, wait: number): ReadonlyArray<T> {
	const [value, setValue] = useState(signalArray.copy);

	const refresh  = useThrottledCallback((op: SignalArrayOperation<T>) => setValue(op.array.copy), wait);
	useEffect(() => signalArray.onChange.addForHook(refresh), [signalArray, refresh]);

	return value;
}