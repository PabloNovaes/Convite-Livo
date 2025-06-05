
export function PdfTemplate({ qrcode, RECUPERAR }: { qrcode: string, RECUPERAR: boolean }) {
    return (
        <div className="grid bg-black place-content-center justify-items-center gap-6 p-2 relative pdf">
            <div className="relative p-2">
                <div className="border-white rounded-3xl rounded-es-none rounded-e-none absolute top-0 left-0 size-16 border-[4px] border-r-0 border-b-0"></div>
                <div className="border-white rounded-3xl rounded-ee-none rounded-ss-none absolute bottom-0 left-0 size-16 border-[4px] border-r-0 border-t-0"></div>
                <div className="border-white rounded-3xl rounded-ss-none rounded-ee-none absolute top-0 right-0 size-16 border-[4px] border-l-0 border-b-0"></div>
                <div className="border-white rounded-3xl rounded-es-none rounded-se-none absolute bottom-0 right-0 size-16 border-[4px] border-l-0 border-t-0"></div>
                <img src={qrcode} alt="qrocode" className="max-w-[350px] m-2 rounded-xl border border-zinc-300 shadow-xl" />
            </div>
            <div className="grid gap-2 ">
                <h1 className="text-[30px] text-center leading-[32px] z-10 font-black text-white">
                    {!RECUPERAR ? "QR code de acesso" : "QR code recuperado"}
                </h1>
                <p className="text-sm z-10 text-center max-w-[360px] mx-auto text-muted-foreground">
                    Use este QR code para acessar o condomínio da pessoa que enviou o link.
                </p>
            </div>
        </div>
    )
}