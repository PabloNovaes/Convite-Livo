import { Badge, CustomVariants } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Address, AddressFilterOptions, AllHistoric } from "@/types/data"
import cuid from "cuid"
import { AlertCircle, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { useState } from "react"
import { AccessDetails } from "./access-details"
import { AddressSelector } from "./address-selector"


export function AllHistoricTable({ data, filterOptions, onReloadData }: { onReloadData: () => void, data: AllHistoric[], filterOptions: AddressFilterOptions[] }) {
    const [currentAddress, setCurrentAddress] = useState(filterOptions[0])
    const [currentPage, setCurrentPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [openAccessDetails, setOpenAccessDetails] = useState(false)

    const [current, setCurrent] = useState<AllHistoric | null>(null)

    const itemsPerPage = 5

    const filteredData = data.filter((item) => {
        const matchesSearch =
            String(item.ENDERECO).toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "all" || String(item.INFO_ACESSO).toLowerCase() === statusFilter.toLowerCase()
        const matchesAddress = item.CONDOMINIO === currentAddress.CONDOMINIO

        return matchesSearch && matchesStatus && matchesAddress
    })

    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

    const highlightMatch = (text: string, query: string) => {
        if (!query.trim()) return text

        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
        const parts = text.split(regex)

        return parts.map((part, index) =>
            regex.test(part) ? (
                <span key={index} className="bg-violet-300/80 font-medium text-white">
                    {part}
                </span>
            ) : (
                <span key={index}>{part}</span>
            ),
        )
    }
    const handleOpenChange = () => setOpenAccessDetails((prev) => !prev)

    return (
        <>
            <Card className={cn("w-full rounded-2xl shadow-lg sm:flex col-span-2 h-fit")}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <p className="flex gap-1 items-start font-medium">
                            {data.length
                                ? "Seus registros de acesso em todos os condomínios que você já visitou"
                                : "Nenhum registro encontrado"
                            }
                        </p>
                    </CardTitle>
                    <CardDescription>
                        Acompanhe seus registros. Clique em um registro para visualizar mais detalhes.
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col">
                    <div className="sm:flex sm:flex-row gap-2 mb-3 items-center grid grid-rows-2 grid-cols-3">
                        <div className="relative flex-1 flex items-center max-sm:col-span-2">
                            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground placeholder:truncate" />
                            <Input
                                placeholder="Buscar por endereço"
                                className="h-10.5 rounded-xl bg-[#141414] font-light text-sm indent-[20px]"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1)
                                }}
                            />
                        </div>

                        <Select
                            value={statusFilter}
                            onValueChange={(value) => {
                                setStatusFilter(value)
                                setCurrentPage(1)
                            }}
                        >
                            <SelectTrigger className="text-[13px] sm:w-fit h-[42px] rounded-xl max-sm:col-span-1 bg-[#141414]  shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] border-input border-t-0">
                                <SelectValue placeholder="Filtrar por status" className="font-light" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#181818]">
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="SAIU">Saiu</SelectItem>
                                <SelectItem value="ENTROU">Entrou</SelectItem>
                            </SelectContent>
                        </Select>
                        <AddressSelector
                            currentAddress={currentAddress as unknown as Address}
                            addresses={filterOptions as unknown as Address[]}
                            onSelect={({ CONDOMINIO, KEY_CONDOMINIO }) => {
                                setCurrentAddress({ CONDOMINIO, KEY_CONDOMINIO })
                                onReloadData()
                            }}
                            className="rounded-xl sm:w-fit max-sm:col-span-3 bg-[#141414] h-[42px]"
                            useOnHistoric
                        />
                    </div>

                    {/* Table */}
                    <div className="rounded-md border overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table className="bg-[#141414] rounded-xl">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="cursor-pointer text-left" >
                                            Endereço
                                        </TableHead>
                                        <TableHead className="hidden min-[365px]:table-cell">Quando</TableHead>
                                        <TableHead className="cursor-pointer hidden min-[320px]:table-cell" >
                                            <div className="flex items-center">
                                                Status
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.length > 0 ? (
                                        paginatedData
                                            .map(({ ENDERECO, DATA_ACESSO, INFO_ACESSO, ...rest }) => (
                                                <TableRow onClick={() => {
                                                    setCurrent({ ...rest, ENDERECO, DATA_ACESSO, INFO_ACESSO })
                                                    setOpenAccessDetails(true)
                                                }} key={cuid()}>
                                                    <TableCell className="max-[450px]:text-xs max-w-0 truncate text-muted-foreground text-xs">
                                                        {highlightMatch(ENDERECO as string, searchTerm)}
                                                    </TableCell>
                                                    <TableCell className="text-xs hidden min-[365px]:table-cell">
                                                        {DATA_ACESSO}
                                                    </TableCell>
                                                    <TableCell className="text-xs min-[365px]:hidden">
                                                        {DATA_ACESSO.split(" ")[0]}
                                                    </TableCell>
                                                    <TableCell className="hidden min-[320px]:table-cell">
                                                        <Badge className="text-[10px] min-[380px]:text-xs" variant={INFO_ACESSO as CustomVariants}>{INFO_ACESSO}</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                    <AlertCircle className="h-8 w-8 mb-2" />
                                                    <p className="max-[350px]:text-sm">Nenhum registro encontrado</p>
                                                    <p className="text-sm">Tente ajustar os filtros de busca</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        {filteredData.length ? (
                            <>
                                <p className="text-xs text-muted-foreground">
                                    Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredData.length)} de{" "}
                                    {filteredData.length} registros
                                </p>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </>
                        )
                            : <p className="text-xs text-muted-foreground ">Nenhum resultado</p>
                        }
                    </div>
                </CardContent>
            </Card>

            <AccessDetails dataType="all" open={openAccessDetails} handleOpenChange={handleOpenChange} allHistoricData={current as AllHistoric} />

        </>
    )
}
