'use client'

import { useInvite } from "@/hooks/invite/use-invite"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { errorToastDispatcher } from "@/utils/error-toast-dispatcher"
import { formatDate, formatUppercase, generateInviteMessage } from "@/utils/formatters"
import { Check, DownloadSimple, MapPin, Spinner, UserCirclePlus, WhatsappLogo } from "@phosphor-icons/react"
import { AnimatePresence, motion } from "framer-motion"
import { memo, useEffect, useState } from "react"
import ReactDOMServer from "react-dom/server"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion"
import { Button } from "../../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTrigger } from "../../ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTrigger } from "../../ui/drawer"
import { PdfTemplate } from "../pdf-template"
import { CompletedInvite } from "./recover-invite-form"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import html2pdf from 'html2pdf.js'

const triggerStyle = "h-12 rounded-xl border-none w-full bg-gradient-to-b from-[#672F92] to-[#411e5c] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] hover:brightness-75 duration-300 transition-all text-sm text-blak bg-white px-4 border grid place-content-center  gap-2"

export function InviteDetails() {
    const [exportPdf, setExportPdf] = useState<{
        isLoading: boolean, generated: boolean
    }>({ generated: false, isLoading: false })

    const { data: { CONDOMINIO, USUARIO, DESC_ENDERECO, TELEFONE_USUARIO, DATA_CONVITE, RECUPERAR, TIPO_BIOMETRIA, completedInvite } } = useInvite()

    useEffect(() => {
        if (exportPdf.generated) {
            const timeoutId = setTimeout(() => setExportPdf((prev) => ({ ...prev, generated: false })), 2500);
            return () => clearTimeout(timeoutId);
        }
    }, [exportPdf.generated]);

    const fetchBase64Image = async (url: string): Promise<string> => {
        const response = await fetch(url, {
            method: "GET",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
        });
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    const generatePdf = async () => {
        setExportPdf((prev) => ({ ...prev, isLoading: true }))
        try {
            const qrcode = await fetchBase64Image((completedInvite as CompletedInvite).QRCODE)

            const contentHtml = ReactDOMServer.renderToString(
                <PdfTemplate {...{ qrcode, RECUPERAR }} />
            );
            const element = document.createElement('div');
            element.innerHTML = contentHtml;

            const options = {
                filename: `convite.pdf`,
                image: { type: 'jpeg', quality: 10 },
                html2canvas: { scale: 1.8, useCORS: true, letterRendering: true },
                printBackground: true,
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
            };

            await html2pdf().set(options).from(element).save()
            setExportPdf((prev) => ({ ...prev, generated: true }))
        } catch (err) {
            errorToastDispatcher(err)
        } finally {
            setExportPdf((prev) => ({ ...prev, isLoading: false }))
        }
    }


    const Content = memo(() => (
        <div className="grid gap-2">
            <div className="text-start">
                <h1 className="text-md font-medium mb-2 text-white">Detalhes do convite</h1>
                <div className="flex gap-3">
                    <div className="text-sm space-y-1">
                        <p>Nome do condomínio: <span className="text-white">{formatUppercase(CONDOMINIO as string)}</span> </p>
                        <p>Endereço: <span className="text-white"> {formatUppercase(DESC_ENDERECO as string)}</span> </p>
                        <p>Morador: <span className="text-white">{USUARIO}</span> </p>
                        <p>Data: <span className="text-white">{formatDate(DATA_CONVITE as string)}</span> </p>
                    </div>
                </div>

            </div>
            {(completedInvite as CompletedInvite).ACOMPANHANTES && (completedInvite as CompletedInvite).ACOMPANHANTES.RESULT && (
                <div>
                    <Accordion type="single" defaultValue="item-1" className="text-muted-foreground" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-md text-white">Acompanhantes</AccordionTrigger>
                            <AccordionContent className="grid gap-3">
                                <div className="grid gap-2">
                                    {(completedInvite as CompletedInvite).ACOMPANHANTES.DADOS.map(({ NOME }) => (
                                        <p className="text-md text-start">{NOME}</p>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            )}
        </div>
    ))

    const FooterActions = (() => (
        <div className="flex gap-2 w-full h-9">
            {(completedInvite as CompletedInvite).TELEFONE_VISITA && TIPO_BIOMETRIA === "QRCODE" && <a target="_blank" rel="noopener noreferrer"
                href={`https://wa.me/${(completedInvite as CompletedInvite).TELEFONE_VISITA ? (completedInvite as CompletedInvite).TELEFONE_VISITA : ""}?text=${encodeURIComponent(generateInviteMessage({ qrcode: (completedInvite as CompletedInvite).QRCODE, DESC_ENDERECO: DESC_ENDERECO as string, DATA_CONVITE: DATA_CONVITE as string, CONDOMINIO: CONDOMINIO as string, CONVIDADO: USUARIO }))}`}
                className={cn("active:scale-95 hover:brightness-75 duration-300 transition-all text-sm text-white bg-[#181818] rounded-lg border grid place-content-center gap-2", (completedInvite as CompletedInvite).STATUS !== "AUTORIZADO" ? "w-14" : "w-full flex items-center")}>
                <WhatsappLogo size={20} />
                {(completedInvite as CompletedInvite).STATUS === "AUTORIZADO" && "Salvar no Whatsapp"}
            </a>}
            {(completedInvite as CompletedInvite).QRCODE && TIPO_BIOMETRIA === "QRCODE" && <button onClick={generatePdf} className={cn("active:scale-95 hover:brightness-75 duration-300 transition-all text-sm bg-[#181818] text-white grid place-content-center rounded-lg border", (completedInvite as CompletedInvite).STATUS !== "AUTORIZADO" ? "w-14" : "w-full flex items-center")}>
                <AnimatePresence>
                    <motion.span
                        initial={{ opacity: 0, scale: 0, filter: "blur(5px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0, filter: "blur(5px)" }}
                        transition={{ duration: 0.4 }}
                    >
                        {exportPdf.isLoading ? (
                            <Spinner className="animate-spin duration-500" size={18} />
                        ) : exportPdf.generated ? (
                            <Check size={18} />
                        ) :
                            <div className="flex gap-2">
                                <DownloadSimple size={20} />
                                {(completedInvite as CompletedInvite).STATUS === "AUTORIZADO" && "Baixar QR code"}
                            </div>
                        }
                    </motion.span>
                </AnimatePresence>
            </button>}
            {(completedInvite as CompletedInvite).STATUS !== "AUTORIZADO" && <a href={`https://wa.me/+55${TELEFONE_USUARIO}?text=${'Olá! Acabei de preencher os dados de visita e preciso da sua autorização para entrar no condomínio. Poderia confirmar o convite para liberar meu acesso? Obrigado!'}`} className="w-full">
                <Button className="gap-2 w-full h-full">
                    <UserCirclePlus weight="fill" size={18} />
                    <span>Solicitar liberação</span>
                </Button>
            </a>}
        </div>
    ))

    const isMobile = useMediaQuery("(max-width: 640px)")

    if (isMobile) return (
        <Drawer>
            <div className="grid gap-2 w-full">
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DESC_ENDERECO as string)}`}>
                    <Button className="h-12 rounded-xl w-full gap-2 border border-t-0 bg-gradient-to-b from-neutral-900 to-neutral-950 border-border/20 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] text-white  hover:brightness-75">
                        <MapPin weight="fill" size={16} />
                        <span>Abrir no Google Maps</span>
                    </Button>
                </a>
                <DrawerTrigger className={cn(triggerStyle, "w-full")}>
                    <span className="flex gap-2 items-center text-white">Ver detalhes do convite</span>

                </DrawerTrigger>
            </div>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerDescription className="text-md grid">
                        <Content />
                    </DrawerDescription>
                </DrawerHeader>
                {(completedInvite as CompletedInvite).STATUS !== "AUTORIZADO" && (
                    <DrawerFooter className="flex flex-col items-start pt-0">
                        <FooterActions />
                    </DrawerFooter>
                )}
            </DrawerContent>
        </Drawer>
    )

    return (
        <Dialog>
            <div className="grid gap-2 w-full">
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DESC_ENDERECO as string)}`}>
                    <Button className="h-12 rounded-xl w-full gap-2 border border-t-0 transition-all bg-gradient-to-b from-neutral-900 to-neutral-950 border-border/20 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)]  text-white  hover:brightness-75">
                        <MapPin weight="fill" size={16} />
                        <span>Abrir no Google Maps</span>
                    </Button>
                </a>
                <DialogTrigger className={cn(triggerStyle, "w-full")}>
                    <span className="flex gap-2 items-center text-white">Ver detalhes do convite</span>
                </DialogTrigger>
            </div>
            <DialogContent className="sm:max-w-[425px]">
                <DialogDescription className="text-center">
                    <Content />
                </DialogDescription>
                {(completedInvite as CompletedInvite).STATUS !== "AUTORIZADO" && (
                    <DialogFooter>
                        <FooterActions />
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}