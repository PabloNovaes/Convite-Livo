'use client'

import { containerVariants } from "@/components/invite/success-page-content";
import { errorMessages, ErrorTypes } from "@/constants/invite";
import { motion, Variants } from "framer-motion";

const itemVariants = {
    hidden: {
        opacity: 0,
        scale: .98,
        y: 40,
    },
    show: {
        scale: 1,
        opacity: 1,
        y: 0,
        transition: {
            stiffness: 300,
            damping: 12,
            mass: 0.8,
            velocity: 10,
        },
    },
} as Variants

export function AccessDenied({ errorMessage }: { errorMessage: ErrorTypes }) {
    return (
        <motion.div variants={containerVariants}
            initial="hidden"
            animate="show" className="flex flex-col items-center justify-center w-full h-full p-8 absolute top-0 gap-2 z-10">
            <div className="grid gap-2">
                <motion.h1 variants={itemVariants} className="presentation text-nowrap z-10 -tracking-[1.6px] text-center font-medium text-white">
                    {errorMessages[errorMessage].title}
                </motion.h1>
                <motion.p variants={itemVariants} className="text-sm z-10 text-center text-muted-foreground max-w-96 mx-auto font-normal">
                    {errorMessages[errorMessage].description}
                </motion.p>
            </div>
        </motion.div>
    )
}