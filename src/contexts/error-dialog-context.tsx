import { ErrorDialog } from "@/components/ui/error-dialog";
import { createContext, ReactNode, useCallback, useState } from "react";

type ErrorDialogContextType = {
    showError: (message: string) => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const ErrorDialogContext = createContext<ErrorDialogContextType | undefined>(undefined);

export function ErrorDialogProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const showError = useCallback((message: string) => {
        setErrorMessage(message);
        setOpen(true);
    }, []);

    return (
        <ErrorDialogContext.Provider value={{ showError }
        }>
            {children}
            <ErrorDialog
                open={open}
                errorMessage={errorMessage}
                changeOpen={setOpen}
            />
        </ErrorDialogContext.Provider>
    );
}
