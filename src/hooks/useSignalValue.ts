import { useCallback, useEffect, useState } from "react";
import { SignalValue } from "../utils/SignalValue";

export function useSignalValue<T>(signalValue: SignalValue<T>): T {
	const [value, setValue] = useState(signalValue.value);

	const refresh  = useCallback((value: T) => setValue(value), [setValue]);
	useEffect(() => signalValue.onChange.addForHook(refresh), [signalValue, refresh]);

	return value;
}