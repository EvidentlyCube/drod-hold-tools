import { useEffect, useState } from "react";
import { useThrottledCallback } from "use-debounce";
import { SignalValue } from "../utils/SignalValue";

export function useSignalValueThrottled<T>(signalValue: SignalValue<T>): T {
	const [value, setValue] = useState(signalValue.value);

	const refresh  = useThrottledCallback((value: T) => setValue(value), 400);
	useEffect(() => signalValue.onChange.addForHook(refresh), [signalValue, refresh]);

	return value;
}