'use client'

import { ArrowCounterClockwise, Camera, X } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { forwardRef, useEffect, useRef, useState } from 'react';
import CameraComponent from "react-html5-camera-photo";
import 'react-html5-camera-photo/build/css/index.css';

import { toast } from "sonner";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerTitle, DrawerTrigger } from "../../ui/drawer";
import { HabilitCameraTutorial } from "./habilit-camera-tutorial";

interface Props {
    handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onImageCapture?: (url: string) => void
    defaultUrl: string;
    required?: boolean
    pet?: boolean
    error?: string
    resetImg?: boolean
    mode?: "user" | "environment"
}

export const ImageCapture = forwardRef<HTMLInputElement, Props>(({ onImageCapture, pet, error = "", defaultUrl, required, resetImg, mode = "user" }, ref) => {
    const [imageUrl, setImageUrl] = useState<string>(defaultUrl ?? '');
    const [containError, setContainError] = useState(false);
    const [open, setOpen] = useState(false);
    const [openTutorial, setOpenTutorial] = useState(false);

    const closeDrawerRef = useRef<HTMLButtonElement>(null);
    const openDrawerRef = useRef<HTMLButtonElement>(null);
    const imageCaptureRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const current = imageCaptureRef.current
        if (current && required) {
            current.setCustomValidity(pet ? error : "Você precisa enviar uma foto sua!")
        }

        if (resetImg) {
            setImageUrl('')
        }
    }, [imageUrl, required, pet, error, resetImg])

    const dispatchCameraErrorMessage = async () => {
        toast.error("Aceite a permissão de uso da câmera", {
            description: "Você precisa conceder accesso à câmera do seu dispositivo para poder tirar a foto",
            action: {
                label: "Ver como",
                onClick: () => {
                    setOpenTutorial(true)
                },
            },
            position: "bottom-center",
            duration: 10000
        });
    };

    const handleOpenChange = async (isOpen: boolean) => {
        try {
            const query = await navigator.permissions.query({ name: "camera" as PermissionName })

            if (query.state === "prompt") {
                const result = await navigator.mediaDevices.getUserMedia({ video: true });
                return result?.active && setOpen(true)
            }

            if (query.state === "denied") return dispatchCameraErrorMessage()

            return setOpen(isOpen)
        } catch (err) {
            if (err instanceof Error && err.message === "Permission denied") {
                dispatchCameraErrorMessage()
            }
        }
    }

    return (
        <>
            <Drawer open={open} onOpenChange={handleOpenChange}>
                <DrawerClose ref={closeDrawerRef} />
                {imageUrl === "" && (
                    <DrawerTrigger ref={openDrawerRef} className="w-full h-12 cursor-pointer font-normal rounded-xl bg-gradient-to-b from-neutral-900 to-neutral-950 border-border/20 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] border border-t-0 text-white flex items-center justify-center gap-2 ">
                        <Camera weight="fill" size={20} />
                        Abrir a câmera
                        <input ref={imageCaptureRef} {...!pet && { required }} contentEditable="false" name="foto" id="foto" className="hidden-input opacity-0" />
                    </DrawerTrigger>
                )}
                <DrawerContent className="h-[75%] sm:max-w-[600px] sm:m-auto text-background bg-[#181818] border-none">
                    <DrawerTitle className="text-center pt-4 text-primary">Tirar foto</DrawerTitle>
                    {!containError && (
                        <motion.div
                            initial={{ clipPath: "inset(50% 50% 50% 50% round 50%)" }}
                            animate={{
                                clipPath: "inset(0% 0% 0% 0% round 50%)",
                                transition: {
                                    type: "spring",
                                    bounce: 0,
                                    delay: .5,
                                    duration: 0.5,
                                }
                            }}
                            id="imageCapture"
                            className="overflow-hidden max-w-[350px] m-auto relative flex items-center justify-center">
                            <button
                                type="button"
                                className="rounded-full bg-zinc-50 opacity-50 backdrop-blur-md p-2 grid place-content-center absolute left-3 top-3 z-10">
                                <X />
                            </button>
                            <CameraComponent
                                idealResolution={{ width: 500, height: 500 }}
                                idealFacingMode={mode as "user" || "environment"}
                                onTakePhoto={(image: string) => {
                                    setTimeout(() => {
                                        if (closeDrawerRef.current) {
                                            closeDrawerRef.current.click()
                                        }
                                    }, 600)
                                    setImageUrl(image);
                                    if (onImageCapture) {
                                        onImageCapture(image)
                                    }
                                }}
                                onCameraError={() => {
                                    dispatchCameraErrorMessage()
                                    setContainError(true)
                                }}
                                imageType="jpg"
                            />
                            <img className="absolute scale-[1.25] opacity-50" src="/assets/head.svg" alt="" />
                        </motion.div>
                    )}
                    <DrawerFooter className="text-center mt-0">
                        <DrawerDescription className="max-w-[95%] sm:max-w-[80%] mx-auto">{"Evite expressões faciais, fique em um local bem iluminado e remova acessórios (como máscara, óculos, etc)."}</DrawerDescription>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
            {imageUrl && (
                <motion.div
                    // initial={{ opacity: 0 }}
                    // transition={{ delay: 1 }}
                    // animate={{ opacity: 1 }}
                    className="overflow-hidden w-full bg-[#181818]/50 border m-auto rounded-3xl flex justify-center relative"
                >
                    <img src={imageUrl} className="max-h-[250px] aspect-auto" alt="Captured" />
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="p-2 bottom-3 rounded-full absolute bg-white border border-input/40 active:brightness-90 active:scale-90 transition-all duration-500 text-black/80">
                        <ArrowCounterClockwise />
                    </button>
                </motion.div>
            )}
            <HabilitCameraTutorial isOpen={openTutorial} changeOpen={setOpenTutorial} />
        </>
    );
});

