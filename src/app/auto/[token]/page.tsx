'use client'

import { BASE_URL } from "@/api.config"
import { DocumentViewer } from "@/components/invite/document-viewer"
import { AddGuestButton } from "@/components/invite/features/add-guests-button"
import { FaceIdViewer } from "@/components/invite/features/face-id-viewer"
import { GuestForm } from "@/components/invite/features/guest-form"
import { QrcodeViewer } from "@/components/invite/features/qrcode-viewer"
import { type CompletedInvite, RecoverInviteForm, type RequestBodyProps } from "@/components/invite/features/recover-invite-form"
import { SelfRegistrationForm } from "@/components/invite/features/self-registration-form"
import { FormSuccess } from "@/components/invite/form-submited"
import { Protector } from "@/components/invite/protector"
import { SuccessPageContent } from "@/components/invite/success-page-content"
import { ROUTE_KEYS } from "@/constants/invite"
import { useInvite } from "@/hooks/invite/use-invite"
import { initial, usePresentatioAnimation } from "@/layout/invite/base"
import { cn } from "@/lib/utils"
import { errorToastDispatcher } from "@/utils/error-toast-dispatcher"
import { formatUppercase } from "@/utils/formatters"
import { generateRequestBody } from "@/utils/request-body-generator"
import { ArrowDown, EnvelopeOpen } from "@phosphor-icons/react"
import { AnimatePresence, motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"

import { useRef, useState } from "react"
export interface InviteViewerProps extends InviteProps {
    completedInvite: CompletedInvite
    handleRefreshStatus: (data: CompletedInvite) => void
}

export interface InviteFields {
    CAMPO: string
    ESSENCIAL: boolean
    EXIBIR: boolean
    OBRIGATORIEDADE: boolean
    RESULT: boolean
}

export interface InviteProps {
    MENSAGEM: {
        show: boolean
        content: string
    } | null
    USUARIO: string
    ADD_ACOMPANHANTE: boolean
    RECORRENTE?: boolean
    CAMPOS: InviteFields[]
    RECUPERAR: boolean
    CEP_CONDOMINIO?: string
    CONDOMINIO?: string
    DESC_ENDERECO?: string
    NUMERO_CONDOMINIO?: string
    TIPO_BIOMETRIA?: string
    TELEFONE_USUARIO?: string
    DATA_CONVITE?: string
    LOGO_CLIENTE: string
    LOGO_PARCEIRO: string
    FACE?: boolean
    INFO?: string
    requestBody: RequestBodyProps | null
    completedInvite: CompletedInvite | null
    ROUTE_KEY: string
    PRIVATE_KEY_USUARIO?: string
    INVITE_STATUS?: boolean
    LOGIN?: boolean
    CATEGORY?: string
    VISITA?: string
    PET?: boolean
    KEY_CONDOMINIO?: string
}


function Content() {
    const [showCover, setShowCover] = useState(false)
    const [formData, setFormData] = useState<Record<string, string>>({
        estrangeiro: "false",
        formStarted: "false",
        countryCode: "+55",
        // foto: "https://firebasestorage.googleapis.com/v0/b/upload-hub-fdabc.appspot.com/o/files%2Fwpp-suporte.jpg?alt=media&token=d487339c-08ca-46f4-bdbd-32d5e82d1f03"
    })

    const { data, updateInviteData } = useInvite()
    const { scope } = usePresentatioAnimation();
    const params = useParams()
    const nav = useRouter()

    const token = params?.token as string

    const formSectionRef = useRef<HTMLDivElement>(null)

    const handleStartForm = () => {
        if (formSectionRef.current) {
            formSectionRef.current.scrollIntoView({ inline: "start", behavior: "smooth" })
        }
        setTimeout(() => {
            window.scrollTo(0, 0)
            setFormData((prev) => ({ ...prev, formStarted: "true" }))
        }, 1000)
    }

    const { USUARIO, RECUPERAR, RECORRENTE, TIPO_BIOMETRIA, ADD_ACOMPANHANTE, INFO, ROUTE_KEY, CATEGORY } = data as InviteProps

    const handleSubmit = async () => {
        try {
            const { countryCode, areaCode, phoneNumber } = formData

            const body = await generateRequestBody(data.ROUTE_KEY, {
                formData,
                RECORRENTE: RECORRENTE ?? false,
                token: "",
                userId: data.PRIVATE_KEY_USUARIO as string,
            })


            const registerUser = await fetch(`${BASE_URL}/convite`, {
                method: "POST",
                body,
                headers: {
                    redirect: RECORRENTE ? "visita" : "convite",
                    contentType: "application/json",
                    authorization: "hash",
                },
            })
            const res = await registerUser.json()

            if (!res["RESULT"]) {
                throw new Error(res["INFO"] || res["MSG"])
            }
            initTransition()
            setTimeout(() => (
                updateInviteData({
                    ...data,
                    requestBody: {
                        convite: token,
                        estrangeiro: formData["estrangeiro"] === "true",
                        passaporte: formData["passaporte"],
                        cpf: formData["cpf"]?.replace(/\D/g, ""),
                    },
                    completedInvite: {
                        ...res,
                        ...(countryCode &&
                            areaCode &&
                            phoneNumber && {
                            TELEFONE_VISITA: `${countryCode.replace("+", "")}${areaCode}${phoneNumber.replace("-", "")}`,
                        }),
                    },
                })
            ), 400)
        } catch (err) {
            errorToastDispatcher(err)
        }
    }

    const renderIdContent = () => {
        if (RECORRENTE) return <FormSuccess />

        switch (TIPO_BIOMETRIA) {
            case "QRCODE":
                return <QrcodeViewer />
            case "FACIAL":
                return <FaceIdViewer />
            case "DOCUMENTO":
                return <DocumentViewer />
            case "SUCCESS":
                return <SuccessPageContent />
        }
    }

    const renderWelcomeDescription = () => {
        const isCommonInvite = data.ROUTE_KEY === ROUTE_KEYS.COMMON_INVITE_KEY;

        switch (true) {
            case ROUTE_KEY === ROUTE_KEYS.SELF_REGISTRATION:
                return "Preencha as informações solicitadas para começar a aproveitar todos os recursos que a Livo tem a oferecer.";
            case isCommonInvite && !RECORRENTE:
                return "Complete o formulário abaixo e finalize seu convite rápido com praticidade e segurança.";

            case isCommonInvite && RECORRENTE:
                return "Cadastre-se de forma temporária para agilizar seu acesso nas próximas visitas ao condomínio.";

            case !isCommonInvite && data["PET"]:
                return "Informe os dados abaixo para cadastrar seus pets e garantir uma convivência segura no condomínio.";

            case !isCommonInvite && !data["PET"]:
                return "Finalize seu cadastro no aplicativo preenchendo as informações abaixo. É rápido e fácil!";

            default:
                return "";
        }
    };


    const renderWelcome = () => {
        switch (ROUTE_KEY) {
            case ROUTE_KEYS.COMMON_INVITE_KEY: return (
                <>
                    <span>Olá convidado de</span>
                    <br />
                    <span>{formatUppercase(USUARIO ?? "")}</span>
                </>
            )
            case ROUTE_KEYS.RESIDENT_REGISTER_KEY: return (
                <>
                    <span>Olá {formatUppercase(USUARIO ?? "")}</span>
                </>
            )
            case ROUTE_KEYS.SELF_REGISTRATION: return (
                <>
                    <span>Olá, bem-vindo ao <br /> Auto cadastro do {formatUppercase(data.CONDOMINIO ?? "")}</span>
                </>
            )
        }
    }

    const renderForm = () => {
        switch (ROUTE_KEY) {
            case ROUTE_KEYS.COMMON_INVITE_KEY: return (
                <GuestForm onSubmit={handleSubmit} onChangeFormData={setFormData} formData={formData} />
            )
            case ROUTE_KEYS.RESIDENT_REGISTER_KEY: return (
                <GuestForm onSubmit={handleSubmit} onChangeFormData={setFormData} formData={formData} />
            )
            case ROUTE_KEYS.SELF_REGISTRATION: return (
                <SelfRegistrationForm
                    initTranstion={initTransition}
                    onSubmit={(data) => {
                        updateInviteData({ ...data, completedInvite: { ...data.completedInvite as CompletedInvite, RESULT: true } })
                    }} />
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

        <>
            <motion.div
                initial="hidden"
                animate="visible"
                className={cn(
                    "flex flex-col z-10 items-center w-full m-auto flex-1 rounded-ss-xl gap-10 relative",
                    formData["formStarted"] === "true" && !data.completedInvite && "gap-0",
                )}
            >
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

                <section
                    ref={scope}
                    className={cn(
                        "relative w-full",
                        formData["formStarted"] === "true" && !data.completedInvite ? "hidden opacity-0" : "min-h-svh",
                    )}
                >
                    <header className="absolute left-0 top-0 py-4 flex justify-center z-1 w-full">
                        {data.completedInvite && INFO !== "Convite não permite mais entrada!" && ADD_ACOMPANHANTE && <AddGuestButton />}
                    </header>
                    <AnimatePresence>
                        <div className={cn("flex flex-col justify-center items-center w-full h-full p-14 px-4 absolute top-0")}>
                            {data.completedInvite || data.INVITE_STATUS || data.LOGIN ? (
                                renderIdContent()
                            ) : !RECUPERAR ? (
                                <>
                                    <motion.img key='image' initial={initial} src={"/letter-logo.svg"} alt="livo-logo" className="h-5 mb-4" />
                                    <div className="grid gap-2">
                                        <motion.h1
                                            initial={initial}
                                            className="text-center [&_span]:font-medium text-white text-2xl min-[340px]:text-[38px] min-[340px]:leading-[34px] sm:text-5xl sm:leading-[50px] tracking-tight mb-2 max-w-[580px]"
                                        >
                                            {renderWelcome()}
                                            {/* bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 font-pacifico */}
                                        </motion.h1>
                                        <motion.p initial={initial} className="text-sm z-10 text-center text-muted-foreground max-w-[360px] mx-auto">
                                            {renderWelcomeDescription()}
                                        </motion.p>
                                        {
                                            !RECORRENTE && ROUTE_KEY === ROUTE_KEYS.COMMON_INVITE_KEY && CATEGORY === "EVENTO" && (
                                                <motion.button
                                                    initial={initial}
                                                    onClick={() => nav.push(`/recuperar-convite/${token}`)}
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
                                            )
                                        }
                                    </div>
                                    <motion.button key='button' initial={initial} onClick={handleStartForm} className="absolute bottom-20">
                                        <span className="relative flex">
                                            <span
                                                style={{ animationDuration: "1200ms" }}
                                                className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/30"
                                            ></span>
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
                    </AnimatePresence>
                </section>

                {!data.completedInvite && !RECUPERAR && !data.INVITE_STATUS && !data.LOGIN && (
                    <section ref={formSectionRef} id="form" className="px-4 min-h-svh w-full flex relative pt-8 bg-background">
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
                        </div>
                        {renderForm()}
                    </section>
                )}
            </motion.div>
        </>
    )
}

export default function Page() {
    return (
        <Protector>
            <Content />
        </Protector>
    )
}

