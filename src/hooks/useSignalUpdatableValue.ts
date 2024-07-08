import { useCallback, useEffect, useState } from "react";
import { SignalUpdatableValue } from "../utils/SignalUpdatableValue";

export function useSignalUpdatableValue<T>(updatableValue: SignalUpdatableValue<T>, returnFinal: true): T;
export function useSignalUpdatableValue<T>(updatableValue: SignalUpdatableValue<T>, returnFinal?: false): [T, T|undefined];
export function useSignalUpdatableValue<T>(updatableValue: SignalUpdatableValue<T>, returnFinal?: boolean): [T, T|undefined]|T {
	const [value, setValue] = useState(updatableValue.newValue);

	const refresh  = useCallback((value?: T) => setValue(value), [setValue]);
	useEffect(() => updatableValue.onChange.addForHook(refresh), [updatableValue, refresh]);

	return returnFinal
		? updatableValue.finalValue
		: [updatableValue.oldValue, value];
}