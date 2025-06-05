import { cn } from "@/lib/utils"
import { ArrowLeft } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { useParams, usePathname } from "next/navigation"
import { useRouter } from "next/router"

export function Backpage({ className }: { className?: string }) {
    const nav = useRouter()
    const pathname = usePathname() ?? ""
    const params = useParams()


    return (
        <motion.button
            initial={{ opacity: 0 }}
            animate={{
                opacity: 1, transition: {
                    duration: 0.25,
                    ease: "anticipate",
                }
            }}
            onClick={() => nav.back()}
            className={cn("bg-[#181818] border grid place-content-center p-2 size-9 text-white rounded-lg hover:brightness-75 active:scale-95 duration-300 absolute z-10 left-0 top-0 m-4",
                [`/${params?.token}`, "/acompanhante/", "/convite-vazio"].includes(pathname) && "hidden",
                className
            )}>
            <ArrowLeft weight="bold" size={15} />
        </motion.button>
    )
}