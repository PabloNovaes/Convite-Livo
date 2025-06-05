'use client'

import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { getOSmodel } from "@/utils/get-os-model"
import { AppleLogo, ArrowRight, GlobeSimple, GooglePlayLogo, Sparkle } from "@phosphor-icons/react"
import { motion, useInView, type Variants } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { Confetti, ConfettiRef } from "../magicui/confetti"

// Add this right after the imports
const pulseAnimation = `
  @keyframes pulse {
    0% { opacity: 0.7; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
    100% { opacity: 0.7; transform: scale(1); }
  }
`

// eslint-disable-next-line react-refresh/only-export-components
export const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            ease: "easeOut",
            duration: 0.3,
            delay: 1
        },
    },
}

const itemVariants = {
    hidden: {
        opacity: 0,
        filter: "blur(6px)",
        y: 20,
    },
    show: {
        opacity: 1,
        y: 0,
        filter: "blur(0)",
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 12,
            mass: 0.8,
            velocity: 2,
            delay: 1
        },
    },
} as Variants


export function SuccessPageContent() {
    const OSModel = getOSmodel()
    const [dispatchConfetti, setDispatchConfetti] = useState(false)

    const getStore = () => {
        switch (OSModel) {
            case 'Android': return 'Play Store'
            case 'iOS': return 'App Store'
        }
    }

    const isMobile = useMediaQuery("(max-width: 640px)")

    const mockupVariants = {
        hidden: {
            opacity: 0,
            filter: "blur(8px)",
            y: 40,
            rotate: isMobile ? 30 : 0,
            scale: 0.8,
        },
        show: {
            rotate: isMobile ? -10 : 0,
            left: isMobile ? -10 : 0,
            opacity: 1,
            y: 0,
            filter: "blur(0)",
            scale: [0.1, 1.3, 1],
            transition: {
                type: "tween",
                stiffness: 300,
                damping: 20,
                delay: 1
            },
        },
    } as Variants

    const contents = {
        "desktop": {
            title: "Aplicativo disponível apenas para dispositivos móveis",
            subtitle: "Acesse essa pagina pelo seu celular para instalar o app e se conectar ao seu condomínio"
        },
        "mobile": {
            title: "Baixe agora o Livo App e simplifique sua rotina no condomínio!",
            subtitle: " Seu acesso foi ativado! Faça o download do Livo App e gerencie tudo no seu condomínio com facilidade."
        },
    }

    const confettiRef = useRef<ConfettiRef>(null)

    const ref = useRef(null)
    const isInView = useInView(ref)

    useEffect(() => {
        if (isInView) setTimeout(() => setDispatchConfetti(true), 1200)
    }, [isInView])

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex justify-end w-full h-full max-h-svh absolute top-0 left-0"
        >
            <style>{`${pulseAnimation}`}</style>
            {dispatchConfetti && <Confetti ref={confettiRef} className={cn("absolute left-0 top-0 z-0 size-full ")} />}
            <div className="w-full grid mx-auto overflow-hidden top-4 justify-center">
                <motion.img
                    variants={mockupVariants}
                    className={cn("w-full max-sm:max-h-[350px] max-sm:bottom-[35%] max-h-[500px] z-[9] absolute mockup-settings", !isMobile && "bottom-[20%]")}
                    src={isMobile ? "/assets/mockup.svg" : "/assets/desktop-mockup.svg"}
                />

                <motion.footer
                    className="max-w-5xl flex z-20 flex-col sm:grid sm:items-end justify-end sm:grid-cols-4 w-full gap-4 sm:gap-8 p-6 bottom-0  text-white h-auto text-center sm:text-start sm:mb-20"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <div className="grid gap-3 sm:gap-5 sm:col-span-3">
                        <motion.div
                            ref={ref}
                            className="relative h-6 w-fit inline-flex items-center overflow-hidden rounded-full p-px max-sm:mx-auto"
                            variants={itemVariants}
                            animate={{
                                y: [0, -5, 0],
                            }}
                        >
                            <span
                                className={cn(
                                    "absolute inset-[-1000%] bg-[conic-gradient(from_90deg_at_50%_50%,#313131_0%,#3a3a3a_50%,#753ab4_100%)] ",
                                    "animate-[spin_3s_linear_infinite] ",
                                )}
                            />
                            <span className="inline-flex h-full w-fit items-center justify-center rounded-full  bg-gradient-to-b from-neutral-900 to-neutral-950 border border-border/20 px-3 text-xs text-white backdrop-blur-3xl">
                                <Sparkle
                                    weight="fill"
                                    className="mr-1"
                                    style={{
                                        animation: "pulse 2s infinite ease-in-out",
                                    }}
                                />{" "}
                                Seu login está pronto
                            </span>
                        </motion.div>
                        <motion.h1
                            style={{ lineHeight: 0.95 }}
                            className="font-medium text-4xl max-[350px]:text-2xl max-[450px]:text-3xl sm:text-5xl tracking-[-2px]"
                            variants={itemVariants}
                        >
                            {contents.mobile.title}
                        </motion.h1>
                        <motion.span className="text-zinc-400 max-[377px]:text-xs max-sm:text-sm" variants={itemVariants}>
                            {contents.mobile.subtitle}
                            {/* OSModel === "desktop" ? contents.desktop.subtitle : */}
                        </motion.span>
                    </div>

                    <div className="grid h-fit gap-2">
                        {/* desktop */}
                        <motion.a
                            href="https://livoapp.com.br"
                            target="_blank"
                            className="hidden sm:grid h-fit gap-3 text-neutral-100 max-sm:mx-auto bg-gradient-to-b  from-neutral-900 to-neutral-950 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] rounded-2xl border border-neutral-800 border-t-0 p-3"
                            variants={itemVariants}
                            whileHover={{
                                scale: 1.03,
                                transition: { duration: 0.2 },
                            }}
                            whileTap={{
                                scale: 0.98,
                                transition: { duration: 0.1 },
                            }}
                            role="button"
                        >
                            <span className="flex justify-between w-full">
                                <GlobeSimple size={17} className="text-neutral-400" />
                                <ArrowRight size={14} weight="bold" className="relative -rotate-45 text-neutral-400" />
                            </span>
                            <p className="font-medium text-[15px]">
                                <span className="text-sm">Saiba mais</span> <br /> Pelo nosso site
                            </p>
                        </motion.a>

                        {OSModel !== 'desktop' && <motion.a
                            href={
                                OSModel === "Android"
                                    ? "https://play.google.com/store/apps/details?id=com.livoapp"
                                    : "https://apps.apple.com/us/app/livo-app/id1436232095?l=pt&ls=1"
                            }
                            target="_blank"
                            className="hidden sm:grid h-fit gap-3 text-neutral-100 max-sm:mx-auto bg-gradient-to-b from-[#672F92] to-[#672f92b6] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] rounded-2xl border border-[#1a1a1a] p-3"
                            variants={itemVariants}
                            whileHover={{
                                scale: 1.03,
                                transition: { duration: 0.2 },
                            }}
                            whileTap={{
                                scale: 0.98,
                                transition: { duration: 0.1 },
                            }}
                            role="button"
                        >
                            <span className="flex justify-between w-full">
                                {OSModel === "Android" ? <GooglePlayLogo weight="fill" size={17} /> : <AppleLogo weight="fill" size={17} />}
                                <ArrowRight size={14} weight="bold" className="relative -rotate-45 text-neutral-300" />
                            </span>
                            <p className="font-medium text-[15px]">
                                <span className="text-sm">Baixe pela</span> <br /> {getStore()}
                            </p>
                        </motion.a>}

                        {/* mobile */}

                        {OSModel !== 'desktop' && <motion.a
                            className="flex rounded-xl p-2 py-3 gap-2 items-center justify-center sm:hidden  bg-gradient-to-b from-[#672F92] to-[#672f92b6] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)]"
                            href={
                                OSModel === "Android"
                                    ? "https://play.google.com/store/apps/details?id=com.livoapp"
                                    : "https://apps.apple.com/us/app/livo-app/id1436232095?l=pt&ls=1"
                            }
                            target="_blank"
                            variants={itemVariants}
                            initial={"hidden"}
                            animate={"show"}
                            whileHover={{
                                scale: 1.03,
                                transition: { duration: 0.2 },
                            }}
                            whileTap={{
                                scale: 0.98,
                                transition: { duration: 0.1 },
                            }}
                            role="button"
                        >
                            {OSModel === "Android" ? <GooglePlayLogo weight="fill" size={17} /> : <AppleLogo weight="fill" size={17} />}
                            <p className=" text-sm">Baixe pela {getStore()}</p>
                        </motion.a>}
                        <motion.a
                            className="flex text-white rounded-xl p-2 py-3 gap-2 items-center justify-center sm:hidden bg-gradient-to-b from-neutral-900 to-neutral-950 border border-border/20 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)]"
                            href="https://livoapp.com.br"
                            target="_blank"
                            variants={itemVariants}
                            whileHover={{
                                scale: 1.03,
                                transition: { duration: 0.2 },
                            }}
                            whileTap={{
                                scale: 0.98,
                                transition: { duration: 0.1 },
                            }}
                            role="button"
                        >
                            <GlobeSimple size={17} />
                            <p className=" text-sm">Saiba mais pelo nosso site</p>
                        </motion.a>
                    </div>
                </motion.footer>
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, filter: "brightness(.7) blur(100px)", }}
                        animate={{ opacity: [0, 6, .8] }}
                        transition={{ duration: 0.5 }}
                        className="bg-cover absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 rounded-full blur-3xl"
                    />
                    <motion.div
                        initial={{ opacity: 0, filter: "brightness(.7) blur(100px)", }}
                        animate={{ opacity: [0, 6, .8] }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-cover absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 to-violet-500/10 rounded-full blur-3xl" />
                    {/* <img src={outline_logo} className="absolute w-[300px] top-[10%] -right-1/3 z-20" /> */}
                </div>
            </div>
        </motion.div>
    )
}

