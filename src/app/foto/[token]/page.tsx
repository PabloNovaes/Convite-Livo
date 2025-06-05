'use client'

import { BASE_URL } from "@/api.config"
import { ImageCapture } from "@/components/invite/features/image-capture"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Confetti, type ConfettiRef } from "@/components/magicui/confetti"
import { SaveButton, type SaveState, springConfig } from "@/components/ui/save-button"
import { headers, uploadImage } from "@/form.config"
import { useInvite } from "@/hooks/invite/use-invite"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { errorToastDispatcher } from "@/utils/error-toast-dispatcher"
import { AnimatePresence, motion } from "framer-motion"
import { useParams } from "next/navigation"
import { type FormEvent, useEffect, useRef, useState } from "react"

const motionVariants = {
    hidden: { filter: "blur(10px)", opacity: 0 },
    show: {
        filter: "blur(0)",
        opacity: 1,
        transition: {
            ...springConfig,
            delay: 0.2,
        },
    },
    exit: {
        filter: "blur(10px)",
        opacity: 0,
        transition: {
            ...springConfig,
            duration: 0.3,
        },
    },
}

export default function Page() {
    const [loadingState, setloadingState] = useState<SaveState>("initial")
    const [imageUrl, setImagegUrl] = useState("")
    const [savedImage, setSavedImage] = useState(false)
    const [dispatchConfetti, setDispatchConfetti] = useState(false)

    const {
        data: { PRIVATE_KEY_USUARIO, USUARIO },
    } = useInvite()
    const params = useParams()

    const handleImageCapture = (url: string) => setImagegUrl(url)

    const confettiRef = useRef<ConfettiRef>(null)

    const sizeQuery = useMediaQuery("(max-width: 450px)")

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setloadingState("loading")

        try {
            const uploadNewImage = await uploadImage(imageUrl, "login")

            const res = await fetch(`${BASE_URL}/convite`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    request: "set_altera_foto_usuario",
                    usuario: PRIVATE_KEY_USUARIO,
                    convite: params?.token,
                    imagem: uploadNewImage,
                }),
            })

            const data = await res.json()

            if (!data["RESULT"] || data["INFO"]) {
                throw new Error(data["MSG"] || data["INFO"])
            }

            if (data["RESULT"]) {
                setloadingState("success")
                setTimeout(() => setSavedImage(true), 1000)
            }
        } catch (err) {
            errorToastDispatcher(err)
        } finally {
            setTimeout(() => setloadingState("initial"), 1000)
        }
    }

    useEffect(() => {
        if (savedImage) setTimeout(() => setDispatchConfetti(true), 800)
    }, [savedImage])

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
                        className="max-w-[450px] px-5 flex flex-col items-start gap-5"
                    >
                        <div className="grid gap-2">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.h1
                                    key={String(savedImage)}
                                    variants={motionVariants}
                                    initial="hidden"
                                    animate="show"
                                    exit="exit"
                                    className={cn(
                                        "max-[380px]:text-[30px] max-[380px]:leading-[30px] text-[35px] leading-[37px] sm:text-[40px] sm:leading-[42px] z-10 -tracking-[1.6px] font-medium text-white",
                                        savedImage && "text-center",
                                    )}
                                >
                                    {!savedImage ? (
                                        <>Olá {USUARIO} 👋 Vamos atualizar sua foto do aplicativo?</>
                                    ) : (
                                        <>Pronto {USUARIO}! Sua foto foi atualizada com sucesso!</>
                                    )}
                                </motion.h1>
                            </AnimatePresence>

                            <AnimatePresence mode="wait" initial={false}>
                                {!savedImage && (
                                    <motion.p
                                        variants={motionVariants}
                                        initial="hidden"
                                        animate="show"
                                        exit="exit"
                                        className="text-sm z-10 text-muted-foreground"
                                    >
                                        Certifique-se de estar em um ambiente bem iluminado para uma melhor qualidade da imagem.
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        <form id="recover-invite-form" onSubmit={handleSubmit} className="w-full flex flex-col">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={String(savedImage)}
                                    variants={motionVariants}
                                    initial="hidden"
                                    animate="show"
                                    exit="exit"
                                    className="sm:text-[40px] sm:leading-[42px] text-[35px] relative leading-[37px] z-10 -tracking-[1.6px] font-black text-white"
                                >
                                    {!savedImage ? (
                                        <motion.label className="grid gap-2 text-primary" layout>
                                            Tire uma boa foto
                                            <ImageCapture required defaultUrl={imageUrl} onImageCapture={handleImageCapture} />
                                        </motion.label>
                                    ) : (
                                        <motion.div
                                            className="relative overflow-visible"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{
                                                scale: 1,
                                                opacity: 1,
                                                transition: {
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 20,
                                                    delay: 0.3, // Delay to ensure previous elements have exited
                                                },
                                            }}
                                        >
                                            <div className="relative rounded-full max-w-[400px] w-full">
                                                <BorderBeam size={sizeQuery ? 150 : 400} />
                                                <img
                                                    src={imageUrl || "/placeholder.svg"}
                                                    className="p-2 m-auto rounded-full flex justify-center"
                                                    alt="User profile"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            <AnimatePresence mode="wait" initial={false}>
                                {!savedImage && (
                                    <motion.div variants={motionVariants} initial="hidden" animate="show" exit="exit">
                                        <SaveButton
                                            content="Atualizar foto"
                                            onSave={(newState) => setloadingState(newState)}
                                            state={loadingState}
                                            className="mt-2 h-11"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>
                </div>
            </section>
        </>
    )
}

