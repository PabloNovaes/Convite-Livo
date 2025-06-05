import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { springConfig } from "@/components/ui/save-button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Info } from "lucide-react"
import { motion } from "motion/react"

const info = {
    title: 'Sobre o uso dos convites de acesso',
    content: 'Os convites somente poderão ser gerados dentro dos horários permitidos para acesso, basta clicar no botão QRcode para gerar sua chave de acesso.'
}

export function InfoButton() {
    const isDesktop = useMediaQuery("(min-width: 1024px)")

    const Trigger = () =>
        <motion.div
            whileHover={{
                scale: 1.03,
                filter: 'brightness(80%)',
                transition: { duration: 0.2 },
            }}
            whileTap={{
                scale: 0.98,
                filter: 'brightness(80%)',
                transition: { duration: 0.1, delay: 2 },
            }}
            initial={false}
            animate={{ width: 'auto' }}
            transition={springConfig}
            className="rounded-xl flex items-center text-start cursor-pointer p-2.5 bg-[#181818] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] border border-t-0 text-white ">
            <Info size={18} />
        </motion.div>

    if (isDesktop) return (
        <Dialog>
            <DialogTrigger className="">
                <Trigger />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{info.title}</DialogTitle>
                    <DialogDescription>{info.content}</DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )

    return (
        <Drawer direction="top">
            <DrawerTrigger className="">
                <Trigger />
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-center">
                    <DrawerTitle>{info.title}</DrawerTitle>
                    <DrawerDescription>{info.content}</DrawerDescription>
                </DrawerHeader>
            </DrawerContent>
        </Drawer>
    )
}

