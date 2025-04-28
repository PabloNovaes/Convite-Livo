import { DOMAIN } from "@/api.config"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Nenhum convite encontrado",
    description: "Parece que o seu convite está vazio",
    openGraph: {
        title: "Convite vazio",
        description: "Parece que o seu convite está vazio",
        images: [
            {
                url: `${DOMAIN}/og-images/empty-invite.jpg`,
                width: 1200,
                height: 630,
            },
        ],
    },
}

export default function NotFound() {
    return (
        <>Not found</>
    )
}