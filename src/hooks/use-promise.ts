/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react";

type CallbackWithArgs = (...args: any[]) => void | Promise<void>;

export function usePromise(): [boolean, (callback: CallbackWithArgs, ...args: any[]) => void] {
    const [isPending, setIsPending] = useState(false);

    const startAsyncTransition = useCallback(
        (callback: CallbackWithArgs, ...args: any[]) => {
            setIsPending(true);
            Promise.resolve()
                .then(() => callback(...args))
                .finally(() => {
                    setIsPending(false);
                });
        },
        []
    );

    return [isPending, startAsyncTransition];
}
