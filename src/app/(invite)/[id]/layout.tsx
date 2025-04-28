// app/[id]/layout.tsx
import { callApi, DOMAIN } from "@/api.config";
import "@/app/globals.css";
import { ROUTE_KEYS } from "@/constants/invite";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { use } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const data = {
      ...await callApi('POST', {
        headers: {
          redirect: "convite",
        },
        body: {
          request: "get_convite_abertura",
          tipo: 1,
          convite: id ?? '',
        },
      })
    }
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
        url = `${BASE_PATH}/register-resident.jpg`
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

    if (!id) {
      title += "Convite vazio";
      description = "Parece que o seu convite está vazio";
      url = `${BASE_PATH}/empty-invite.jpg`
    }

    return {
      title,
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
    console.error('Erro ao gerar metadata:', error);
    return {
      title: "Erro no convite",
      description: "Não foi possível carregar o convite.",
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
  const { id } = use(params);

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {id}
        {children}
      </body>
    </html>
  );
}
