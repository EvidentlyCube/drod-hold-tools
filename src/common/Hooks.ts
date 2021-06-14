import { useEffect } from "react";

export const useDocumentKeydown = (callback: (e: KeyboardEvent) => void, useCapture: boolean = false) => {
    useEffect(() => {
        document.addEventListener('keydown', callback, useCapture);
        return () => document.removeEventListener('keydown', callback, useCapture);
    }, [callback, useCapture]);
} 