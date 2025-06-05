'use client'

import { BASE_URL } from "@/api.config";
import { GuestForm } from "@/components/invite/features/guest-form";
import { HabilitCameraTutorial } from "@/components/invite/features/habilit-camera-tutorial";
import { CompletedInvite } from "@/components/invite/features/recover-invite-form";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer";
import { uploadImage, uploadVehicle } from "@/form.config";
import { useInvite } from "@/hooks/invite/use-invite";
import { useMediaQuery } from "@/hooks/use-media-query";
import { initial } from "@/layout/invite/base";
import { cn } from "@/lib/utils";
import { errorToastDispatcher } from "@/utils/error-toast-dispatcher";
import { generateCompanionInviteMessage, getUsDate } from "@/utils/formatters";
import { UserCirclePlus, WhatsappLogo } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useParams, usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";

const TriggerButton = () => (
    <motion.button
        initial={initial}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative h-fit w-fit inline-flex overflow-hidden rounded-full p-px max-sm:mx-auto"
    >
        <span
            className={cn(
                "absolute inset-[-1000%] bg-[conic-gradient(from_90deg_at_50%_50%,#313131_0%,#3a3a3a_50%,#523785_100%)] ",
                "animate-[spin_4s_linear_infinite] ",
            )}
        />
        <span className="inline-flex h-full w-fit items-center justify-center rounded-full px-1   bg-gradient-to-b from-neutral-900 to-neutral-950 border border-border/20 py-1 text-xs font-medium text-white backdrop-blur-3xl">
            <UserCirclePlus
                weight="fill"
                className="mr-1"
                style={{
                    animation: "pulse 2s infinite ease-in-out",
                }}
                size={16}
            />{" "}
            Adicionar acompanhante
        </span>
    </motion.button>
)

export function AddGuestButton() {
    const [formData, setFormData] = useState<Record<string, string>>({ estrangeiro: "false", formStarted: "false", countryCode: "+55" });
    const [openTutorial, setOpenTutorial] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 600px)")

    const { data, updateInviteData } = useInvite()

    const pathname = usePathname()
    const params = useParams()

    const token = params?.token as string

    const closeDrawerRef = useRef<HTMLButtonElement>(null)
    const dialogCloseRef = useRef<HTMLButtonElement>(null)

    const handleSubmit = async () => {
        try {
            const { countryCode, areaCode, phoneNumber } = formData

            const body = JSON.stringify({
                "request": "cadastra_acompanhante_convite",
                "antecipacao": data?.completedInvite?.QRTOKEN,
                "nome": `${formData.nome} ${formData.sobrenome}`.trim(),
                "estrangeiro": formData.estrangeiro === "true" ? 1 : 0,
                "convite": token,
                ...(formData.data_nascimento && { "data_nascimento": getUsDate(formData.data_nascimento) }),
                ...(areaCode && phoneNumber && { "telefone": `${areaCode}${phoneNumber.replace("-", "")}` }),
                ...(countryCode && { "ddi": countryCode }),
                ...(formData.foto && { "url": await uploadImage(formData.foto, "invite") }),
                ...(formData.cnh && { cnh: formData.cnh }),
                ...(formData.placa && {
                    "veiculo": await uploadVehicle(formData.placa),
                    "placa": formData.placa?.replace(/[^a-zA-Z0-9]/g, "")
                }),
                ...(formData.cpf && formData["estrangeiro"] === "false" && { "cpf": formData.cpf.replace(/\D/g, "") }),
                ...(formData.rg && { "rg": formData.rg.replace(/\D/g, "") }),
                ...(formData.email && { "email": formData.email }),
                ...(formData["profissao"] && { "desc_profissao": formData["profissao"] }),
                ...(formData.passaporte && formData["estrangeiro"] === "true" && { "passaporte": formData.passaporte }),
            })

            const registerUser = await fetch(`${BASE_URL}/convite`, {
                method: "POST",
                body,
                headers: {
                    redirect: "convite",
                    contentType: "application/json",
                    authorization: "hash"
                },
            })
            const res = await registerUser.json()
            if (!res["RESULT"] || res["INFO"]) {
                throw new Error(res["MSG"] || res["INFO"])
            }

            closeDrawerRef.current?.click()
            dialogCloseRef.current?.click()
            toast.success("Acompanhante cadastrado com sucesso!", { dismissible: true, position: "bottom-center" })

            setFormData({ estrangeiro: "false", formStarted: "false", countryCode: "+55" })

            const companion = data?.completedInvite?.ACOMPANHANTES
            const newGuest = { NOME: `${formData.nome} ${formData.sobrenome}`, STATUS: res["STATUS"] }

            return updateInviteData({
                ...data,
                completedInvite: {
                    ...data.completedInvite as CompletedInvite,
                    ACOMPANHANTES: {
                        RESULT: true,
                        DADOS: companion ? [...companion.DADOS ?? [], { NOME: `${formData.nome} ${formData.sobrenome}`, STATUS: res["STATUS"] }] : [newGuest]
                    }
                }
            })
        } catch (err) {
            return errorToastDispatcher(err)
        }
    };

    const messageContent = generateCompanionInviteMessage({
        CONDOMINIO: data.CONDOMINIO as string,
        DATA_CONVITE: data.DATA_CONVITE as string,
        DESC_ENDERECO: data.DESC_ENDERECO as string,
        link: `${window.location.href.includes("localhost") ? `http://localhost:${window.location.href.split("/")[2].split(":")[1]}` : (window.location.href.includes("vercel.app") ? "https://livo-convite.vercel.app" : "https://novo.convitelivo.com.br")}/acompanhante/${token}?antecipacao=${data?.completedInvite?.QRTOKEN}`,
    })

    const verifyCameraPermission = async () => {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })

        if (permission.state === "prompt") {
            await navigator.mediaDevices.getUserMedia({ video: true })
        }

        if (permission.state === "denied") {
            toast.error("Aceite a permissão de uso da câmera", {
                description: "Você precisa conceder accesso à câmera do seu dispositivo para poder tirar a foto",
                action: {
                    label: "Ver como",
                    onClick: () => {
                        setOpenTutorial(true)
                    },
                },
                position: "bottom-center",
                duration: 5000
            });
            setDrawerOpen(false)
        }

        if (permission.state === "granted") {
            return setDrawerOpen((prev) => !prev)
        }
    }

    if (isDesktop) return (
        <>
            <Dialog open={drawerOpen} onOpenChange={verifyCameraPermission}>
                <DialogClose ref={dialogCloseRef} />
                <DialogTrigger className={cn(" w right-4 top-4 z-10", pathname === `/${token}` && !data && "hidden")}>
                    {/* <RainbowButton className="text-xs flex items-center gap-1 px-2">
                        <UserCirclePlus size={20} />
                        <p>Adicionar acompanhantes</p>
                    </RainbowButton> */}
                    <TriggerButton />

                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className="relative">
                        <a target="_blank" href={`https://wa.me/?text=${encodeURIComponent(messageContent)}`} className="absolute bg-[#181818] p-2 rounded-lg border right-6 -top-1.5 z-[100]"><WhatsappLogo /></a>
                        <DialogTitle className="relative text-center">
                            Adicionar acompanhante
                        </DialogTitle>
                        <DialogDescription className="text-center">Preencha os dados do acompanhante ou envie o link por Whatsapp.</DialogDescription>
                    </DialogHeader>
                    <GuestForm  {...{ onSubmit: handleSubmit, formData, onChangeFormData: setFormData, ...data }} />
                </DialogContent>
            </Dialog>
            <HabilitCameraTutorial isOpen={openTutorial} changeOpen={() => setOpenTutorial((prev) => !prev)} />
        </>
    )

    return (
        <>
            <Drawer open={drawerOpen} onOpenChange={verifyCameraPermission} disablePreventScroll repositionInputs={false}>
                <DrawerClose ref={closeDrawerRef} />
                <DrawerTrigger className={cn(" right-4 top-4 z-10", pathname === `/${token}` && !data && "hidden")}>
                    {/* <RainbowButton className="text-xs flex items-center gap-1 px-2">
                        <UserCirclePlus size={20} />
                        <p>Adicionar acompanhantes</p>
                    </RainbowButton> */}

                    <TriggerButton />
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader className="relative">
                        <a target="_blank" href={`https://wa.me/?text=${encodeURIComponent(messageContent)}`} className="absolute bg-[#181818] p-2 rounded-lg border right-6 top-1.5 z-[100]"><WhatsappLogo /></a>
                        <DrawerTitle className="relative">
                            Adicionar acompanhante
                        </DrawerTitle>
                        <DrawerDescription>Preencha os dados do acompanhante ou envie o link por Whatsapp.</DrawerDescription>
                    </DrawerHeader>
                    <GuestForm {...{ onSubmit: handleSubmit, formData, onChangeFormData: setFormData, ...data }} />
                </DrawerContent>
            </Drawer>
            <HabilitCameraTutorial isOpen={openTutorial} changeOpen={() => setOpenTutorial((prev) => !prev)} />
        </>

    )
}