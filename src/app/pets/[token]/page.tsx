'use client'

import { Pet, RegisterPetForm } from "@/components/invite/features/register-pet-form"
import { Confetti, type ConfettiRef } from "@/components/magicui/confetti"
import { AvatarGroup } from "@/components/ui/avatar-group"
import { useInvite } from "@/hooks/invite/use-invite"
import { cn } from "@/lib/utils"
import { motionVariants } from "@/motion.config"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

export default function Page() {
    const [{ submited, data }, setSubmited] = useState<{
        data: Pet[], submited: boolean
    }>({
        data: [],
        submited: false
    })

    const [dispatchConfetti, setDispatchConfetti] = useState(false)

    const {
        data: { USUARIO },
    } = useInvite()

    const confettiRef = useRef<ConfettiRef>(null)

    useEffect(() => {
        if (submited) setTimeout(() => setDispatchConfetti(true), 800)
    }, [submited])

    return (
        <>
            <section className={cn("min-h-svh w-full z-10 grid place-content-center relative")}>
                {dispatchConfetti && <Confetti ref={confettiRef} className={cn("absolute left-0 top-0 z-0 size-full ")} />}
                <div className={cn("flex flex-col items-center w-full p-14 z-10 px-6")}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        transition={{
                            duration: 0.5,
                            staggerChildren: 0.2,
                        }}
                        layout
                        className="max-w-[450px] flex flex-col items-start gap-5"
                    >
                        <div className="grid gap-2">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.h1
                                    key={String(submited)}
                                    variants={motionVariants}
                                    initial="hidden"
                                    animate="show"
                                    exit="exit"
                                    className={cn(
                                        "text-3xl sm:text-4xl sm:leading-[35px] z-10 -tracking-[1.6px] font-medium text-white",
                                        submited && "text-center",
                                    )}
                                >
                                    {!submited ? (
                                        <>Olá {USUARIO} 👋 Preencha o formulario a baixo para cadastrar o seu bixinho</>
                                    ) : (
                                        <>Pronto {USUARIO}! {data.length > 1 ? "Seus pets foram registrados com sucesso!" : "Seu pet foi registrado com sucesso!"}</>
                                    )}
                                </motion.h1>
                            </AnimatePresence>

                            <AnimatePresence mode="wait" initial={false}>
                                {!submited ? (
                                    <motion.p
                                        variants={motionVariants}
                                        initial="hidden"
                                        animate="show"
                                        exit="exit"
                                        className="text-sm z-10 text-muted-foreground"
                                    >
                                        Certifique-se de estar em um ambiente bem iluminado para uma melhor qualidade da imagem.
                                    </motion.p>
                                ) : (
                                    data.length === 1
                                        ? <motion.div
                                            variants={motionVariants}
                                            initial="hidden"
                                            animate="show"
                                            exit="exit"
                                            className="relative rounded-full cursor-pointer flex w-fit mx-auto ring-[6px] ring-ring/20">
                                            <img
                                                src={data[0].photo ?? ""}
                                                className={cn("rounded-full max-w-[300px] w-full object-cover")}
                                            />
                                        </motion.div>
                                        : <AvatarGroup data={data} />
                                )}
                            </AnimatePresence>
                        </div>

                        <AnimatePresence mode="wait" initial={false}>
                            {!submited && <motion.div
                                key={String(submited)}
                                variants={motionVariants}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                                className="w-full sm:text-[40px] sm:leading-[42px] text-[35px] relative leading-[37px] z-10 -tracking-[1.6px] font-black text-white"
                            >
                                <RegisterPetForm handleSubmit={(data) => setSubmited(data)} />
                            </motion.div>}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </section>
        </>
    )
}

