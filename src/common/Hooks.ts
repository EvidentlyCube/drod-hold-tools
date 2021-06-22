import React, {useCallback, useEffect, useState} from "react";
import {ObservableProperty} from "./ObservableProperty";

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
    }, [property, setState]);

    return state;
}

export const useTextInputState = (defaultValue: string, onSetState?: (value: string) => string): [string, React.ChangeEventHandler<HTMLInputElement>] => {
    const [value, setValue] = useState(defaultValue);
    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
        onSetState 
            ? setValue(onSetState(e.target.value))
            : setValue(e.target.value);
    }, [setValue, onSetState]);

    return [value, onChange];
}

export const useSetStateCallback = <T>(value: T, setState: React.Dispatch<React.SetStateAction<T>>) => {
	return useCallback(() => {
		setState(value);
	}, [setState, value]);
}