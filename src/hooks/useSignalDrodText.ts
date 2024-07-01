import { useCallback, useEffect, useState } from "react";
import { DrodText } from "../data/datatypes/DrodText";

export function useSignalDrodText(drodText: DrodText): string|undefined {
	const [value, setValue] = useState(drodText.newText);

	const refresh  = useCallback((value?: string) => setValue(value), [setValue]);
	useEffect(() => drodText.onNewTextChange.addForHook(refresh), [drodText, refresh]);

	return value;
}