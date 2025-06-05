import { authContext } from "@/contexts/auth-context";
import { useContext } from "react";

export const useAuth = () => {
    const context = useContext(authContext);
    if (!context) {
        throw new Error("useUser deve ser usado dentro de um InviteProvider");
    }
    return context;
} 