'use client'

import { callApi } from "@/api.config";
import { ErrorTypes, REGISTER_USER_FIELDS, ROUTE_KEYS, UPDATE_IMAGE_KEYS } from "@/constants/invite";
import { BaseLayout } from "@/layout/invite/base";
import { InviteFields, InviteProps } from "@/types/invite";
import { useParams, usePathname } from "next/navigation";
import { createContext, ReactNode, useEffect, useState } from "react";


interface InviteContextProps {
    isValid: boolean | null
    data: InviteProps
    errorMessage: ErrorTypes;
    redirect: string | null
    updateInviteData: (data: InviteProps) => void
}

export const InviteContext = createContext<InviteContextProps | undefined>(undefined)

export const InviteProvider = ({ children }: { children: ReactNode }) => {
    const [isValid, setIsValid] = useState<boolean | null>(null)
    const [errorMessage, setErrorMessage] = useState<ErrorTypes>("");
    const [redirect, setRedirect] = useState<string | null>(null);
    const [inviteData, setInviteData] = useState<InviteProps | Record<string, InviteFields[] | boolean | string | number>>({})

    const pathname = usePathname() as string

    const params = useParams()
    const token = params ? (["auto", "pets", "foto"].includes(pathname?.split("/")[1]) ? params.id as string : params.id?.[0]) : ""

    const updateInviteData = (data: InviteProps) => setInviteData(data)

    useEffect(() => {
        const validateInvite = async () => {
            if (!token) {
                setErrorMessage("empty-invite")
                setIsValid(false)
                return
            }

            try {
                await new Promise((res) => setTimeout(() => res(""), 1000))

                const path = window.location.href

                const data = await callApi('POST', {
                    headers: {
                        "redirect": "convite"
                    },
                    body: {
                        "request": "get_convite_abertura",
                        "tipo": 1,
                        "convite": token,
                        ...(path.includes("auto") && {
                            "auto_cadastro": 1,
                        }),
                        ...(path.includes("pets") && {
                            "pet": 1,
                        })
                    }
                });

                if (["Nenhum link convite encontrado!", "Nenhum link auto cadastro encontrado!"].includes(data.INFO)) {
                    setIsValid(false)
                    throw new Error(data["MSG"] || data["INFO"])
                }

                switch (true) {
                    case data.KEY_ROTA === ROUTE_KEYS.RESIDENT_REGISTER_KEY && path.includes("/foto"):
                        setIsValid(false)
                        throw new Error('Foto já atualizada!')

                    case data.KEY_ROTA === ROUTE_KEYS.RESIDENT_REGISTER_KEY && path.includes("/pets"):
                        setIsValid(false)
                        throw new Error('Convite invalido!')

                    case data["STATUS_PET"] && data.KEY_ROTA === ROUTE_KEYS.REGISTER_PET_KEY:
                        setIsValid(true)
                        return setInviteData({
                            CAMPOS: [{
                                "CAMPO": "foto",
                                "ESSENCIAL": true,
                                "EXIBIR": true,
                                "OBRIGATORIEDADE": true,
                                "RESULT": true,
                            }],
                            ROUTE_KEY: data["KEY_STATUS_FOTO"],
                            USUARIO: data["NOME_USUARIO"],
                            PRIVATE_KEY_USUARIO: data["PRIVATE_KEY_USUARIO"],
                            RECUPERAR: false,
                            TIPO_BIOMETRIA: "SUCCESS",
                            PET: true,
                            INVITE_STATUS: false
                        })

                    case data.KEY_ROTA === ROUTE_KEYS.RESIDENT_REGISTER_KEY && !["/foto", "/pets"].includes(path):
                        setIsValid(true)
                        return setInviteData({
                            CAMPOS: REGISTER_USER_FIELDS
                                .map(({ CAMPO }) => ({
                                    "CAMPO": CAMPO.toLowerCase(),
                                    "ESSENCIAL": true,
                                    "EXIBIR": true,
                                    "OBRIGATORIEDADE": true,
                                    "RESULT": true,
                                })),
                            ROUTE_KEY: data.KEY_ROTA,
                            TIPO_BIOMETRIA: "SUCCESS",
                            INVITE_STATUS: data["CADASTRO_COMPLETO"],
                            USUARIO: data["NOME_USUARIO"],
                            FACE: data["FACE"],
                            ...(data["VISITA"] && { VISITA: data["VISITA"] })
                        });

                    case data.KEY_ROTA === ROUTE_KEYS.COMMON_INVITE_KEY && data["RESULT"]:
                        setIsValid(true)
                        return setInviteData({
                            CAMPOS: [
                                ...(data["CAMPOS"]["DADOS"] as InviteFields[])
                                    .filter((field) => field.EXIBIR && field.CAMPO !== "OBSERVAÇÕES")
                                    .map(({ CAMPO, ...rest }) => ({ CAMPO: CAMPO.toLowerCase(), ...rest })),
                                ...[data.RECORRENTE && { CAMPO: "senha", OBRIGATORIEDADE: true }]
                            ],
                            MENSAGEM: {
                                show: (data["CAMPOS"]["DADOS"] as InviteFields[]).find(field => field.CAMPO === "OBSERVAÇÕES")?.EXIBIR,
                                content: data["MENSAGEM"]
                            },
                            USUARIO: data["USUARIO"],
                            RECUPERAR: data["RECUPERAR"],
                            CONDOMINIO: data["CONDOMINIO"],
                            CEP_CONDOMINIO: data["CEP_CONDOMINIO"],
                            DESC_ENDERECO: data["DESC_ENDERECO"],
                            NUMERO_CONDOMINIO: data["NUMERO_CONDOMINIO"],
                            DATA_CONVITE: data["DATA_CONVITE"],
                            TELEFONE_USUARIO: data["TELEFONE_USUARIO"],
                            ADD_ACOMPANHANTE: data["ADD_ACOMPANHANTE"],
                            TIPO_BIOMETRIA: data["TIPO_BIOMETRIA"],
                            ...(data["RECORRENTE"] && { "RECORRENTE": data["RECORRENTE"] }),
                            ...(data["INFO"] && { "INFO": data["INFO"] }),
                            LOGO_CLIENTE: data["LOGO_CLIENTE"],
                            LOGO_PARCEIRO: data["LOGO_PARCEIRO"],
                            ROUTE_KEY: data.KEY_ROTA,
                            LOGIN: data["LOGIN"],
                            CATEGORY: data["STATUS"],
                            ...(data["VISITA"] && { VISITA: data["VISITA"] })
                        });

                    case data.KEY_ROTA === ROUTE_KEYS.UPDATE_IMAGE_KEY && data["KEY_STATUS_FOTO"] === UPDATE_IMAGE_KEYS.AUTH_KEY:
                        setIsValid(true)
                        return setInviteData({
                            CAMPOS: [{
                                "CAMPO": "foto",
                                "ESSENCIAL": true,
                                "EXIBIR": true,
                                "OBRIGATORIEDADE": true,
                                "RESULT": true,
                            }],
                            ROUTE_KEY: data["KEY_STATUS_FOTO"],
                            USUARIO: data["NOME_USUARIO"],
                            PRIVATE_KEY_USUARIO: data["PRIVATE_KEY_USUARIO"],
                            RECUPERAR: false,
                            TIPO_BIOMETRIA: "SUCCESS",
                            INVITE_STATUS: data["STATUS"]
                        });

                    case data.KEY_ROTA === ROUTE_KEYS.SELF_REGISTRATION:
                        setIsValid(true)
                        return setInviteData({
                            CAMPOS: REGISTER_USER_FIELDS
                                .map(({ CAMPO }) => ({
                                    "CAMPO": CAMPO.toLowerCase(),
                                    "ESSENCIAL": true,
                                    "EXIBIR": true,
                                    "OBRIGATORIEDADE": true,
                                    "RESULT": true,
                                })),
                            ROUTE_KEY: data.KEY_ROTA,
                            TIPO_BIOMETRIA: "SUCCESS",
                            INVITE_STATUS: data["CADASTRO_COMPLETO"],
                            KEY_CONDOMINIO: data["KEY_CONDOMINIO"],
                            CONDOMINIO: data["NOME_CONDOMINIO"],
                        });
                    default:
                        setIsValid(false)
                        throw new Error(data["MSG"] || data["INFO"])
                }
            } catch (err) {
                if (err instanceof Error) {
                    setIsValid(false)
                    switch (err.message) {
                        case 'Link já preenchido': return setErrorMessage('completed-invite')
                        case 'Convite Expirado!': return setErrorMessage('expired-invite')
                        case 'Foto já atualizada!': return setErrorMessage('updated-image')
                        case 'Convite cancelado!': return setErrorMessage('canceled-invite')
                        default: return setErrorMessage('invalid-invite')
                    }
                }
            }
        };

        if (!isValid) {
            validateInvite()
        }
    }, [token, isValid])

    return (
        <InviteContext.Provider value={{ isValid, data: inviteData as InviteProps, errorMessage, updateInviteData, redirect }}>
            <BaseLayout>
                {children}
            </BaseLayout>
        </InviteContext.Provider>
    )
}
