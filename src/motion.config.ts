import { Variants } from "motion/react"
import { springConfig } from "./components/ui/save-button"

// This file contains the animation variants for the application
export const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
}

export const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24,
        },
    },
    exit: { opacity: 0, y: 20 },
} as Variants

export const fadeInVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            duration: 0.7,
        },
    },

}


export const motionVariants = {
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
