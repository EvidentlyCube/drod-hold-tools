import { useCallback, useEffect, useState } from "react";
import { SignalUpdatableChangeData, SignalUpdatableValue } from "../utils/SignalUpdatableValue";

export function useSignalUpdatableValue<T>(updatableValue: SignalUpdatableValue<T>, returnFinal: true): T;
export function useSignalUpdatableValue<T>(updatableValue: SignalUpdatableValue<T>, returnFinal?: false): [T, boolean, T];
export function useSignalUpdatableValue<T>(updatableValue: SignalUpdatableValue<T>, returnFinal?: boolean): [T, boolean, T]|T {
	const [value, setValue] = useState(updatableValue.newValue);
	const [isChanged, setIsChanged] = useState(updatableValue.isChanged);

	const refresh  = useCallback((data: SignalUpdatableChangeData<T>) => {
		setValue(data.value);
		setIsChanged(data.hasNewValue);
	}, [setValue, setIsChanged]);

	useEffect(() => updatableValue.onChange.addForHook(refresh), [updatableValue, refresh]);

	return returnFinal
		? updatableValue.newValue
		: [updatableValue.oldValue, isChanged, value];
}