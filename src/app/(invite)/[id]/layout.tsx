// app/[id]/layout.tsx
import { callApi } from "@/api.config";
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



    let title = "Convite";
    let description = "Você foi convidado!";

    switch (data.KEY_ROTA) {
      case ROUTE_KEYS.COMMON_INVITE_KEY:
        title = data["RECORRENTE"] ? "Convite Recorrente" : "Convite Rápido";
        description = data["RECORRENTE"]
          ? "Preencha este convite para realizar seu cadastro temporário no condomínio de forma prática, segura e sem burocracia."
          : "Preencha este convite para realizar seu cadastro condomínio de forma prática, segura e sem burocracia."
        break;
      case ROUTE_KEYS.RESIDENT_REGISTER_KEY:
        title = "Finalizar Cadastro";
        break;
      case ROUTE_KEYS.REGISTER_PET_KEY:
        title = "Cadastro de Pets";
        break;
      case ROUTE_KEYS.UPDATE_IMAGE_KEY:
        title = "Atualizar Foto";
        break;
    }

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: "https://livo-convite.vercel.app/og-images/recorrente.jpg",
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
