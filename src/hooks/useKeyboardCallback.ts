import { useEffect } from "react";

export function useKeyDownCallback(keyMap: Record<string, (e: KeyboardEvent) => void>) {
	useEffect(() => {
		const callback = (e: KeyboardEvent) => {
			keyMap[e.key]?.(e);
		};

		document.addEventListener('keydown', callback);

		return () => document.removeEventListener('keydown', callback);
	})
}