"use client"

import logo from "@/../public/letter-logo.svg";
import { DocumentViewer } from "@/components/invite/document-viewer";
import { FaceIdViewer } from "@/components/invite/features/face-id-viewer";
import { GuestForm } from "@/components/invite/features/guest-form";
import { QrcodeViewer } from "@/components/invite/features/qrcode-viewer";
import { CompletedInvite, RecoverInviteForm } from "@/components/invite/features/recover-invite-form";
import { initial } from "@/layout/invite/base";
import { cn } from "@/lib/utils";
import { ArrowDown, EnvelopeOpen } from "@phosphor-icons/react";
import { AnimatePresence, motion } from 'framer-motion';

import { BASE_URL } from "@/api.config";
import { Backpage } from "@/components/ui/back-page";
import { uploadImage, uploadVehicle } from "@/form.config";
import { useInvite } from "@/hooks/invite/use-invite";
import { usePresentatioAnimation } from "@/layout/invite/base";
import { InviteProps } from "@/types/invite";
import { errorToastDispatcher } from "@/utils/error-toast-dispatcher";
import { getUsDate } from "@/utils/formatters";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useRef, useState } from 'react';

export interface InviteViewerProps extends InviteProps { completedInvite: CompletedInvite, handleRefreshStatus: (data: CompletedInvite) => void }

export function Companion() {
    const { data, updateInviteData } = useInvite()
    const [showCover, setShowCover] = useState(false)

    const [formData, setFormData] = useState<Record<string, string>>({ estrangeiro: "false", formStarted: "false", countryCode: "+55" });

    const params = useParams();
    const queryParams = useSearchParams()
    const nav = useRouter()

    const { scope } = usePresentatioAnimation()

    const formSectionRef = useRef<HTMLDivElement>(null);

    const handleStartForm = () => {
        if (formSectionRef.current) {
            formSectionRef.current.scrollIntoView({ inline: "start", behavior: "smooth" })
        }
        setTimeout(() => {
            window.scrollTo(0, 0)
            setFormData((prev) => ({ ...prev, formStarted: "true" }))
        }, 1000)
    }

    const { RECUPERAR, TIPO_BIOMETRIA } = data as InviteProps;

    const handleSubmit = async () => {
        try {
            const { countryCode, areaCode, phoneNumber } = formData

            const body = JSON.stringify({
                "request": "cadastra_acompanhante_convite",
                "antecipacao": queryParams?.get("antecipacao"),
                "nome": `${formData.nome} ${formData.sobrenome}`.trim(),
                "estrangeiro": formData.estrangeiro === "true" ? 1 : 0,
                "convite": params?.token,
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
            const registerUserResponse = await registerUser.json()

            if (!registerUserResponse["RESULT"] || registerUserResponse["INFO"]) {
                throw new Error(registerUserResponse["MSG"] || registerUserResponse["INFO"])
            }

            const getCompanionInvite = await fetch(BASE_URL, {
                body: JSON.stringify({
                    "request": "get_recuperacao_convite",
                    "convite": params?.token,
                    "estrangeiro": formData["estrangeiro"],
                    ...(formData.cpf && { "cpf": formData.cpf.replace(/\D/g, "") }),
                    ...(formData.passaporte && { "passaporte": formData.passaporte }),
                }),
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "redirect": "convite",
                    "Authorization": "hash"
                }
            })

            const getCompanionInviteResponse = await getCompanionInvite.json()
            if (!getCompanionInviteResponse["RESULT"] || getCompanionInviteResponse["INFO"]) {
                throw new Error(getCompanionInviteResponse["MSG"] || getCompanionInviteResponse["INFO"])
            }

            initTransition()

            setTimeout(() => (
                updateInviteData({
                    ...data as InviteProps,
                    completedInvite: getCompanionInviteResponse,
                    requestBody: {
                        "convite": params?.token as string,
                        "estrangeiro": Boolean(formData["estrangeiro"]),
                        "cpf": formData.cpf.replace(/\D/g, ""),
                        "passaporte": formData.passaporte
                    }
                })
            ), 800)
        } catch (err) {
            return errorToastDispatcher(err)
        }
    };

    const renderIdContent = () => {
        switch (TIPO_BIOMETRIA) {
            case "QRCODE":
                return (
                    <QrcodeViewer />
                )
            case "FACIAL":
                return (
                    <FaceIdViewer />
                )
            case "DOCUMENTO":
                return (
                    <DocumentViewer />
                )
        }
    }

    const initTransition = () => {
        setShowCover(true)
        setTimeout(() => {
            setShowCover(false)
        }, 500)
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-10 relative w-full m-auto flex-1 rounded-ss-xl z-10">

            <AnimatePresence mode="wait">
                {showCover && (
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1, transformOrigin: "bottom" }}
                        exit={{ scaleY: 0, transformOrigin: "top" }}
                        transition={{
                            type: "keyframes",
                            duration: 0.4,
                        }}
                        className="cover-transition z-[100] bottom-0 bg-neutral-950 absolute left-0 w-full h-full"
                    />
                )}
            </AnimatePresence>
            <Backpage />
            <section ref={scope} className={cn("min-h-svh relative w-full", formData["formStarted"] === "true" && !data.completedInvite && "hidden opacity-0")}>
                <div className={cn("flex flex-col justify-center items-center w-full h-full p-14 px-4 absolute top-0")}>
                    {data?.completedInvite ? renderIdContent() : !RECUPERAR ? (
                        <>
                            <motion.img initial={initial} src={logo} alt="livo-logo" className="h-42 my-8" />
                            <div className="grid gap-2">
                                <motion.h1 initial={initial} className="presentation text-[40px] xl:text-[50px] xl:leading-[52px] leading-[42px] z-10 -tracking-[1.6px] text-center font-black text-white">
                                    Olá acompanhante
                                </motion.h1>
                                <motion.p initial={initial} className="text-sm z-10 text-center text-muted-foreground max-w-[360px] mx-auto">
                                    Preencha o formulário para se cadastrar no condomínio ou clique abaixo para recuperar seu convite, se já cadastrou.
                                </motion.p>
                                <motion.button
                                    initial={initial}
                                    onClick={() => nav.push(`/recuperar-convite/${params?.token}`)}
                                    className="relative h-fit w-fit inline-flex overflow-hidden rounded-full p-px mx-auto mt-1">
                                    <span
                                        className={cn(
                                            "absolute inset-[-1000%] bg-[conic-gradient(from_90deg_at_50%_50%,#313131_0%,#3a3a3a_50%,#523785_100%)] ",
                                            "animate-[spin_4s_linear_infinite] ",
                                        )} />
                                    <span className="inline-flex h-full w-fit items-center justify-center rounded-full  bg-gradient-to-b from-neutral-900 to-neutral-950 border border-border/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-3xl">
                                        <EnvelopeOpen
                                            weight="fill"
                                            className="mr-1"
                                            style={{
                                                animation: "pulse 2s infinite ease-in-out",
                                            }} />
                                        {" "}Recuperar convite
                                    </span>
                                </motion.button>
                            </div>
                            <motion.button
                                initial={initial}
                                onClick={handleStartForm}
                                className="absolute bottom-20"
                            >
                                <span className="relative flex">
                                    <span style={{ animationDuration: "1200ms" }} className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/30"></span>
                                    <span className="relative p-4 inline-flex rounded-full bg-white">
                                        <ArrowDown size={24} />
                                    </span>
                                </span>
                            </motion.button>
                        </>
                    ) : (
                        <RecoverInviteForm initTranition={initTransition} />
                    )}
                </div>
            </section>

            {
                !data?.completedInvite && !RECUPERAR && (
                    <section ref={formSectionRef} id="form" className="px-4 relative min-h-svh w-full flex pt-8 bg-background">
                        <div className="absolute inset-0 overflow-hidden">
                            <motion.div
                                initial={{ opacity: 0, filter: "brightness(.7)" }}
                                animate={{
                                    opacity: formData.formStarted === "true" ? [0, 6, 0.8] : 0,
                                    filter: "blur(100px)",
                                }}
                                transition={{ duration: 0.5 }}
                                className="bg-cover absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 rounded-full blur-3xl"
                            />
                            <motion.div
                                initial={{ opacity: 0, filter: "brightness(.7)" }}
                                animate={{
                                    opacity: formData.formStarted === "true" ? [0, 6, 0.8] : 0,
                                    filter: "blur(100px)",
                                }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="bg-cover absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 to-violet-500/10 rounded-full blur-3xl"
                            />
                            {/* <img src={outline_logo} className="absolute w-[300px] top-[10%] -right-1/3 z-20" /> */}
                        </div>
                        <GuestForm {...{ ...data as InviteProps, onSubmit: handleSubmit, formData, onChangeFormData: setFormData }} />
                    </section>
                )

            }
        </motion.div >
    );
}