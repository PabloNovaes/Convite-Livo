'use client'

import { BASE_URL } from "@/api.config";
import { formatCPF, formatInput } from "@/utils/formatters";
import { Label } from "@radix-ui/react-label";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { motion } from "framer-motion";

import { FormEvent, useRef, useState } from "react";

import { useInvite } from "@/hooks/invite/use-invite";
import { usePromise } from "@/hooks/use-promise";
import { cn } from "@/lib/utils";
import { radioStyles } from "@/page/visitor-area/login";
import { errorToastDispatcher } from "@/utils/error-toast-dispatcher";
import { useParams } from "next/navigation";
import { Input } from "../../ui/input";
import { SaveButton } from "../../ui/save-button";

type Campo = {
    RESULT: boolean;
    CAMPO: string;
    KEY_CAMPO: string;
    ESSENCIAL: boolean;
    EXIBIR: boolean;
    OBRIGATORIEDADE: boolean;
};

export type Acompanhante = {
    RESULT: boolean;
    DADOS: {
        NOME: string;
        STATUS: string;
    }[]
};

type Campos = {
    RESULT: boolean;
    DADOS: Campo[];
};

export type RequestBodyProps = {
    convite: string
    cpf?: string
    passaporte?: string
    estrangeiro: boolean
}

export interface CompletedInvite {
    RESULT: boolean;
    QRTOKEN: string;
    STATUS: string;
    KEY_STATUS: string;
    TELEFONE_VISITA: string;
    URL: string;
    QRCODE: string;
    ADD_ACOMPANHANTE: boolean;
    ACOMPANHANTES: Acompanhante
    CAMPOS: Campos;
    INFO?: string;
    requestBody?: RequestBodyProps
};

interface RecoverInviteFormProps {
    initTranition: () => void
}

export function RecoverInviteForm({ initTranition }: RecoverInviteFormProps) {
    const { data, updateInviteData } = useInvite()
    const [loading, init] = usePromise()
    const [formData, setFormData] = useState<{
        fieldName?: string,
        foreinger?: boolean,
        value?: string
    }>({
        foreinger: false,
        fieldName: "CPF"
    })
    const params = useParams()

    const token = params?.token as string

    const inputRef = useRef<HTMLInputElement>(null)

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        init(async () => {
            e.preventDefault()

            try {
                const body = JSON.stringify({
                    "request": "get_recuperacao_convite",
                    "convite": token,
                    "estrangeiro": formData.foreinger,
                    ...(formData.fieldName === "CPF" && { "cpf": (formData.value as string).replace(/\D/g, "") }),
                    ...(formData.fieldName === "passaporte" && { "passaporte": (formData.value as string) }),
                })

                const res = await fetch(BASE_URL, {
                    body,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "redirect": "convite",
                        "Authorization": "hash"
                    }
                })

                const resData: CompletedInvite = await res.json()
                if (!resData["RESULT"]) {
                    throw new Error(resData["INFO"])
                }
                initTranition()
                setTimeout(() =>
                    updateInviteData({ ...data, requestBody: JSON.parse(body) as RequestBodyProps, completedInvite: resData })
                    , 400)
            } catch (err) {
                return errorToastDispatcher(err)
            }
        })
    }

    return (
        <motion.div initial={{ scale: .8, opacity: 0, y: 30 }} className="max-w-[450px] px-5 grid gap-2">
            {/* <img src={logo} alt="livo-logo" className="h-42 mx-auto mb-4" /> */}
            <h1 className="sm:text-[40px] sm:leading-[42px] text-[35px] leading-[37px] z-10 -tracking-[1.6px] text-center font-medium text-white">
                Recuperar convite
            </h1>
            <p className="text-sm z-10 text-center text-muted-foreground">
                Parece que este convite já foi preenchido. Se foi você quem o preencheu, preencha o formulário abaixo para poder recupera-lo.
            </p>
            <form id="recover-invite-form" onSubmit={handleSubmit} className="w-full mx-auto">
                {data.CAMPOS.find(field => field.CAMPO === "passaporte")?.EXIBIR &&
                    <RadioGroup
                        defaultValue={String(formData.foreinger)}
                        name="estrangeiro"
                        id="estrangeiro"
                        required
                        onValueChange={(value) => {
                            if (inputRef.current) {
                                inputRef.current.value = ""
                            }
                            setFormData(() => ({ value: "", foreinger: value === "true", fieldName: value === "true" ? "passaporte" : "CPF" }))
                        }}
                        className="flex gap-2"
                    >
                        <RadioGroupItem className={cn(radioStyles, 'text-white')} value="true">
                            Sim
                        </RadioGroupItem>
                        <RadioGroupItem className={cn(radioStyles, 'text-white')} value="false">
                            Não
                        </RadioGroupItem>
                    </RadioGroup>
                }
                <Label className="grid gap-2 text-primary mt-4 mb-3" htmlFor={formData.fieldName}>
                    {`Informe seu ${formData.fieldName}`}
                    <Input ref={inputRef}
                        required
                        className="bg-[#181818] border"
                        pattern={formData.fieldName !== "CPF" ? ".{7,9}" : "^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$"}
                        id={formData.fieldName}
                        name={formData.fieldName}
                        placeholder={formData.fieldName === "CPF" ? "Ex: 123.456.789-00" : "Ex: A12345678"}
                        maxLength={formData.fieldName === "CPF" ? 14 : 9}
                        onChange={(e) => {
                            formatInput(e, formData.fieldName === "CPF" ? formatCPF : (value) => value.toUpperCase())
                            setFormData((prev) => ({ ...prev, value: e.target.value }))
                        }}
                    />
                </Label>
                <SaveButton content="Enviar" state={!loading ? "initial" : "loading"} />
            </form>
        </motion.div>
    )
}
