import { BASE_URL } from "@/api.config"
import { useInvite } from "@/hooks/invite/use-invite"
import { cn } from "@/lib/utils"
import { ArrowCircleDown, CheckCircle, ClipboardText, ClockCountdown, PersonSimpleWalk, Robot, Spinner, UserCircleCheck, UserCirclePlus, Warning, WhatsappLogo, XCircle } from "@phosphor-icons/react"
import { HourglassMedium } from "@phosphor-icons/react/dist/ssr"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "../../ui/button"
import { CompletedInvite, RequestBodyProps } from "./recover-invite-form"

export type StatusKey =
    | "AUTORIZADO"
    | "AGUARDANDO AUTORIZAÇÃO MORADOR"
    | "ENTROU"
    | "SAIU"
    | "CANCELADO"
    | "ATRASADO"
    | "AUTORIZADO POR MORADOR"
    | "ANTECIPADO POR MORADOR"
    | "BAIXA MANUAL"
    | "BAIXA AUTOMATICA"
    | "AGUARDANDO VALIDAÇÃO PORTARIA"
    | "SOLICITAR LIBERAÇÃO MORADOR"
    | "AGUARDANDO LIBERAÇÃO PORTARIA"

export interface StatusInfo {
    text: string
    icon: React.ReactNode
    className: string
    description?: string
}

const statusMap: Record<StatusKey, StatusInfo> = {
    "AUTORIZADO": {
        text: "Autorizado",
        icon: <CheckCircle weight="duotone" size={20} />,
        className: "bg-green-600/60 border-green-500 text-white"
    },
    "AGUARDANDO AUTORIZAÇÃO MORADOR": {
        text: "Aguardando autorização morador",
        icon: <ClockCountdown weight="duotone" size={20} />,
        className: "bg-yellow-600/60 border-yellow-500 text-white"
    },
    "ENTROU": {
        text: "Entrou",
        icon: <PersonSimpleWalk weight="duotone" size={20} />,
        className: "bg-green-600/60 border-green-500 text-white"
    },
    "SAIU": {
        text: "Saiu",
        icon: <PersonSimpleWalk weight="duotone" size={20} className="-scale-x-100" />,
        className: "bg-gray-600/60 border-gray-500 text-white"
    },
    "CANCELADO": {
        text: "Cancelado",
        icon: <XCircle weight="duotone" size={20} />,
        className: "bg-red-600/60 border-red-500 text-white"
    },
    "ATRASADO": {
        text: "Atrasado",
        icon: <Warning weight="duotone" size={20} />,
        className: "bg-yellow-600/60 border-yellow-500 text-white"
    },
    "AUTORIZADO POR MORADOR": {
        text: "Autorizado por morador",
        icon: <UserCircleCheck weight="duotone" size={20} />,
        className: "bg-green-600/60 border-green-500 text-white"
    },
    "ANTECIPADO POR MORADOR": {
        text: "Antecipado por morador",
        icon: <HourglassMedium weight="duotone" size={20} />,
        className: "bg-purple-600/60 border-purple-500 text-white"
    },
    "BAIXA MANUAL": {
        text: "Baixa manual",
        icon: <ArrowCircleDown weight="duotone" size={20} />,
        className: "bg-orange-600/60 border-orange-500 text-white"
    },
    "BAIXA AUTOMATICA": {
        text: "Baixa automática",
        icon: <Robot weight="duotone" size={20} />,
        className: "bg-teal-600/60 border-teal-500 text-white"
    },
    "AGUARDANDO VALIDAÇÃO PORTARIA": {
        text: "Aguardando validação portaria",
        icon: <ClipboardText weight="duotone" size={20} />,
        className: "bg-yellow-600/60 border-yellow-500 text-white"
    },
    "SOLICITAR LIBERAÇÃO MORADOR": {
        text: "Solicitar liberação morador",
        icon: <UserCirclePlus weight="duotone" size={20} />,
        className: "bg-purple-600/60 border-purple-500 text-white"
    },
    "AGUARDANDO LIBERAÇÃO PORTARIA": {
        text: "Aguardando liberação portaria",
        icon: <ClockCountdown weight="duotone" size={20} />,
        className: "bg-yellow-600/60 border-yellow-500 text-white"
    }
}

export function InviteStatus({ className }: { className?: string }) {
    const [refreshing, setRefreshing] = useState(false)
    const [countdown, setCountdown] = useState(0)

    const { data, updateInviteData } = useInvite()
    const { TELEFONE_USUARIO, completedInvite } = data

    const [body] = useState<RequestBodyProps | null>(data?.requestBody as RequestBodyProps)

    const statusKey = completedInvite?.STATUS as StatusKey
    const status = statusMap[statusKey]

    const refreshStatus = useCallback(async () => {
        if (!body || ["AUTORIZADO", "AUTORIZADO POR MORADOR"].includes(statusKey)) return
        setRefreshing(true)
        try {
            const res = await fetch(BASE_URL, {
                body: JSON.stringify({ "request": "get_recuperacao_convite", ...(body) }),
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "redirect": "convite",
                    "Authorization": "hash"
                }
            })

            const newCompletedInviteData: CompletedInvite = await res.json()
            if (!newCompletedInviteData["RESULT"]) {
                throw new Error(newCompletedInviteData["INFO"])
            }

            if (newCompletedInviteData.STATUS === statusKey) {
                setCountdown(20)
                throw new Error("Status não atualizado")
            }

            updateInviteData({ ...data, completedInvite: newCompletedInviteData })
        } catch (err) {
            if (err instanceof Error) {
                return toast.warning(err.message, {
                    closeButton: true,
                    position: "bottom-center", duration: 50000000,
                    description: "Entre em contato com o morador para que ele atualize sua autorização",
                    action: (
                        <Button
                            onClick={() => window.open(`https://wa.me/${TELEFONE_USUARIO && "+55" + TELEFONE_USUARIO}?text=${'Olá! Acabei de preencher os dados de visita e preciso da sua autorização para entrar no condomínio. Poderia confirmar o convite para liberar meu acesso? Obrigado!'}`)}
                            className="w-[36px] h-[32px] p-2" size={"icon"}>
                            <WhatsappLogo weight="duotone" className="size-[18px]" />
                        </Button>
                    )
                })
            }
        } finally {
            setRefreshing(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [body, statusKey, TELEFONE_USUARIO])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        }
        return () => clearTimeout(timer)
    }, [countdown])

    const isDisabled = refreshing || countdown > 0

    return (
        <button
            disabled={isDisabled}
            onClick={refreshStatus}
            className={cn(
                "z-50 w-fit min-w-[135px] mx-auto justify-center border flex items-center gap-2 text-sm p-2 rounded-md active:scale-95 active:brightness-75 hover:brightness-75 disabled:cursor-not-allowed disabled:active:scale-100 disabled:brightness-50 transition-all duration-300",
                status.className,
                className,
                isDisabled && "bg-gray-500/40 border-gray-500/50"
            )}
        >
            {refreshing ? (
                <>
                    <Spinner weight="duotone" className="animate-spin duration-500" size={20} />
                    <p className="animate-pulse">Verificando...</p>
                </>
            ) : countdown > 0 ? (
                <>
                    <ClockCountdown weight="duotone" size={20} />
                    <p>Aguarde {countdown}s</p>
                </>
            ) : (
                <>
                    {status.icon}
                    <p>{status.text}</p>
                </>
            )}
        </button>
    )
}