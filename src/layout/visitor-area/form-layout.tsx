import bg from "@/../public/bg-mobile.svg";
import logo from "@/../public/letter-logo.svg";

import { motion } from "motion/react";
import { ReactNode } from "react";

export function FormLayout({ children }: { children: ReactNode }) {
    return (
        <div className='min-h-svh relative flex flex-col justify-stretch lg:grid lg:max-w-none lg:grid-cols-3 lg:px-0'>
            <div className='col-span-2 bg-muted relative h-full flex-col p-10 text-white hidden lg:flex border-r'>
                <div className="absolute z-[1] inset-0" style={{ background: `url(${bg}) center top/cover` }} />
                <div className="absolute z-[2] left-0 bottom-0 h-full w-full bg-gradient-to-t from-background to-[#5c307e]/30"></div>
                <div className='relative z-20 flex items-center text-lg font-medium'>
                    <img src={logo} alt="letter-logo" className="h-5 opacity-55" />
                </div>
                <div className='relative z-20 mt-auto hidden lg:grid'>
                    <blockquote className='space-y-2'>
                        <p className='text-lg max-w-[900px]'>
                            &ldquo;Já nos chamaram de Super App. Até mesmo ganhamos o título de Condotech. Para o íntimos 'Livinho'. Nossa missão é conectar o seu condomínio.&rdquo;
                        </p>
                        <footer className='text-sm'>Livo App</footer>
                    </blockquote>
                </div>
            </div>

            <div className='flex h-full justify-center p-6 relative'>
                {children}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, filter: "brightness(.7) blur(100px)" }}
                        animate={{
                            opacity: [0, 0.6, 0.8],
                            filter: "blur(100px) brightness(1)",  // Exemplo com blur e brightness
                        }}
                        transition={{ duration: 0.5 }}
                        className="bg-cover absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/10 rounded-full blur-3xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, filter: "brightness(.7) blur(100px)" }}
                        animate={{
                            opacity: [0, 0.6, 0.8],
                            filter: "blur(100px) brightness(1)",  // Exemplo com blur e brightness
                        }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-cover absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 to-violet-500/10 rounded-full blur-3xl"
                    />
                    {/* <img src={outline_logo} className="absolute w-[300px] top-[10%] -right-1/3 z-20" /> */}
                </div>
            </div>

        </div>
    )
}