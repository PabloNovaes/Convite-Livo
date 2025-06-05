import { AnimatePresence, motion } from "framer-motion";
import { HTMLAttributes } from "react";



export function CheckIcon(props: HTMLAttributes<HTMLOrSVGElement>) {
    return (
        <svg
            {...props}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
        >
            <motion.path
                variants={checkIconVariants}
                transition={checkIconTransition}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
            />
        </svg>
    );
}

export function Step({ step, currentStep }: { step: number, currentStep: number }) {
    const status =
        currentStep === step
            ? "active"
            : currentStep < step
                ? "inactive"
                : "complete";

    return (
        <motion.div animate={status} initial={status} className="relative">
            <motion.div
                transition={rippleTransition}
                variants={rippleVariants}
                className="absolute inset-0 rounded-full"
            />

            <motion.div
                variants={backgroundVariants}
                transition={backgroundTransition}
                className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-400 bg-white font-semibold text-slate-500"
            >
                <div className="relative flex items-center justify-center">
                    <AnimatePresence>
                        {status === "complete" ? (
                            <CheckIcon className="h-4 w-4 text-white" />
                        ) : (
                            <motion.span
                                key="step"
                                animate={{ opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                className="absolute font-geist"
                            >
                                {step}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>

    )
}

const backgroundTransition = { duration: 0.2 };
const backgroundVariants = {
    inactive: {
        background: "#27272a92",
        borderColor: "#2e2e31",
        color: "#58585c",
    },
    active: {
        background: "#5c307e40",
        borderColor: "#5C307E",
        color: "#5C307E",
    },
    complete: {
        background: "#5C307E",
        borderColor: "#5C307E",
    },
};

const rippleTransition = {
    duration: 0.6,
    delay: 0.2,
    type: "tween",
    ease: "circOut",
};

const rippleVariants = {
    inactive: {
        background: "var(--blue-200)",
    },
    active: {
        background: "transparent",
        scale: 1,
        transition: {
            duration: 0.3,
            type: "tween",
            ease: "circOut",
        },
    },
    complete: {
        background: "#5c307e79",
        scale: 1.25,
    },
};

const checkIconTransition = {
    ease: "easeOut",
    type: "tween",
    delay: 0.2,
    duration: 0.3,
};
const checkIconVariants = {
    complete: {
        pathLength: [0, 1],
    },
};


