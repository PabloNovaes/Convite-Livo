'use client'

import robot_logo from "@/../public/ico.svg";
import { usePWAInstall } from "@/hooks/visitor-area/use-pwa";

import { cn } from "@/lib/utils";
import { Envelope, InstagramLogo, WhatsappLogo } from "@phosphor-icons/react";
import { Copyright } from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect } from "react";
import { toast } from "sonner";

export function BaseLayout({ children }: { children: ReactNode }) {
    const { isInstalled, isInstallable, install, installing } = usePWAInstall()

    useEffect(() => {
        if (isInstallable && !isInstalled) {
            toast('Que tal agilizar a proxíma vez que precisar vir aqui?', {
                description: 'Você pode adicionar este site à tela inicial para acesso mais rápido.',
                action: {
                    label: "Instalar",
                    onClick: () => install()
                }
            });
        }
    }, [isInstallable, isInstalled, install, installing]);

    return (
        <main className="min-h-svh grid">
            {children}
            <footer
                id="footer"
                className={cn("no-print border-t text-primary relative z-20 bg-[#121212] .hide-in-pwa")}
            >
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3 lg:grid-cols-5 sm:text-left">
                        <div className="space-y-3">
                            <div className="font-regular flex flex-col items-center sm:items-start gap-2">
                                <img
                                    src={robot_logo}
                                    alt="logo"
                                    className="w-fit h-15 relative object-contain"
                                />
                                <h2 className="font-medium text-md">Livo App</h2>
                            </div>
                            <p className="text-sm text-primary/60">Modulos que conectam</p>
                        </div>
                        <div className="space-y-3 flex flex-col">
                            <h2 className="text-sm font-semibold">Contato</h2>
                            <ul className="flex justify-center sm:justify-start space-x-2 text-sm">
                                <li>
                                    <button
                                        className="size-11 grid place-content-center rounded-full border bg-[#181818] border-zinc-700 text-primary/60 hover:bg-[#46c254] hover:text-white transition-all duration-300"
                                    >
                                        <Link
                                            href={`https://api.whatsapp.com/send/?phone=5511940437904&text=Ol%C3%A1%2C+gostaria+de+conhecer+melhor+a+plataforma+Livo&type=phone_number&app_absent=0`}
                                            target="_blank"
                                        >
                                            <WhatsappLogo weight="duotone" size={24} />
                                        </Link>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="size-11 grid place-content-center rounded-full border bg-[#181818] border-zinc-700 text-primary/60 hover:bg-gradient-to-b from-[#833ab4] via-[#fd1d1d]/90 to-[#fcb045] hover:text-white transition-all duration-300"
                                    >
                                        <Link
                                            href="https://www.instagram.com/livoapp/"
                                            target="_blank"
                                        >
                                            <InstagramLogo weight="duotone" size={24} />
                                        </Link>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="size-11 grid place-content-center rounded-full border bg-[#181818] border-zinc-700 text-primary/60 hover:bg-[#e34134] hover:text-white transition-all duration-300"
                                    >
                                        <Link href="mailto:contato@livoapp.com.br" target="_blank">
                                            <Envelope weight="duotone" size={24} />
                                        </Link>
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-3 flex flex-col">
                            <h2 className="text-sm font-semibold">Informações legais</h2>
                            <ul className="space-y-2 text-sm">
                                {/* <li>
                  <Link href="/termos-de-uso" target="_top" className="text-primary/60 hover:text-white transition-colors duration-200">
                    Termos de uso
                  </Link>
                </li> */}
                                <li>
                                    <Link
                                        href="/politica-de-privacidade"
                                        target="_top"
                                        className="text-primary/60 hover:text-white transition-colors duration-200"
                                    >
                                        Politica de privacidade
                                    </Link>
                                </li>
                                <li className="flex justify-center sm:justify-start">
                                    <div className=" rounded-xl px-1 w-28 ">
                                        <img alt="lgpd" src="/assets/LGPD.png" />
                                    </div>
                                </li>
                            </ul>
                        </div>

                    </div>
                    <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-primary/60">
                        <div className="flex items-center gap-2 justify-center sm:justify-start w-full sm:w-auto whitespace-nowrap">
                            <Copyright size={16} />
                            <span>{new Date().getFullYear()} Livo App</span>
                        </div>
                        <div className="flex flex-wrap justify-center sm:justify-end gap-x-4 gap-y-2 text-center w-full sm:w-auto">
                            <span>CNPJ: 40.008.355/0001-41</span>
                            <span className="hidden sm:inline">|</span>
                            <span>LIVO TECNOLOGIA DA INFORMACAO LTDA</span>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    )
}