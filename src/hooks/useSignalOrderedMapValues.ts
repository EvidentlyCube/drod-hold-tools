import { useCallback, useEffect, useState } from "react";
import { OrderedMap, OrderedMapOperation } from "../utils/OrderedMap";

export function useSignalOrderedMapValues<TKey, TValue>(map: OrderedMap<TKey, TValue>): ReadonlyArray<TValue> {
	const [value, setValue] = useState(map.values());

	const refresh  = useCallback((op: OrderedMapOperation<TKey, TValue>) => setValue(op.map.values()), [setValue]);
	useEffect(() => map.onChange.addForHook(refresh), [map, refresh]);

	return value;
}