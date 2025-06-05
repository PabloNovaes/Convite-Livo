import { Badge, CustomVariants } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"
import { AllHistoric, Historical } from "@/types/data"
import { dateFormater } from "@/utils/formatters"
import { CalendarClock, Home, MapPin, User } from "lucide-react"

export function AccessDetails({
    handleOpenChange,
    open,
    data,
    dataType, allHistoricData
}: { dataType: "all" | "filtered", open: boolean, data?: Historical, allHistoricData?: AllHistoric, handleOpenChange: () => void }) {
    const isDesktop = useMediaQuery("(min-width: 600px)")

    const renderContent = () => {
        switch (dataType) {
            case "filtered": return (
                <div className="space-y-4">
                    <div className="rounded-lg bg-[#141414] items-center border p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Status</span>
                            <Badge variant={data?.DESC_STATUS as CustomVariants}>
                                {data?.DESC_STATUS}
                            </Badge>
                        </div>
                    </div>

                    <div className="rounded-lg bg-[#141414] items-center border p-4">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <h3 className="font-medium text-sm">Anfitrião</h3>
                                <p className="text-sm">{data?.ANFITRIAO}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-[#141414] items-center border p-4">
                        <div className="flex items-center gap-3">
                            <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <h3 className="font-medium text-sm">Condomínio</h3>
                                <p className="text-sm">{data?.NOME_CONDOMINIO}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-[#141414] items-center border p-4">
                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <h3 className="font-medium text-sm">Local</h3>
                                <p className="text-sm">{data?.ENDERECO}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-[#141414] items-center border p-4">
                        <div className="flex items-center gap-3">
                            <CalendarClock className="size-8 text-muted-foreground mt-0.5" />
                            <div>
                                <h3 className="font-medium text-sm">Período de acesso</h3>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div className="flex w-full text-nowrap items-center">
                                        <p className="text-sm">{dateFormater(data?.ADIANTADO ?? '')}</p>
                                        <p className="px-2 text-xs">Até</p>
                                        <p className="text-sm">{dateFormater(data?.ATRASADO ?? '')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
            case "all": return (
                <div className="space-y-4">
                    <div className="rounded-lg bg-[#141414] items-center border p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Status</span>
                            <Badge variant={allHistoricData?.INFO_ACESSO as CustomVariants}>
                                {allHistoricData?.INFO_ACESSO}
                            </Badge>
                        </div>
                    </div>

                    <div className="rounded-lg bg-[#141414] items-center border p-4">
                        <div className="flex items-center gap-3">
                            <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <h3 className="font-medium text-sm">Condomínio</h3>
                                <p className="text-sm">{allHistoricData?.CONDOMINIO}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-[#141414] items-center border p-4">
                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <h3 className="font-medium text-sm">Local</h3>
                                <p className="text-sm">{allHistoricData?.ENDERECO}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-[#141414] items-center border p-4">
                        <div className="flex items-center gap-3">
                            <CalendarClock className="h-5 text-muted-foreground mt-0.5" />
                            <div>
                                <h3 className="font-medium text-sm">Data de acesso</h3>
                                <div className="flex items-center gap-2 mt-1 text-sm">
                                    {allHistoricData?.DATA_ACESSO.replace(" ", " as ")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }

    if (isDesktop)
        return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalhes do acesso</DialogTitle>
                        <DialogDescription>Informações sobre o acesso ao condomínio</DialogDescription>
                    </DialogHeader>
                    {renderContent()}
                </DialogContent>
            </Dialog>
        )

    return (
        <Drawer open={open} onOpenChange={handleOpenChange}>
            <DrawerContent>
                <DrawerHeader className="text-center">
                    <DrawerTitle>Detalhes do acesso</DrawerTitle>
                    <DrawerDescription>Informações sobre o acesso ao condomínio</DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-6">{renderContent()}</div>
            </DrawerContent>
        </Drawer>
    )
}
