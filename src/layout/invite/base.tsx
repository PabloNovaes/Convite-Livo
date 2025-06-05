'use client'

/* eslint-disable react-refresh/only-export-components */
import { Button } from "@/components/ui/button";
import { MotionLogo } from "@/components/ui/logo";
import Meteors from "@/components/ui/meteors";
import { cn } from "@/lib/utils";
import {
  Copyright,
  Envelope,
  InstagramLogo,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { motion, stagger, useAnimate } from "framer-motion";

import { ReactNode, useEffect, useState } from "react";

import { useInvite } from "@/hooks/invite/use-invite";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const initial = { scale: 0.8, opacity: 0, y: 30 }

export const usePresentatioAnimation = () => {
  const [scope, animate] = useAnimate()
  const alreadyAccessed = typeof window !== 'undefined' ? localStorage.getItem("alreadyAccessed") === "true" : "false"
  const staggerMenuItems = stagger(0.08, { startDelay: alreadyAccessed ? 0 : 3.5 })


  useEffect(() => {
    animate(
      "#recover-invite-form, h1, button, a, p, img, div:not(.bg-cover, .success-content, .cover-transition)",
      { opacity: 1, scale: 1, y: 0 },
      {
        duration: 0.85,
        ease: "anticipate",
        delay: staggerMenuItems,
      },
    )
  }, [animate, staggerMenuItems, alreadyAccessed])
  return { scope }
}

export function BaseLayout({ children }: { children: ReactNode }) {
  const { data } = useInvite()

  const [alreadyAccessed, setAlreadyAccessed] = useState("false");
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const { scope } = usePresentatioAnimation();

  useEffect(() => {
    const dispatchAnimation = async () => {
      await new Promise((resolve) =>
        resolve(
          setTimeout(() => {
            localStorage.setItem("alreadyAccessed", "true");
            setAlreadyAccessed("true");
            document.querySelector("body")?.classList.add("overflow-y-auto");
            document.querySelector("#shadow")?.classList.remove("z-20");
            document.querySelector("#shadow")?.classList.add("opacity-0");
          }, 4500)
        )
      );
    };
    if (!alreadyAccessed) {
      dispatchAnimation();
      setTimeout(
        () => navigator.mediaDevices.getUserMedia({ video: true }),
        4300
      );
    } else {
      document.querySelector("body")?.classList.add("overflow-y-auto");
      setTimeout(
        () => document.querySelector("#shadow")?.classList.add("hidden"),
        1000
      );
    }
  }, [alreadyAccessed]);

  return (
    <>
      <motion.div
        id="shadow"
        className={cn(
          "w-full no-print min-h-svh flex items-center z-20 justify-center fixed left-0 top-0 bg-neutral-900/50 overflow-hidden backdrop-blur"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: alreadyAccessed ? 0 : 1 }}
        exit={{ opacity: 0, height: 0 }}
      >
        <MotionLogo className="scale-200" />
      </motion.div>
      <main
        ref={scope}
        className={cn(
          "relative flex flex-col text-background gap-4",
          pathname !== "/termos-de-uso" &&
          pathname !== "/visitante" &&
          pathname !== "/politica-de-privacidade" &&
          "",
          pathname === "/access-denied" ? "sm:custom-height" : "min-h-svh"
        )}
      >
        {!["/politica-de-privacidade"].includes(pathname as string) && (
          <>
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              style={{ background: `url(/bg-mobile.svg) center top/cover no-repeat` }}
              className="z-[1] w-full no-print absolute h-[74vh] sm:h-[90vh]  left-0 top-0"
            ></motion.div>
            <div className="no-print absolute h-[75vh] sm:h-[90vh]  w-full top-0 bg-gradient-to-t from-background to-[#5c307e]/20 z-[1]"></div>
            <motion.div className="w-full flex justify-center overflow-x-hidden absolute left-0 top-0 h-screen pt-20 z-10">
              <Meteors number={6} />
            </motion.div>
          </>
        )}
      </main>
      {children}
      <footer
        id="footer"
        className={cn("no-print border-t text-primary bg-[#121212]")}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3 lg:grid-cols-5 sm:text-left">
            <div className="space-y-3">
              <div className="font-regular flex flex-col items-center sm:items-start gap-2">
                <img
                  src="ico.svg"
                  alt="logo"
                  className="w-16 relative sm:-left-1 object-contain"
                />
                <h2 className="font-medium text-md">Livo App</h2>
              </div>
              <p className="text-sm font-normal text-primary/60">Modulos que conectam</p>
            </div>
            <div className="space-y-3 flex flex-col">
              <h2 className="text-sm font-semibold">Contato</h2>
              <ul className="flex justify-center sm:justify-start space-x-2 text-sm">
                <li>
                  <Button
                    variant="outline"
                    asChild
                    className="size-11 [&_svg:not([class*='size-'])]:size-6 rounded-full border bg-[#181818] border-zinc-700 text-primary/60 hover:bg-[#46c254] hover:text-white transition-all duration-300"
                  >
                    <Link
                      href="https://wa.me/5511940437904?text=Olá, gostaria de conhecer melhor a plataforma Livo"
                      target="_blank"
                    >
                      <WhatsappLogo weight="duotone" size={24} />
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button
                    variant="outline"
                    asChild
                    className="size-11 [&_svg:not([class*='size-'])]:size-6 rounded-full border bg-[#181818] border-zinc-700 text-primary/60 hover:bg-gradient-to-b from-[#833ab4] via-[#fd1d1d]/90 to-[#fcb045] hover:text-white transition-all duration-300"
                  >
                    <Link
                      href="https://www.instagram.com/livoapp/"
                      target="_blank"
                    >
                      <InstagramLogo weight="duotone" size={24} />
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button
                    variant="outline"
                    asChild
                    className="size-11 [&_svg:not([class*='size-'])]:size-6 rounded-full border bg-[#181818] border-zinc-700 text-primary/60 hover:bg-[#e34134] hover:text-white transition-all duration-300"
                  >
                    <Link href="mailto:contato@livoapp.com.br" target="_blank">
                      <Envelope weight="duotone" size={24} />
                    </Link>
                  </Button>
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
            <div
              className={cn(
                "hidden gap-4 sm:col-span-2 justify-center sm:justify-start mx-auto sm:mx-0 border rounded-2xl bg-[#ccc] h-fit w-fit p-5 py-2 items-center",
                (data?.LOGO_CLIENTE || data?.LOGO_PARCEIRO) && "flex"
              )}
            >
              {data?.LOGO_PARCEIRO && data?.LOGO_CLIENTE ? (
                <div className="flex gap-4 items-center py-3">
                  <div className="min-w-22 max-w-32 overflow-auto">
                    <img
                      className="rounded-[4px]"
                      src={data?.LOGO_PARCEIRO}
                      alt="LOGO"
                    />
                  </div>
                  <div className="w-px min-h-8 bg-border/40"></div>
                  <div className="min-w-22 max-w-32 overflow-auto">
                    <img
                      className="rounded-[4px]"
                      src={data?.LOGO_CLIENTE}
                      alt="LOGO"
                    />
                  </div>
                </div>
              ) : (
                <div className="min-w-22 max-w-36 overflow-auto p-2 h-fit rounded-md">
                  <img
                    className="rounded-[4px]"
                    src={data?.LOGO_CLIENTE || data?.LOGO_PARCEIRO}
                    alt="LOGO"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-primary/60">
            <div className="flex items-center gap-2 justify-center sm:justify-start w-full sm:w-auto whitespace-nowrap">
              <Copyright size={16} />
              <span>{currentYear} Livo App</span>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-x-4 gap-y-2 text-center w-full sm:w-auto">
              <span>CNPJ: 40.008.355/0001-41</span>
              <span className="hidden sm:inline">|</span>
              <span>LIVO TECNOLOGIA DA INFORMACAO LTDA</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
