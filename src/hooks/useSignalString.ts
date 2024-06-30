import { useCallback, useEffect, useState } from "react";
import { SignalString } from "../utils/SignalString";

export function useSignalString(signalString: SignalString): string {
	const [value, setValue] = useState(signalString.value);

	const refresh  = useCallback((value: string) => setValue(value), [setValue]);
	useEffect(() => signalString.onChange.addForHook(refresh), [signalString, refresh]);

	return value;
}