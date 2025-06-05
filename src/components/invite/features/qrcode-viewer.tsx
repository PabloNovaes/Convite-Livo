'use client'

import blurQrcode from "@/../public/assets/blur-qrcode.svg";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useInvite } from "@/hooks/invite/use-invite";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import { InviteDetails } from "./invite-details";
import { InviteStatus } from "./invite-status";
import { CompletedInvite } from "./recover-invite-form";


export function QrcodeViewer() {
    const { data } = useInvite()
    const { MENSAGEM } = data
    const { STATUS, QRCODE } = data.completedInvite as CompletedInvite
    return (
        <>
            <motion.div initial={{ scale: .8, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="max-w-[450px]">
                <div className={cn("grid justify-items-center gap-6 p-2 relative w-fit", STATUS !== "AUTORIZADO")}>
                    <div className="relative p-2 transition-all duration-300 flex justify-center items-center">
                        <div className={cn("border-white rounded-3xl rounded-es-none rounded-e-none absolute top-0 left-0 size-14 border-[3px] border-r-0 border-b-0", !QRCODE && "hidden")}></div>
                        <div className={cn("border-white rounded-3xl rounded-ee-none rounded-ss-none absolute bottom-0 left-0 size-14 border-[3px] border-r-0 border-t-0", !QRCODE && "hidden")}></div>
                        <div className={cn("border-white rounded-3xl rounded-ss-none rounded-ee-none absolute top-0 right-0 size-14 border-[3px] border-l-0 border-b-0", !QRCODE && "hidden")}></div>
                        <div className={cn("border-white rounded-3xl rounded-es-none rounded-se-none absolute bottom-0 right-0 size-14 border-[3px] border-l-0 border-t-0", !QRCODE && "hidden")}></div>
                        <div className="rounded-xl border-zinc-300 shadow-xl m-2 overflow-hidden">
                            <img src={QRCODE ?? blurQrcode} alt="qrocode" />
                        </div>
                    </div>
                    <InviteStatus />

                    <div className="grid gap-2 w-full">
                        <h1 className="text-[30px] text-center leading-[32px] z-10 -tracking-[1.6px] font-medium text-white">
                            {QRCODE ? (MENSAGEM?.show && MENSAGEM.content ? MENSAGEM.content : "Acesse usando o QR code") : "Ocorreu um erro ao carregar o QR code"}
                        </h1>
                        <p className="text-sm z-10 text-center mx-auto text-muted-foreground">
                            {QRCODE ? "Use o QR code para acessar o condomínio de maneira prática e rápida." : "Apresente seu documento na portaria para se identificar ou utilize o reconhecimento facial, se disponível no condomínio."}
                        </p>
                    </div>

                    <div className="no-print flex justify-center items-center gap-2 w-full">
                        <InviteDetails />
                    </div>
                    {
                        MENSAGEM && MENSAGEM.show && MENSAGEM.content &&
                        <Alert variant={"warning"} className="">
                            <AlertTitle className="font-medium">Mensagem do condomínio</AlertTitle>
                            {MENSAGEM.content &&
                                <AlertDescription>
                                    {MENSAGEM.content}
                                </AlertDescription>}
                        </Alert>
                    }
                </div>
            </motion.div>
        </>
    )
}