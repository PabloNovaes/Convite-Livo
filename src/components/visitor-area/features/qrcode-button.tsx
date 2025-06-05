import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTrigger
} from "@/components/ui/dialog"
import { SaveState } from "@/components/ui/save-button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Loader, QrCode } from "lucide-react"
import { memo, useEffect, useState } from "react"

import { callApi } from "@/api.config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer"
import { useAuth } from "@/hooks/visitor-area/use-auth"
import { Address } from "@/types/data"
import { errorToastDispatcher } from "@/utils/error-toast-dispatcher"
import { DialogTitle } from "@radix-ui/react-dialog"


export function QrcodeButton({ currentAddress }: { currentAddress: Address }) {
    const [currentState, setCurrentState] = useState<SaveState>('initial')
    const [countdown, setCountdown] = useState(0)
    const [qrcode, setQrcode] = useState(null)
    const [open, setOpen] = useState(false)

    const { data: user } = useAuth()
    const isDesktop = useMediaQuery("(min-width: 1024px)")

    const reset = () => {
        setOpen(false)
        setCurrentState('initial')
        setQrcode(null)
    }

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        }
        return () => clearTimeout(timer)
    }, [countdown])

    useEffect(() => {
        if (currentState === 'success') {
            setTimeout(() => {

            }, 30000)
            setTimeout(() => setCurrentState('initial'), 800)
        }
    }, [currentState])

    const generateQrcode = async () => {
        setCurrentState('loading')

        try {
            const { RESULT, QRCODE, INFO, ERROR } = await callApi('POST', {
                body: {
                    request: currentAddress?.RECORRENTE ? 'set_gerar_qrcode_recorrente' : 'set_gerar_qrcode_temporario',
                    temporario: String(currentAddress?.KEY),
                    tipo: 2
                },
                headers: { Authorization: `Bearer ${user["TOKEN"]}` }
            })

            if (!RESULT) throw new Error(ERROR ?? INFO)

            setQrcode(QRCODE)
            setCountdown(31)
            setCurrentState('success')
            setTimeout(() => setOpen(true), 800)
        } catch (err) {
            errorToastDispatcher(err)
            setCurrentState('initial')
        }
    }

    const CloseButton = memo(() => (
        <Button onClick={() => setOpen(false)} variant={"secondary"}>Fechar QR code</Button>
    ))

    if (isDesktop) return (
        <Dialog open={open} onOpenChange={reset}>
            <DialogTrigger>
                <motion.div onClick={generateQrcode}
                    className={cn(
                        "p-2 rounded-xl size-[40px] grid place-content-center bg-[#181818] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] cursor-pointer focus-visible:brightness-75 hover:brightness-75 transition-all border border-t-0",
                    )}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentState}
                            className="flex items-center gap-2"
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {currentState === "loading" && (
                                <>
                                    <Loader className="w-[15px] h-[15px] animate-spin text-white" />
                                </>
                            )}
                            {currentState === "initial" && (
                                <>
                                    <QrCode size={22} />
                                </>
                            )}
                            {currentState === "success" && (
                                <div className="p-0.5 bg-white/25 rounded-[99px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.16)] border border-white/25 justify-center items-center gap-1.5 flex overflow-hidden">
                                    <Check className="w-3.5 h-3.5 text-white" />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">Utilize o Qrcode a baixo para entrar <br /> no condomínio</DialogTitle>
                    <DialogDescription className="text-center">
                        <Badge variant={countdown >= 20 && 'AUTORIZADO' || countdown >= 10 && countdown < 20 && 'INFO' || 'SAIU'} className="text-sm mx-auto">Ira fechar em {countdown}</Badge>
                    </DialogDescription>
                </DialogHeader>
                <img className="mx-auto bg-white p-2 rounded-xl" src={qrcode ?? ''} alt="" />
            </DialogContent>
        </Dialog>
    )

    return (
        <Drawer open={open}>
            <DrawerTrigger>
                <motion.div onClick={generateQrcode}
                    className={cn(
                        "p-2 rounded-xl size-[40px] size-[40px] grid place-content-center  bg-[#181818] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] cursor-pointer focus-visible:brightness-75 hover:brightness-75 transition-all border border-t-0",
                    )}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentState}
                            className="flex items-center gap-2"
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {currentState === "loading" && (
                                <>
                                    <Loader className="w-[15px] h-[15px] animate-spin text-white" />
                                </>
                            )}
                            {currentState === "initial" && (
                                <>
                                    <QrCode size={22} />
                                </>
                            )}
                            {currentState === "success" && (
                                <div className="p-0.5 bg-white/25 rounded-[99px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.16)] border border-white/25 justify-center items-center gap-1.5 flex overflow-hidden">
                                    <Check className="w-3.5 h-3.5 text-white" />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-center">
                    <DrawerTitle>
                        <Badge variant={countdown >= 20 && 'AUTORIZADO' || countdown >= 10 && countdown < 20 && 'INFO' || 'SAIU'} className="text-sm">Ira fechar em {countdown}</Badge>
                    </DrawerTitle>
                    <DrawerDescription>Utilize o Qrcode a baixo para entrar no condomínio</DrawerDescription>
                </DrawerHeader>
                <div className="">
                    <img className="mx-auto w-2/3 bg-white rounded-4xl" src={qrcode ?? ''} alt="" />
                </div>
                <DrawerFooter className="text-center">
                    <DrawerClose asChild>
                        <CloseButton />
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
