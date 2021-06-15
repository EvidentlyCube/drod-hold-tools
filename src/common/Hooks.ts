import React, { useEffect, useState } from "react";
import { ObservableProperty } from "./ObservableProperty";

export const useDocumentKeydown = (callback: (e: KeyboardEvent) => void, useCapture: boolean = false) => {
    useEffect(() => {
        document.addEventListener('keydown', callback, useCapture);
        return () => document.removeEventListener('keydown', callback, useCapture);
    }, [callback, useCapture]);
} 

export const useObservablePropertyState = <T>(
    property: ObservableProperty<T>,
    defaultValue: T
) => {
    const [state, setState] = useState<T>(defaultValue);

    useEffect(() => {
        const listener = (val: T) => setState(val);
        property.addListener(listener);

        setState(property.value);

        return () => property.removeListener(listener);
    });

    return state;
}