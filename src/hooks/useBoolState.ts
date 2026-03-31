import { useCallback, useState } from "react";

export function useBoolState(
	initialValue: boolean,
): [boolean, () => void, () => void] {
	const [boolVal, setBool] = useState(initialValue);
	const setTrue = useCallback(() => setBool(true), []);
	const setFalse = useCallback(() => setBool(false), []);

	return [boolVal, setTrue, setFalse];
}
