'use client'

import { AccessDenied } from "@/components/invite/access-denied";
import { useInvite } from "@/hooks/invite/use-invite";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export function Protector({ children }: { children?: ReactNode }) {
    const { data, isValid, errorMessage, redirect } = useInvite();

    if (isValid === null) {
        return (
            <motion.p
                className={cn(
                    "bg-[linear-gradient(110deg,#404040,35%,#fff,50%,#404040,75%,#404040)] z-10",
                    "bg-[length:200%_100%] bg-clip-text text-base font-medium text-transparent w-full text-center absolute m-auto bottom-[20%]",
                )}
                initial={{ backgroundPosition: "200% 0" }}
                animate={{ backgroundPosition: "-200% 0" }}
                transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "linear",
                }}
            >
                Verificando convite...
            </motion.p>
        );
    }

    return isValid && data
        ? children
        : <AccessDenied errorMessage={errorMessage} />;
}
