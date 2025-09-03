import { useCallback, useRef } from "react";

export function usePrintRef<T extends HTMLElement>() {
    const printRef = useRef<T | null>(null);

    const handlePrint = useCallback(() => {
        if (!printRef.current) return;

        const printContents = printRef.current.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    }, []);

    return { printRef, handlePrint };
}
