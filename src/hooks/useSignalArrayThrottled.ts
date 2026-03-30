import { useEffect, useState } from "react";
import { useThrottledCallback } from "use-debounce";
import type { SignalArray, SignalArrayOperation } from "../utils/SignalArray";

export function useSignalArrayThrottled<T>(
	signalArray: SignalArray<T>,
	wait: number,
): ReadonlyArray<T> {
	const [value, setValue] = useState(signalArray.copy);

	const refresh = useThrottledCallback(
		(op: SignalArrayOperation<T>) => setValue(op.array.copy),
		wait,
	);
	useEffect(
		() => signalArray.onChange.addForHook(refresh),
		[signalArray, refresh],
	);

	return value;
}
