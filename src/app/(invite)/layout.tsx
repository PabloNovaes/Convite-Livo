// app/[id]/layout.tsx
import "@/app/globals.css";
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
