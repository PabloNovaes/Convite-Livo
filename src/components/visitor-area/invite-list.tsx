import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatUppercase } from "@/utils/formatters";
import { Image } from "@phosphor-icons/react";
import { Badge, CustomVariants } from "../ui/badge";

export interface Invite {
    RESULT: boolean;
    CONDOMINIO: string;
    DATA_CONVITE: string;
    ENDERECO: string;
    STATUS: string;
    KEY_STATUS: string;
}

interface InviteListProps {
    invites: Invite[];
}

export function InviteList({ invites }: InviteListProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-lg rounded-2xl w-full h-fit">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-medium flex items-center gap-2">
                        {
                            invites.length
                                ? 'Seus próximos acessos'
                                : 'Não há acessos futuros'
                        }
                    </CardTitle>
                    <CardDescription>
                        {
                            invites.length
                                ? 'Confira abaixo os condomínios que poderá acessar'
                                : 'Nenhum acesso futuro para mostrar'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className={cn("rounded-xl bg-[#121212] overflow-hidden border", !invites.length && "hidden")}>

                        {invites.map(({ KEY_STATUS, CONDOMINIO, DATA_CONVITE, STATUS }, index) => (
                            <div
                                key={KEY_STATUS}
                                className={cn(
                                    "flex items-center gap-3 p-3",
                                    index !== invites.length - 1 && "border-b",
                                )}
                            >
                                <div className="bg-[#181818] rounded-lg min-w-18 h-18 grid place-content-center">
                                    <Image size={50} opacity={.6} />
                                </div>
                                <div className="w-full grid gap-1">
                                    <div className="w-full flex justify-between">
                                        {formatUppercase(CONDOMINIO)}
                                    </div>
                                    <div className="max-sm:flex-col flex items-start sm:items-center gap-2 w-full justify-between">
                                        <Badge variant="outline" className="bg-primary/10 transition-all">{DATA_CONVITE.replace(" ", " as ")}</Badge>
                                        <Badge variant={STATUS.includes("AGUARDANDO") ? "AGUARDANDO" : STATUS as CustomVariants}>
                                            {STATUS}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
