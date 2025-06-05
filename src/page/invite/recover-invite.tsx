"use client"

import { DocumentViewer } from "@/components/invite/document-viewer";
import { AddGuestButton } from "@/components/invite/features/add-guests-button";
import { FaceIdViewer } from "@/components/invite/features/face-id-viewer";
import { QrcodeViewer } from "@/components/invite/features/qrcode-viewer";
import { RecoverInviteForm } from "@/components/invite/features/recover-invite-form";
import { Backpage } from "@/components/ui/back-page";
import { useInvite } from "@/hooks/invite/use-invite";
import { usePresentatioAnimation } from "@/layout/invite/base";
import { cn } from "@/lib/utils";
import { InviteProps } from "@/types/invite";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";


export function RecoverInvite() {
    const [showCover, setShowCover] = useState(false)

    const { data } = useInvite()
    const { scope } = usePresentatioAnimation()

    const { TIPO_BIOMETRIA, INFO, ADD_ACOMPANHANTE } = data as InviteProps;

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
        }, 900);
    }

    return (
        <>
            <section ref={scope} className={cn("min-h-svh relative w-full z-10")}>
                <AnimatePresence mode="wait">
                    {
                        showCover &&
                        <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1, transformOrigin: "bottom" }}
                            exit={{ scaleY: 0, transformOrigin: "top" }}
                            transition={{
                                type: "tween",
                                ease: "easeInOut", duration: .4
                            }}
                            className="cover-transition z-[100] bottom-0 bg-neutral-950 absolute left-0 w-full h-full" />
                    }
                </AnimatePresence>
                <header className="absolute left-0 top-0 py-4 flex justify-center z-1 w-full">
                    {data.completedInvite && INFO !== "Convite não permite mais entrada!" && ADD_ACOMPANHANTE && <AddGuestButton />}
                </header>
                <div className={cn("flex flex-col justify-center items-center w-full h-full p-14 px-4 absolute top-0")}>
                    {!data.completedInvite && <Backpage />}
                    {
                        data.completedInvite
                            ? renderIdContent()
                            : (<RecoverInviteForm initTranition={initTransition} />)
                    }
                </div>
            </section>
        </>
    )
}