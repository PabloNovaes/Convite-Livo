// app/[id]/layout.tsx
import { callApi, DOMAIN } from "@/api.config";
import "@/app/globals.css";
import { ROUTE_KEYS } from "@/constants/invite";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const icons = { icon: '/ico.svg' }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  if (!id) {
    return {
      title: "Convite vazio",
      description: "Parece que o seu convite está vazio",
      icons,
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
    };
  }

  try {
    const data = {
      ...await callApi('POST', {
        headers: {
          redirect: "convite",
        },
        body: {
          request: "get_convite_abertura",
          tipo: 1,
          convite: id[0] ?? '',
        },
      })
    }

    if(!data.RESULT) throw new Error(data.INFO ?? data.MSG)
    
    const BASE_PATH = `${DOMAIN}/og-images`

    let title = "Livo App | ";
    let description = "Você foi convidado!";
    let url = ""

    switch (data.KEY_ROTA) {
      case ROUTE_KEYS.COMMON_INVITE_KEY:
        title += data["RECORRENTE"] ? "Convite Recorrente" : "Convite Rápido";
        description = data["RECORRENTE"]
          ? "Você foi convidado para acessar o condomínio de forma recorrente! Complete seu cadastro e tenha entradas liberadas por mais tempo, com toda segurança e praticidade."
          : "Você foi convidado para acessar o condomínio! Complete seu cadastro para garantir seu acesso por um dia, de forma rápida, segura e sem burocracia.";
        url = data["RECORRENTE"]
          ? `${BASE_PATH}/recurrent-invite.jpg`
          : `${BASE_PATH}/invite.jpg`
        break;

      case ROUTE_KEYS.RESIDENT_REGISTER_KEY:
        title += "Finalizar Cadastro";
        description = "Estamos quase lá! Complete seu cadastro e aproveite todos os benefícios do Livo App no seu condomínio.";
        url = `${BASE_PATH}/complete-register.jpg`
        break;

      case ROUTE_KEYS.REGISTER_PET_KEY:
        title += "Cadastro de Pets";
        description = "Seu pet também faz parte da família! Registre seu companheiro e mantenha tudo em dia no condomínio.";
        url = `${BASE_PATH}/register-pet.jpg`
        break;

      case ROUTE_KEYS.UPDATE_IMAGE_KEY:
        title += "Atualizar Foto";
        description = "Deixe seu perfil ainda melhor! Atualize sua foto e personalize sua experiência no Livo App.";
        url = `${BASE_PATH}/update-image.jpg`
        break;
    }

    return {
      title,
      icons,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
    };

  } catch (error) {
    if (error instanceof Error) {
      const BASE_PATH = `${DOMAIN}/og-images`
      let url

      switch (error.message) {
        case 'Convite Expirado!': `${BASE_PATH}/expired-invite.jpg`
        default: `${BASE_PATH}/invalid-invite.jpg`
      }
      return {
        title: "Erro no convite",
        description: "Não foi possível carregar o convite.",
        icons,
        openGraph: {
          title: "Erro no convite",
          description: "Não foi possível carregar o convite.",
          images: [
            {
              url: String(url),
              width: 1200,
              height: 630,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: "Erro no convite",
          description: "Não foi possível carregar o convite.",
          images: [
            {
              url: String(url),
              width: 1200,
              height: 630,
            },
          ],
        },
      };
    }
    return {
      title: "Erro no convite",
      description: "Não foi possível carregar o convite.",
      icons,
      openGraph: {
        title: "Erro no convite",
        description: "Não foi possível carregar o convite.",
        images: ["/error-og-image.jpg"],
      },
      twitter: {
        card: "summary_large_image",
        title: "Erro no convite",
        description: "Não foi possível carregar o convite.",
        images: ["/error-og-image.jpg"],
      },
    };

  }
}


export default function RootLayout({
  children,
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}>) {

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-white`}>
        {children}
      </body>
    </html>
  );
}
