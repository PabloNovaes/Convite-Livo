import { ExternalToast, toast } from "sonner"

export const errorToastDispatcher = (err: unknown, props?: ExternalToast) => {
    if (err instanceof Error) {
        toast.error("Ocorreu um erro inesperado!", {
            description: err.message || "Erro desconhecido, entre em contato com o morador ou a administração para reportar esse erro.",
            dismissible: true,
            duration: 6000,
            ...props
        })
        console.error(err)
    }
} 