import { useCallback, useEffect, useState } from "react";
import type { SignalArray, SignalArrayOperation } from "../utils/SignalArray";

export function useSignalArray<T>(
	signalArray: SignalArray<T>,
): ReadonlyArray<T> {
	const [value, setValue] = useState(signalArray.copy);

	const refresh = useCallback(
		(op: SignalArrayOperation<T>) => setValue(op.array.copy),
		[],
	);
	useEffect(
		() => signalArray.onChange.addForHook(refresh),
		[signalArray, refresh],
	);

	return value;
}
