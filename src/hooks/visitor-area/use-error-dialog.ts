import { ErrorDialogContext } from "@/contexts/error-dialog-context";
import { useContext } from "react";

export const useErrorDialog = () => {
    const context = useContext(ErrorDialogContext);
    if (!context) {
        throw new Error("useInvite deve ser usado dentro de um InviteProvider");
    }
    return context;
} 