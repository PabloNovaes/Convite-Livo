import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Address } from "@/types/data"
import { CheckCircle } from "@phosphor-icons/react"

interface DataTableProps {
  currentAddress: Address
  addresses: Address[]
  onSelectCurrentAddress: (address: Address) => void
}

export function RecurrentAuthorizations({ currentAddress, addresses, onSelectCurrentAddress }: DataTableProps) {
  return (
    <>
      <Card className={cn("w-full rounded-2xl shadow-lg hidden min-[1100px]:flex col-span-2 h-fit")}>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 font-medium">
            <p className="flex gap-1 items-start">
              {currentAddress ? `Suas autorizações recorrentes` : 'Nenhuma autorização para mostrar'}</p>
          </CardTitle>
          <CardDescription>Visualize e gerencie todas sua autizações como recorrente.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {/* Table */}
          <div className="overflow-x-auto">
            {addresses?.length ? (
              <ul className="space-y-2">
                {addresses?.map((address) => (
                  <li
                    key={address.ID}
                    onClick={() => onSelectCurrentAddress(address)}
                    className="relative flex items-center border rounded-lg bg-[#141414] p-3 cursor-pointer hover:bg-muted transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium pr-4 line-clamp-1">{address.CONDOMINIO}</span>
                      <span className="text-sm text-muted-foreground pr-4">{address.ENDERECO}</span>
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
                    </div>
                    {address.ID === currentAddress?.ID &&
                      <CheckCircle weight="fill" size={20} className="absolute right-2" />
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

        </CardContent>
      </Card>
    </>
  )
}
