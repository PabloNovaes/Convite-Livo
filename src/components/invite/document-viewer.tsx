'use client'

import documentAnimation from "@/../public/assets/lottie-animations/document-animations.json";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useInvite } from "@/hooks/invite/use-invite";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { InviteDetails } from "./features/invite-details";
import { InviteStatus } from "./features/invite-status";

export function DocumentViewer() {
    const { data } = useInvite()
    const { RECUPERAR, MENSAGEM } = data
    const [exportPdf, setExportPdf] = useState<{
        isLoading: boolean, generated: boolean
    }>({ generated: false, isLoading: false })

    useEffect(() => {
        if (exportPdf.generated) {
            const timeoutId = setTimeout(() => setExportPdf((prev) => ({ ...prev, generated: false })), 2500);
            return () => clearTimeout(timeoutId);
        }
    }, [exportPdf.generated]);

    return (
        <motion.div initial={{ scale: .8, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="max-w-[450px]">
            <div className={cn("grid justify-items-center gap-6 p-2 relative w-fit")}>
                <div className="h-[240px]">
                    <Lottie className="max-w-[300px]" loop={false} animationData={documentAnimation} controls />
                </div>
                <InviteStatus />
                <div className="grid gap-2 w-full">
                    <h1 className="text-[30px] text-center leading-[32px] z-10 -tracking-[1.6px] font-black text-white">
                        {!RECUPERAR ? "Acesso por Documento" : "Documento Encontrado"}
                    </h1>
                    <p className="text-sm z-10 text-center max-w-[320px] mx-auto text-muted-foreground">
                        Apresente seu documento na portaria para ser identificado.
                    </p>
                </div>
                <div className="no-print flex justify-center items-center gap-2 w-full">
                    <InviteDetails />
                </div>
                {
                    MENSAGEM && MENSAGEM.show && MENSAGEM.content && <Alert variant={"warning"} className="">
                        <AlertTitle>Mensagem do condomínio</AlertTitle>
                        {MENSAGEM.content &&
                            <AlertDescription>
                                {MENSAGEM.content}
                            </AlertDescription>}
                    </Alert>
                }
            </div>
        </motion.div>
    )
}