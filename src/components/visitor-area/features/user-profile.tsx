import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTrigger } from "@/components/ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useMediaQuery } from "@/hooks/use-media-query"
import { usePromise } from "@/hooks/use-promise"
import { useAuth } from "@/hooks/visitor-area/use-auth"
import { cn } from "@/lib/utils"
import { formatUppercase } from "@/utils/formatters"
import { GearSix } from "@phosphor-icons/react"
import c from "js-cookie"
import { Loader, LogOut } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useRouter } from "next/navigation"
import { NestedRoot } from "vaul"

export function UserProfile() {
    const { data, setData } = useAuth()
    const [loading, init] = usePromise()
    const nav = useRouter()

    const logout = async () => {
        init(async () => {
            await new Promise((res) => setTimeout(() => res(''), 1200))
            c.remove("token")
            setData(null)
            nav.push("/visitante")
        })
    }

    const isDesktop = useMediaQuery("(min-width: 600px)")

    const Trigger = () => (
        <Button variant="ghost" className="p-0 hover:bg-transparent h-10">
            <Avatar className="size-10 border-2 border-white/50 hover:border-primary/30 transition-all duration-200">
                <AvatarImage
                    src={data?.IMAGEM || "/placeholder.svg"}
                    alt={data?.NOME || "Avatar do usuário"}
                    className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary">{data?.NOME?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
        </Button>
    )

    if (isDesktop) return (
        <Popover>
            <PopoverTrigger className="h-10">
                <Trigger />
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 rounded-2xl shadow-lg border border-border/40 overflow-hidden">
                <div className={cn("rounded-xl p-3", !isDesktop && 'pt-0')}>
                    <div className="flex items-center gap-3">
                        <Avatar className="size-12 border-2 border-white/20 shadow-sm">
                            <AvatarImage
                                src={data?.IMAGEM || "/placeholder.svg"}
                                alt={data?.NOME || "Avatar do usuário"}
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">{data?.NOME?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="grid leading-tight w-full">
                            <h1 className="text-sm font-semibold text-foreground flex justify-between w-full">
                                {data?.NOME}
                                <Button variant={"secondary"} size={"icon"} className="border cursor-pointer"> <GearSix weight="fill" /></Button>
                            </h1>
                            <h3 className="text-xs text-muted-foreground">{data?.EMAIL || "Bem-vindo à área de visitantes"}</h3>
                        </div>
                    </div>
                </div>
                <div className="p-1">
                    <Button
                        onClick={logout}
                        variant="ghost"
                        className="w-full justify-center text-xs font-normal cursor-pointer p-4 rounded-lg bg-destructive/6 text-destructive/80 hover:bg-destructive/10 hover:text-destructive group"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={String(loading)}
                                className="flex items-center text-center"
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {String(loading) === 'true' && (
                                    <>
                                        <Loader size={14} className="mr-2 animate-spin" />
                                        Saindo...
                                    </>
                                )}
                                {String(loading) === "false" && (
                                    <>
                                        <LogOut size={14} className="mr-2 group-hover:translate-x-1 transition-transform" />
                                        Sair da conta
                                    </>
                                )}

                            </motion.div>
                        </AnimatePresence>


                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )

    return (
        <Drawer>
            <DrawerTrigger className="h-10">
                <Trigger />
            </DrawerTrigger>
            <DrawerContent >
                <DrawerHeader>
                    <div className={cn("rounded-xl p-3", !isDesktop && 'pt-0')}>
                        <div className="flex items-center gap-3">
                            <Avatar className="size-12 border-2 border-white/20 shadow-sm">
                                <AvatarImage
                                    src={data?.IMAGEM || "/placeholder.svg"}
                                    alt={data?.NOME || "Avatar do usuário"}
                                    className="object-cover"
                                />
                                <AvatarFallback className="bg-primary/10 text-primary">{data?.NOME?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="grid leading-tight w-full">
                                <h1 className="text-sm font-semibold text-foreground flex justify-between w-full items-center">
                                    {formatUppercase(data?.NOME)}
                                    <NestedRoot>
                                        <DrawerTrigger>
                                            <Button variant={"secondary"} size={"icon"} className="border cursor-pointer"> <GearSix weight="fill" /></Button>
                                        </DrawerTrigger>
                                        <DrawerContent>
                                            <DrawerHeader className="text-center">
                                                {/* <DrawerTitle>Gerenciar perfil</DrawerTitle> */}
                                                <DrawerDescription>Em breve...</DrawerDescription>
                                            </DrawerHeader>
                                        </DrawerContent>
                                    </NestedRoot>
                                </h1>
                                <h3 className="text-xs text-muted-foreground">{data?.EMAIL || "Bem-vindo à área de visitantes"}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="p-1">
                        <Button
                            onClick={logout}
                            variant="ghost"
                            className="w-full justify-center text-xs font-normal cursor-pointer p-4 py-6 rounded-lg bg-destructive/6 text-destructive/80 hover:bg-destructive/10 hover:text-destructive group"
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={String(loading)}
                                    className="flex items-center text-center"
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {String(loading) === 'true' && (
                                        <>
                                            <Loader size={14} className="mr-2 animate-spin" />
                                            Saindo...
                                        </>
                                    )}
                                    {String(loading) === "false" && (
                                        <>
                                            <LogOut size={14} className="mr-2 group-hover:translate-x-1 transition-transform" />
                                            Sair da conta
                                        </>
                                    )}

                                </motion.div>
                            </AnimatePresence>


                        </Button>
                    </div>
                </DrawerHeader>
            </DrawerContent>
        </Drawer>
    )
}
