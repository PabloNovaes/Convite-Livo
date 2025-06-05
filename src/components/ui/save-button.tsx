import { cn } from "@/lib/utils"
import { Warning } from "@phosphor-icons/react"
import { Check, Loader } from "lucide-react"
import { AnimatePresence, HTMLMotionProps, motion } from "motion/react"
import { ReactNode, useEffect, useState } from "react"

export type SaveState = "initial" | "loading" | "success" | "error"

interface SaveButtonProps extends HTMLMotionProps<"button"> {
    onReset?: () => void
    onSave?: (newState: SaveState) => void
    state?: SaveState
    content: string
    successContent?: string
    loadingContent?: string
    Icon?: ReactNode
}

// eslint-disable-next-line react-refresh/only-export-components
export const springConfig = {
    type: "spring",
    stiffness: 500,
    damping: 50,
    mass: 2,
}

export function SaveButton({ state = "initial", onSave, onReset, className, content, successContent, loadingContent, Icon, ...props }: SaveButtonProps) {
    const [currentState, setCurrentState] = useState(state)

    useEffect(() => {
        setCurrentState(state)

        if (["success", "error"].includes(state)) {
            const timer = setTimeout(() => {
                setCurrentState("initial")
                onReset?.()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [state])

    const handleClick = () => {
        if (currentState === "initial") {
            onSave?.(currentState)
        }
    }

    return (
        <motion.button
            type="submit"
            onClick={handleClick}
            className={cn(
                "disabled:cursor-not-allowed disabled:brightness-75 h-11 flex w-full cursor-pointer rounded-xl p-2 py-3 gap-2 items-center justify-center bg-gradient-to-b from-[#672F92] to-[#411e5c] backdrop-blur-3xl shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)]",
                className,
            )}
            whileHover={{
                scale: 1.03,
                transition: { duration: 0.2 },
            }}
            whileTap={{
                scale: 0.98,
                transition: { duration: 0.1 },
            }}
            aria-live="polite"
            aria-atomic="true"
            disabled={state === "loading"}
            {...props}
        >
            <motion.div
                className="flex items-center h-full px-3"
                initial={false}
                animate={{ width: "auto" }}
                transition={springConfig}
            >
                <div className="flex items-center justify-between h-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentState}
                            className="flex items-center gap-2"
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {currentState === "loading" && (
                                <span className="flex items-center justify-center gap-1 text-sm">
                                    <Loader className="w-[15px] h-[15px] animate-spin text-white" />
                                    {loadingContent}
                                </span>
                            )}
                            {currentState === "success" && (
                                <>
                                    <div className="p-0.5 bg-white/25 rounded-[99px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.16)] border border-white/25 justify-center items-center gap-1.5 flex overflow-hidden">
                                        <Check className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-sm text-white">{successContent}</span>
                                </>
                            )}
                            {currentState === "initial" && (
                                <>
                                    <div className="text-white text-[14px] font-normal leading-tight whitespace-nowrap flex items-center gap-2">
                                        {content} {Icon && Icon}
                                    </div>
                                </>
                            )}
                            {currentState === "error" && (
                                <>
                                    <Warning weight="fill" className="w-4.5 h-4.5 text-white" />
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.button>
    )
}

