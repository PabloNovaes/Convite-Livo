import { InviteContext } from "@/contexts/invite-context";
import { useContext } from "react";

export const useInvite = () => {
    const context = useContext(InviteContext);
    if (!context) {
        throw new Error("useInvite deve ser usado dentro de um InviteProvider");
    }
    return context;
} 