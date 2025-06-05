import logo from "@/../public/letter-logo.svg"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddressSelector } from "@/components/visitor-area/features/address-selector"
import { InfoButton } from "@/components/visitor-area/features/info-button"
import { RecurrentAuthorizations } from "@/components/visitor-area/features/recurrent-authorizations"
import { UserProfile } from "@/components/visitor-area/features/user-profile"
import { useAuth } from "@/hooks/visitor-area/use-auth"
import { useUser } from "@/hooks/visitor-area/use-user"
import { cn } from "@/lib/utils"
import { Address } from "@/types/data"
import { formatPeriod, formatUppercase, isToday } from "@/utils/formatters"
import { ArrowCircleDown, ClipboardText, ClockCountdown, HourglassMedium, PersonSimpleWalk, Robot, UserCircleCheck, UserCirclePlus } from "@phosphor-icons/react"
import { AlertCircle, ShieldAlertIcon, ShieldCheckIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { StatusInfo, StatusKey } from "@/components/invite/features/invite-status"
import { AnimatedTabs } from "@/components/ui/animated-tabs"
import { AllHistoricTable } from "@/components/visitor-area/features/all-historic-table"
import { QrcodeButton } from "@/components/visitor-area/features/qrcode-button"
import { InviteList } from "@/components/visitor-area/invite-list"
import { usePWAInstall } from "@/hooks/visitor-area/use-pwa"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const tabs = [
    { label: "Autorizações", value: "authorizations" },
    { label: "Histórico", value: "general-historic" },
    { label: "Próximos acessos", value: "next-accesses" },
]

const statusMap: Record<StatusKey, StatusInfo> = {
    "AUTORIZADO": {
        text: "Autorizado",
        description: "A entrada foi autorizada e está liberada.",
        icon: (
            <div className="icon p-3 rounded-full">
                <ShieldCheckIcon fill="rgba(0, 212, 145, 0.35)" size={24} />
            </div>
        ),
        className: "bg-emerald-800/20 border-emerald-500 text-emerald-400 [&_div_.icon]:bg-emerald-900/80"
    },
    "AGUARDANDO AUTORIZAÇÃO MORADOR": {
        text: "Aguardando autorização morador",
        description: "Aguarde o morador autorizar a entrada.",
        icon: (
            <div className="icon p-3 rounded-full">
                <ClockCountdown weight="duotone" size={24} />
            </div>
        ),
        className: "bg-yellow-700/20 border-yellow-500 text-yellow-500 [&_div_.icon]:bg-yellow-600/20"
    },
    "ENTROU": {
        text: "Entrou",
        description: "O visitante ou prestador já entrou no condomínio.",
        icon: (
            <div className="icon p-3 rounded-full">
                <PersonSimpleWalk weight="duotone" size={24} />
            </div>
        ),
        className: "bg-emerald-900/20 border-emerald-500 text-emerald-400 [&_div_.icon]:bg-emerald-900/80"
    },
    "SAIU": {
        text: "Saiu",
        description: "O visitante ou prestador já saiu do condomínio.",
        icon: (
            <div className="icon p-3 rounded-full">
                <PersonSimpleWalk weight="fill" size={24} className="-scale-x-100" />
            </div>
        ),
        className: "bg-gray-600/20 border-gray-500 text-white [&_div_.icon]:bg-gray-600/30"
    },
    "CANCELADO": {
        text: "Cancelado",
        description: "O acesso foi cancelado e não deve ser realizado.",
        icon: (
            <div className="icon p-3 rounded-full">
                <ShieldAlertIcon fill="rgba(251, 44, 54, 0.15)" size={24} />
            </div>
        ),
        className: "bg-red-500/10 border-red-500 text-red-500/80 [&_div_.icon]:bg-red-500/15"
    },
    "ATRASADO": {
        text: "Atrasado",
        description: "O visitante não compareceu no horário combinado. Verificar com o morador.",
        icon: (
            <div className="icon p-3 rounded-full">
                <ShieldAlertIcon fill="rgba(240, 176, 0, 0.25)" size={24} />
            </div>
        ),
        className: "bg-yellow-700/20 border-yellow-500 text-yellow-500 [&_div_.icon]:bg-yellow-600/20"
    },
    "AUTORIZADO POR MORADOR": {
        text: "Autorizado por morador",
        description: "O morador autorizou diretamente a entrada.",
        icon: (
            <div className="icon p-3 rounded-full">
                <UserCircleCheck weight="duotone" size={24} />
            </div>
        ),
        className: "bg-emerald-900/20 border-emerald-500 text-emerald-400 [&_div_.icon]:bg-emerald-900/80"
    },
    "ANTECIPADO POR MORADOR": {
        text: "Antecipado por morador",
        description: "O morador antecipou a autorização antes do horário previsto.",
        icon: (
            <div className="icon p-3 rounded-full">
                <HourglassMedium weight="duotone" size={24} />
            </div>
        ),
        className: "bg-purple-600/10 border-purple-500 text-purple-500 [&_div_.icon]:bg-purple-800/40"
    },
    "BAIXA MANUAL": {
        text: "Baixa manual",
        description: "O registro foi encerrado manualmente pela portaria.",
        icon: (
            <div className="icon p-3 rounded-full">
                <ArrowCircleDown weight="duotone" size={24} />
            </div>
        ),
        className: "bg-orange-500/10 border-orange-500 text-orange-400 [&_div_.icon]:bg-orange-500/20"
    },
    "BAIXA AUTOMATICA": {
        text: "Baixa automática",
        description: "O registro foi encerrado automaticamente pelo sistema.",
        icon: (
            <div className="icon p-3 rounded-full">
                <Robot weight="duotone" size={24} />
            </div>
        ),
        className: "bg-teal-500/10 border-teal-500 text-teal-500 [&_div_.icon]:bg-teal-500/20"
    },
    "AGUARDANDO VALIDAÇÃO PORTARIA": {
        text: "Aguardando validação portaria",
        description: "A portaria precisa validar os dados antes de prosseguir.",
        icon: (
            <div className="icon p-3 rounded-full">
                <ClipboardText weight="duotone" size={24} />
            </div>
        ),
        className: "bg-yellow-700/20 border-yellow-500 text-yellow-500 [&_div_.icon]:bg-yellow-600/20"
    },
    "SOLICITAR LIBERAÇÃO MORADOR": {
        text: "Solicitar liberação morador",
        description: "Entre em contato com o morador para solicitar a liberação do visitante ou prestador.",
        icon: (
            <div className="icon p-3 rounded-full">
                <UserCirclePlus weight="duotone" size={24} />
            </div>
        ),
        className: "bg-purple-500/10 border-purple-500 text-purple-400/80 [&_div_.icon]:bg-purple-500/15"
    },
    "AGUARDANDO LIBERAÇÃO PORTARIA": {
        text: "Aguardando liberação portaria",
        description: "Aguarde a portaria liberar o acesso.",
        icon: (
            <div className="icon p-3 rounded-full">
                <ClockCountdown weight="duotone" size={24} />
            </div>
        ),
        className: "bg-yellow-700/20 border-yellow-500 text-yellow-500 [&_div_.icon]:bg-yellow-600/20"
    }
}

// const waitWhile = (conditionFn: () => boolean): Promise<void> => (
//     new Promise((resolve) => {
//         const interval = setInterval(() => {
//             if (conditionFn()) {
//                 clearInterval(interval);
//                 resolve();
//             }
//         }, 100);
//     })
// );

export function VisitorArea() {
    const [currentTab, setCurrentTab] = useState(tabs[0].value)
    const [prevTab, setPrevTab] = useState("")
    const [action, setAction] = useState("next")
    const { data } = useAuth()

    const { isInstalled, isInstallable, install } = usePWAInstall()


    useEffect(() => {
        if (isInstallable && !isInstalled) {
            toast('Que tal agilizar a próxima vez que precisar vir aqui?', {
                description: 'Você pode adicionar este site à tela inicial para acesso mais rápido.',
                action: {
                    label: "Instalar",
                    onClick: () => install(),
                },
            })
        }
    }, [isInstallable, isInstalled, install])

    // useEffect(() => {
    //     if (installing) {
    //         toast.promise(
    //             waitWhile(() => installing),
    //             {
    //                 loading: "Instalando...",
    //                 success: "Instalação concluída com sucesso!",
    //             }
    //         )
    //     }
    // }, [installing])

    const { addresses, filteredHistorical, currentAddress, setCurrentAddress, allHistoric, reloadHistorical, nextInvites, address_filter_options, loading } = useUser()
    const status = statusMap[currentAddress?.STATUS as StatusKey]

    const viewTabs = () => {
        switch (currentTab) {
            case "authorizations": return (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col-reverse min-[1100px]:grid min-[1100px]:grid-cols-3 gap-4 h-full">
                        {
                            filteredHistorical && <RecurrentAuthorizations
                                onSelectCurrentAddress={(address) => setCurrentAddress(address)}
                                addresses={addresses ?? []}
                                currentAddress={currentAddress as Address} />
                        }
                        <Card className="shadow-lg rounded-2xl w-full h-fit">
                            <CardHeader>
                                <CardTitle className="text-xl font-medium flex items-center gap-2 justify-between">
                                    {
                                        currentAddress
                                            ? (currentAddress.RECORRENTE ? 'Horários de acesso' : 'Período de acesso')
                                            : 'Nenhum horário de acesso disponível'
                                    }
                                    <AnimatePresence mode="wait">
                                        {currentAddress?.STATUS.includes("AUTORIZADO") && (
                                            currentAddress?.RECORRENTE
                                                ? (currentAddress?.BOTAO && (
                                                    (
                                                        <motion.div
                                                            initial={{ y: 30, opacity: 0, scale: .8 }}
                                                            animate={{ y: 0, opacity: 1, scale: 1 }}
                                                            exit={{ y: 30, opacity: 0, scale: .8 }}
                                                        >
                                                            <QrcodeButton currentAddress={currentAddress} />
                                                        </motion.div>
                                                    )
                                                ))
                                                : (currentAddress?.KEY && (
                                                    (
                                                        <motion.div
                                                            initial={{ y: 30, opacity: 0, scale: .8 }}
                                                            animate={{ y: 0, opacity: 1, scale: 1 }}
                                                            exit={{ y: 30, opacity: 0, scale: .8 }}
                                                        >
                                                            <QrcodeButton currentAddress={currentAddress} />
                                                        </motion.div>
                                                    )
                                                ))

                                        )}
                                    </AnimatePresence>
                                </CardTitle>
                                <CardDescription>
                                    {
                                        currentAddress?.RECORRENTE
                                            ? 'Confira abaixo os dias e horários em que o acesso ao condomínio está permitido.'
                                            : 'Confira abaixo o período durante o qual você poderá acessar o condomínio.'
                                    }
                                </CardDescription>
                            </CardHeader>
                            <div className={cn("px-6 py-4 flex items-center justify-between", status?.className)}>
                                <div className="flex items-center gap-3">
                                    {status?.icon}
                                    <div>
                                        <h3 className="text-sm font-medium">{status?.text}</h3>
                                        <p className="text-xs text-zinc-400">
                                            {currentAddress?.STATUS.includes("AUTORIZADO") && (currentAddress?.KEY || currentAddress?.BOTAO ? "Gere o QRcode para acessar o condomínio, clicando no botão acima" : "Acesse o condomínio utilizando o recurso de facial")}
                                            {!currentAddress?.STATUS.includes("AUTORIZADO") && status?.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <CardContent>
                                <div className="p-2 rounded-xl border bg-[#121212] overflow-hidden">
                                    <AddressSelector currentAddress={currentAddress as Address} addresses={addresses} onSelect={setCurrentAddress} />
                                    {currentAddress && currentAddress?.RECORRENTE && currentAddress?.VISITA ? currentAddress.VISITA
                                        .filter(({ FAIXA }) => FAIXA !== '')
                                        .map(({ DIA, FAIXA }, index) => (
                                            <div
                                                key={DIA}
                                                className={cn(
                                                    "flex items-center justify-between p-3",
                                                    index !== (currentAddress?.VISITA as typeof currentAddress.VISITA).filter(({ FAIXA }) => FAIXA !== '').length - 1 && "border-b",
                                                    isToday(DIA) && "bg-[#282828]",
                                                )}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isToday(DIA) && (
                                                        <Badge variant="outline" className="bg-primary/10 transition-all">
                                                            Hoje
                                                        </Badge>
                                                    )}
                                                    <span className={cn("text-sm", isToday(DIA) && "text-primary max-[350px]:hidden")}>{DIA}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="max-[450px]:text-xs text-sm text-muted-foreground">
                                                        {FAIXA}
                                                        {/* {formatTimeRange(startTime, endTime)} */}
                                                    </span>
                                                </div>
                                            </div>
                                        )) : !currentAddress || currentAddress?.RECORRENTE
                                        ? (
                                            <div className="flex flex-col items-center justify-center text-muted-foreground py-4 text-center">
                                                <AlertCircle className="h-8 w-8 mb-2" />
                                                <p className="text-sm">Nenhum registro encontrado</p>
                                            </div>
                                        )
                                        : (
                                            <p className="py-3 text-center max-[370px]:text-xs text-sm text-muted-foreground">
                                                {formatPeriod(currentAddress?.DATA_INI ?? '', currentAddress?.DATA_FIM ?? '')}
                                            </p>
                                        )
                                    }
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )
            case "general-historic": return (
                <AllHistoricTable onReloadData={reloadHistorical} filterOptions={address_filter_options ?? []} data={allHistoric ?? []} />
            )
            case "next-accesses": return (
                <InviteList invites={nextInvites ?? []} />
            )
        }
    }

    useEffect(() => {
        const currentTabIndex = tabs.findIndex(({ value }) => value === currentTab);
        const prevTabIndex = tabs.findIndex(({ value }) => value === prevTab);

        if (currentTabIndex > prevTabIndex) {
            setAction("next");
        } else if (currentTabIndex < prevTabIndex) {
            setAction("prev");
        }
    }, [currentTab]);

    return (
        <main className="relative min-h-svh overflow-hidden flex flex-col justify-items-center">
            <motion.div
                initial={{ opacity: 0, filter: "brightness(.7) blur(100px)" }}
                animate={{
                    opacity: [0, 0.6, 0.8],
                    filter: "blur(100px) brightness(1)",
                }}
                transition={{ duration: 0.5 }}
                className="bg-cover absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 rounded-full blur-3xl"
            />
            <motion.div
                initial={{ opacity: 0, filter: "brightness(.7) blur(100px)" }}
                animate={{
                    opacity: [0, 0.6, 0.8],
                    filter: "blur(100px) brightness(1)",
                }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-cover absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 to-violet-500/10 rounded-full blur-3xl"
            />

            <div className="w-full h-full flex flex-col z-10 gap-8">
                <header className="gap-5 flex items-center justify-between w-full border-b py-4">
                    <div className="w-full max-w-[1100px] px-5 mx-auto flex justify-between items-center">
                        <img src={logo} className="h-3.5" alt="" />
                        <div className="flex gap-2">
                            <UserProfile />
                            <InfoButton />
                        </div>
                    </div>
                </header>
                <div
                    className="max-w-[1100px] mx-auto w-full flex flex-col gap-6 p-5 pt-0 relative h-full">
                    {/* <h1 className="text-3xl sm:text-4xl tracking-tight font-medium ">Confira abaixo suas autorizações de convites recorrentes e histórico de acesso.</h1> */}
                    <h1 className="text-3xl sm:text-4xl tracking-tight font-medium ">Olá, {formatUppercase(data.NOME)} 👋 <p className="text-[18px] text-white/70">O que gostaria de ver hoje?</p></h1>

                    <div className="w-fit">
                        <AnimatedTabs
                            tabs={tabs}
                            disabled={loading}
                            onChangeTab={(newTab) => {
                                setPrevTab(currentTab);
                                setCurrentTab(newTab);
                            }}
                        />
                    </div>
                    {loading && (
                        <div className="grid place-content-center h-full">
                            <motion.p
                                className={cn(
                                    "bg-[linear-gradient(110deg,#404040,35%,#fff,50%,#404040,75%,#404040)] z-10",
                                    "bg-[length:200%_100%] bg-clip-text text-base font-medium text-transparent text-center",
                                )}
                                initial={{ backgroundPosition: "200% 0" }}
                                animate={{ backgroundPosition: "-200% 0" }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 2,
                                    ease: "linear",
                                }}
                            >
                                Carregando seus dados...
                            </motion.p>
                        </div>
                    )}
                    {!loading && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentTab}
                                initial={{ opacity: 0, x: action === "next" ? 40 : -40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: action === "next" ? -40 : 40 }}
                                className="w-full h-full"
                            >
                                {viewTabs()}
                            </motion.div>
                        </AnimatePresence>

                    </motion.div>}
                </div>
            </div >
        </main >
    )
}

