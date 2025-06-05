import { Badge } from "@/components/ui/badge"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { Address } from "@/types/data"
import { CheckCircle } from "@phosphor-icons/react"
import { ChevronsUpDown, Search } from "lucide-react"
import { useState } from "react"

interface Props {
    currentAddress: Address | null
    addresses: Address[] | null
    onSelect: (address: Address) => void
    className?: string
    useOnHistoric?: boolean
}

const triggerStyle = `flex items-center justify-between w-full gap-2 py-2 px-4 rounded-lg h-fit text-white bg-[#181818] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] cursor-pointer focus-visible:brightness-75 hover:brightness-75 transition-all border border-t-0`

export function AddressSelector({ addresses, currentAddress, onSelect, className, useOnHistoric }: Props) {
    const [open, setOpen] = useState(false)

    const [searchTerm, setSearchTerm] = useState("")

    const lowercasedSearch = searchTerm.toLowerCase()
    const filtered = addresses?.filter(
        (address) =>
            address.CONDOMINIO.toLowerCase().includes(lowercasedSearch) ||
            !useOnHistoric && address.ENDERECO.toLowerCase().includes(lowercasedSearch),
    ) ?? []

    const isDesktop = useMediaQuery("(min-width: 600px)")

    const handleSelect = (address: Address) => {
        if (onSelect) {
            onSelect(address)
        }
        setOpen(false)
    }

    const Trigger = () => (
        <>
            <div className="text-start">
                <p className="text-xs line-clamp-1">{currentAddress?.CONDOMINIO ?? 'Nenhum condomínio encontrado'} </p>
                {!useOnHistoric && <p className="text-xs text-white/50 line-clamp-1">{currentAddress?.ENDERECO ?? 'Entre em contato com seu anfitrião'}</p>}
            </div>
            <ChevronsUpDown size={14} />
        </>
    )



    if (isDesktop) return (
        <DropdownMenu open={open} onOpenChange={() => setOpen(prev => !prev)}>
            <DropdownMenuTrigger disabled={addresses === null} className={cn(triggerStyle, className)}>
                <Trigger />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-full rounded-xl h-full overflow-hidden shadow-md">
                <DropdownMenuGroup className="p-1 space-y-2 max-h-[450px] overflow-auto h-fit min-w-[250px]">
                    <div>
                        {/* Search input */}
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                name="query"
                                placeholder="Buscar condomínio..."
                                className="h-10 rounded-lg bg-[#141414] font-light text-sm indent-[20px]"
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                }}
                                value={searchTerm}
                            />
                        </div>

                        {/* List of condominiums */}
                        <div className="overflow-hidden pr-1">
                            {filtered.length > 0 ? (
                                <ul className="space-y-2">
                                    {filtered.map((address) => (
                                        <li
                                            key={address.ID}
                                            onClick={() => handleSelect(address)}
                                            className="relative flex items-center border rounded-lg bg-[#141414] p-3 cursor-pointer hover:bg-muted transition-colors"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium pr-4">{address.CONDOMINIO}</span>
                                                <span className="text-sm text-muted-foreground pr-4">{address.ENDERECO}</span>
                                                {!useOnHistoric &&
                                                    <>
                                                        <div className="mt-1.5">
                                                            <p className="text-xs">
                                                                Tipo de visita: <Badge className="ml-1" variant={address.RECORRENTE ? 'ENTROU' : 'INFO'}>
                                                                    {address.RECORRENTE ? 'Recorrente' : 'Temporario'}
                                                                </Badge>
                                                            </p>
                                                        </div>
                                                        <div className="mt-1.5">
                                                            <p className="text-xs">
                                                                Status de acesso: <Badge className="ml-1" variant={address.RESULT ? 'AUTORIZADO' : 'SAIU'}>
                                                                    {address.RESULT ? 'Ativo' : ' Expirado'}
                                                                </Badge>
                                                            </p>
                                                        </div>
                                                    </>
                                                }
                                            </div>
                                            {
                                                (!useOnHistoric
                                                    ? address.ID === currentAddress?.ID
                                                    : address.CONDOMINIO === currentAddress?.CONDOMINIO
                                                ) && (
                                                    <CheckCircle weight="fill" size={20} className="absolute right-2" />
                                                )
                                            }

                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center text-xs text-muted-foreground">
                                    <p>Nenhum condomínio encontrado</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )

    return (
        <Drawer open={open} onOpenChange={() => setOpen(!open)}>
            <DrawerTrigger disabled={addresses === null} className={cn(triggerStyle, className)}>
                <Trigger />
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh] p-3 pt-0">
                <DrawerHeader className="text-center">
                    <DrawerTitle>Selecionar Condomínio</DrawerTitle>
                    <DrawerDescription>Escolha um condomínio para visualizar permissões e histórico de acesso.</DrawerDescription>
                </DrawerHeader>
                <div className="overflow-auto">
                    <div>
                        {/* Search input */}
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                name="query"
                                placeholder="Buscar condomínio..."
                                className="h-10 rounded-lg bg-[#141414] font-light text-sm indent-[20px]"
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                }}
                                value={searchTerm}
                            />
                        </div>

                        {/* List of condominiums */}
                        <div className="overflow-hidden pr-1">
                            {filtered.length > 0 ? (
                                <ul className="space-y-2">
                                    {filtered.map((address) => (
                                        <li
                                            key={address.ID}
                                            onClick={() => handleSelect(address)}
                                            className="relative flex items-center border rounded-lg bg-[#141414] p-3 cursor-pointer hover:bg-muted transition-colors"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium pr-4">{address.CONDOMINIO}</span>
                                                <span className="text-sm text-muted-foreground pr-4">{address.ENDERECO}</span>
                                                {!useOnHistoric &&
                                                    <>
                                                        <div className="mt-1.5">
                                                            <p className="text-xs">
                                                                Tipo de visita: <Badge className="ml-1" variant={address.RECORRENTE ? 'ENTROU' : 'INFO'}>
                                                                    {address.RECORRENTE ? 'Recorrente' : 'Temporario'}
                                                                </Badge>
                                                            </p>
                                                        </div>
                                                        <div className="mt-1.5">
                                                            <p className="text-xs">
                                                                Status de acesso: <Badge className="ml-1" variant={address.RESULT ? 'AUTORIZADO' : 'SAIU'}>
                                                                    {address.RESULT ? 'Ativo' : ' Expirado'}
                                                                </Badge>
                                                            </p>
                                                        </div>
                                                    </>
                                                }
                                            </div>
                                            {
                                                (!useOnHistoric
                                                    ? address.ID === currentAddress?.ID
                                                    : address.CONDOMINIO === currentAddress?.CONDOMINIO
                                                ) && (
                                                    <CheckCircle weight="fill" size={20} className="absolute right-2" />
                                                )
                                            }
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center text-xs text-muted-foreground">
                                    <p>Nenhum condomínio encontrado</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}