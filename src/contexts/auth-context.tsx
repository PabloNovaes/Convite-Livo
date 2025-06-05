import c from "js-cookie";
import { createContext, ReactNode, useEffect, useState } from "react";

type UserProps = {
    RESULT: boolean;
    NOME: string;
    EMAIL: string | null;
    TELEFONE: string;
    IMAGEM: string;
    TOKEN: string
}

interface AuthContextProps {
    data: UserProps
    setData: (data: UserProps | null) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const authContext = createContext<AuthContextProps | undefined>(undefined)

export function AuthContextProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<null | UserProps>(null)

    useEffect(() => {
        const token = c.get("token")
        if (token?.trim() !== '' && token) {
            setData((prev) => ({ ...prev as UserProps, TOKEN: token }))
        }
    }, [])

    return (
        <authContext.Provider value={{ data: data as UserProps, setData }}>
            {children}
        </authContext.Provider>
    )
}