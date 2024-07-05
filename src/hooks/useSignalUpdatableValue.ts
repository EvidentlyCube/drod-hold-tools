import { useCallback, useEffect, useState } from "react";
import { SignalUpdatableValue } from "../utils/SignalUpdatableValue";

export function useSignalUpdatableValue<T>(updatableValue: SignalUpdatableValue<T>): [T, T|undefined] {
	const [value, setValue] = useState(updatableValue.newValue);

	const refresh  = useCallback((value?: T) => setValue(value), [setValue]);
	useEffect(() => updatableValue.onChange.addForHook(refresh), [updatableValue, refresh]);

	return [updatableValue.oldValue, value];
}