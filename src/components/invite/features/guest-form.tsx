'use client'

import { ImageCapture } from "@/components/invite/features/image-capture";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Step } from "@/components/ui/motion-step";
import { PhoneInput } from "@/components/ui/phone-input";
import { ROUTE_KEYS } from "@/constants/invite";
import { useInvite } from "@/hooks/invite/use-invite";
import { usePromise } from "@/hooks/use-promise";
import { cn } from "@/lib/utils";
import { radioStyles } from "@/page/visitor-area/login";
import { errorToastDispatcher } from "@/utils/error-toast-dispatcher";
import { formatBirthDate, formatCPF, formatInput, formatPlate, formatRG, formatUppercase } from "@/utils/formatters";
import { ArrowLeft } from "@phosphor-icons/react";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { AnimatePresence, motion } from 'framer-motion';
import React, { FormEvent, HTMLAttributes, useCallback, useEffect, useState } from 'react';
import { SaveButton } from "../../ui/save-button";
import { DefinePasswordForm } from "./password-input";

interface FormField {
    CAMPO: string
    OBRIGATORIEDADE: boolean
}

type FormData = Record<string, string>

export interface GuestRegistrationFormProps extends HTMLAttributes<HTMLFormElement> {
    onSubmit: () => Promise<void>
    onChangeFormData: (data: FormData) => void
    formData: FormData
}

const fieldsContent: {
    [key: string]: { label: string, placeholder: string, message: string }
} = {
    'rg': { label: 'Informe seu RG', placeholder: 'Ex: 12.3150.678-9', message: "Digite um RG válido" },
    'cpf': { label: 'Informe seu CPF', placeholder: 'Ex: 123.465.789-10', message: "Digite um CPF válido" },
    'cnh': { label: 'Informe a sua CNH', placeholder: 'Ex: 98741877651', message: "Digite uma CNH válida" },
    'passaporte': { label: 'Informe seu passaporte', placeholder: 'Digite seu passaporte', message: "Digite um Passaporte válido" },
    'email': { label: 'Qual o seu email?', placeholder: 'Digite seu email', message: "Digite um Email válido" },
    'phoneNumber': { label: 'Qual o seu telefone?', placeholder: 'Digite seu telefone', message: "Digite um Numero de telefone válido" },
    'placa': { label: 'Informe a placa do seu veículo', placeholder: 'Digite a placa do seu veículo', message: "Digite uma pláca válida" },
    'data_nascimento': { label: 'Digite a sua data de nascimento', placeholder: 'Digite sua data de nascimento', message: "Digite uma Data valida" },
    'profissão': { label: 'Qual a sua profissão?', placeholder: 'Digite a sua profissão', message: "" },
};

export function GuestForm({ onSubmit, onChangeFormData, formData, className, ...props }: GuestRegistrationFormProps) {
    const [currentStep, setCurrentStep] = useState({ currentAction: "next", step: 0 })
    const [loading, init] = usePromise()
    const [isForeigner, setIsForeigner] = useState(false)

    const { data } = useInvite()
    const { CAMPOS, RECORRENTE, VISITA } = data

    useEffect(() => {
        if (VISITA) {
            const [name, lastName] = VISITA.split(" ")
            onChangeFormData({ ...formData, nome: name, sobrenome: lastName })
        }
    }, [])

    const remainingFields = CAMPOS
        .filter(field => !['nome', 'sobrenome', 'foto', 'documento', 'passaporte', 'rg', 'cpf', 'senha'].includes(field.CAMPO))
        .map(field => ({ CAMPO: field.CAMPO, OBRIGATORIEDADE: field.OBRIGATORIEDADE }))

    const steps = [
        {
            title: "Informações Pessoais",
            fields: (() => {
                const desiredOrder = ['nome', 'documento', 'foto', 'cnh', 'senha']
                const availableFields = Array.from(new Set(
                    CAMPOS
                        .filter(field => ['nome', 'cpf', 'rg', 'passaporte', 'foto', 'senha'].includes(field.CAMPO))
                        .map(field => (
                            ['cpf', 'rg', 'passaporte'].includes(field.CAMPO)
                                ? { CAMPO: "documento", OBRIGATORIEDADE: field.OBRIGATORIEDADE }
                                : { CAMPO: field.CAMPO, OBRIGATORIEDADE: field.OBRIGATORIEDADE }
                        ))
                        .filter(({ CAMPO }) => !(data.ROUTE_KEY === ROUTE_KEYS.RESIDENT_REGISTER_KEY && CAMPO === "foto" && data.FACE))
                ))

                return desiredOrder
                    .map(field => availableFields.find(f => f.CAMPO === field))
                    .filter(Boolean) as FormField[]
            })()
        },
        { title: "Informações adicionais", fields: remainingFields }]


    const handleRadioChange = ({ name, value }: { name: string, value: string }) => {
        onChangeFormData({ ...formData, [name]: value, cpf: "", passaporte: "" })
        setIsForeigner(value === "true")
    }


    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, pattern } = e.currentTarget;
        const trimmedValue = value.trim();
        const regex = new RegExp(pattern);

        if (!regex.test(trimmedValue) && trimmedValue !== "") {
            e.target.setCustomValidity(fieldsContent[`${name}`]?.message || "Valor inválido");
        } else {
            e.target.setCustomValidity("");
        }

        const updatedData = { ...formData };
        if (trimmedValue === "") {
            delete updatedData[name];
        } else {
            const finalValue = e.target.getAttribute("data-value") ? e.target.getAttribute("data-value") : value.trim()
            updatedData[name] = finalValue as string;
        }

        onChangeFormData(updatedData);
    }, [formData, onChangeFormData]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        init(async () => {
            e.preventDefault()
            const passwordIsValid = formData["senha"] === formData["conf_senha"] || false
            try {
                if (RECORRENTE && !passwordIsValid) throw new Error("As senhas precisam ser iguais para poder prosseguir!")

                if (currentStep.step + 1 < steps.length && steps[1].fields.length !== 0) {
                    setCurrentStep((prev) => ({ ...prev, currentAction: "next", step: prev.step + 1 }))
                    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 300)
                } else {
                    await onSubmit()
                }
            } catch (err) {
                return errorToastDispatcher(err)
            }
        })
    }


    const renderField = (field: { CAMPO: string, OBRIGATORIEDADE: boolean }) => {
        switch (field.CAMPO) {
            case 'nome':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <Label className="text-primary/80 grid gap-2" htmlFor="nome">
                            Nome
                            <Input
                                defaultValue={formData["nome"]}
                                required={field.OBRIGATORIEDADE}
                                id="nome"
                                name="nome"
                                pattern=".{2,}"
                                type="text"
                                autoComplete="given-name"
                                placeholder="Digite seu nome"
                                onChange={(e) => {
                                    formatInput(e, (value) => value.replace(/[^\p{L} ]/gu, ''));
                                    formatInput(e, formatUppercase);
                                    handleInputChange(e);
                                }}
                            />
                        </Label>
                        <Label className="text-primary/80 grid gap-2" htmlFor="sobrenome">
                            Sobrenome
                            <Input
                                defaultValue={formData["sobrenome"]}
                                required={field.OBRIGATORIEDADE}
                                id="sobrenome"
                                name="sobrenome"
                                type="text"
                                pattern=".{2,}"
                                autoComplete="family-name"
                                placeholder="Digite seu sobrenome"
                                onChange={(e) => {
                                    formatInput(e, (value) => value.replace(/[^\p{L} ]/gu, ''));
                                    formatInput(e, formatUppercase);
                                    handleInputChange(e);
                                }}
                            />
                        </Label>
                    </div>
                );
            case 'documento':
                return (
                    <>
                        {CAMPOS.some(field => field.CAMPO === "passaporte") && (
                            <div className="grid gap-2 text-primary/80 text-sm">
                                Você é estrangeiro?
                                <RadioGroup
                                    defaultValue={formData['estrangeiro']}
                                    name="estrangeiro"
                                    id="estrangeiro"
                                    required
                                    onValueChange={(value) => handleRadioChange({ name: 'estrangeiro', value })}
                                    className="flex gap-2"
                                >
                                    <RadioGroupItem className={cn(radioStyles, 'text-white')} value="true">
                                        Sim
                                    </RadioGroupItem>
                                    <RadioGroupItem className={cn(radioStyles, 'text-white')} value="false">
                                        Não
                                    </RadioGroupItem>
                                </RadioGroup>
                            </div>
                        )}
                        <div className="grid gap-4">
                            {!isForeigner ? (
                                <>
                                    <Label className="text-primary/80 grid gap-2" htmlFor="cpf">
                                        {`${fieldsContent["cpf"].label} ${CAMPOS.find((field => field.CAMPO === "cpf"))?.OBRIGATORIEDADE ? "" : "(Opcional)"}`}
                                        <Input
                                            value={formData["cpf"]}
                                            required={CAMPOS.find((field => field.CAMPO === "cpf"))?.OBRIGATORIEDADE}
                                            id="cpf"
                                            name="cpf"
                                            placeholder="Ex: 123.1506.789-10"
                                            maxLength={14}
                                            type="tel"
                                            pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
                                            onChange={(e) => {
                                                formatInput(e, formatCPF);
                                                handleInputChange(e);
                                            }}
                                        />
                                    </Label>
                                    {CAMPOS.some(field => field.CAMPO === "rg") && (
                                        <Label className="text-primary/80 grid gap-2" htmlFor="rg">
                                            {`${fieldsContent["rg"].label} ${CAMPOS.find((field => field.CAMPO === "rg"))?.OBRIGATORIEDADE ? "" : "(Opcional)"}`}
                                            <Input
                                                value={formData["rg"]}
                                                required={
                                                    CAMPOS.find((field) => field.CAMPO === "rg")?.OBRIGATORIEDADE || "rg" in formData
                                                }
                                                id="rg"
                                                name="rg"
                                                type="tel"
                                                placeholder="Ex: 12.350.678-9"
                                                onChange={(e) => {
                                                    formatInput(e, formatRG)
                                                    handleInputChange(e);
                                                }}
                                            />

                                        </Label>
                                    )}
                                </>
                            ) : (
                                <Label className="text-primary/80 grid gap-2" htmlFor="passaporte">
                                    {`${fieldsContent["passaporte"].label} ${field.OBRIGATORIEDADE ? "" : "(Opcional)"}`}
                                    <Input
                                        value={formData["passaporte"]}
                                        required={
                                            CAMPOS.find((field) => field.CAMPO === "passaporte")?.OBRIGATORIEDADE || "passaporte" in formData
                                        }
                                        id="passaporte"
                                        name="passaporte"
                                        placeholder="Digite seu passaporte"
                                        pattern=".{7,9}"
                                        minLength={7}
                                        maxLength={9}
                                        onChange={(e) => {
                                            formatInput(e, value => value.replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase());
                                            handleInputChange(e);
                                        }}
                                    />
                                </Label>
                            )}
                        </div>
                    </>
                );
            case 'foto':
                return (
                    <Label className="text-primary/80 grid gap-1 relative" htmlFor="foto">
                        Precisamos de uma foto sua
                        <ImageCapture required
                            defaultUrl={formData.foto}
                            onImageCapture={(url) => onChangeFormData({ ...formData, foto: url })}
                            handleChange={handleInputChange}
                        />
                    </Label>
                );
            case 'telefone':
                return <PhoneInput data={formData} required={field.OBRIGATORIEDADE || "telefone" in formData} className="-mt-2" values={[formData["countryCode"], formData["areaCode"], formData["phoneNumber"]]} handleInputChange={onChangeFormData} />
            case 'placa':
                return (
                    <Label className="text-primary/80 grid gap-2 font-normal" htmlFor={field.CAMPO}>
                        {`${fieldsContent[field.CAMPO].label} ${field.OBRIGATORIEDADE ? "" : "(Opcional)"}`}
                        <Input defaultValue={formData[field.CAMPO]}
                            required={field.OBRIGATORIEDADE || "placa" in formData}
                            id="placa"
                            name="placa"
                            pattern="^[A-Z]{3}-(\d{4}|\d[A-Z]\d{2})$"
                            maxLength={7}
                            placeholder={fieldsContent[field.CAMPO].placeholder}
                            onChange={(e) => {
                                formatInput(e, formatPlate)
                                handleInputChange(e)
                            }}
                        />
                    </Label>
                )
            case 'profissão':
                return (
                    <Label className="text-primary/80 grid gap-2 font-normal" htmlFor={field.CAMPO}>
                        {`${fieldsContent[field.CAMPO].label} ${field.OBRIGATORIEDADE ? "" : "(Opcional)"}`}
                        <Input defaultValue={formData["profissao"]}
                            required={field.OBRIGATORIEDADE || "profissao" in formData}
                            id="profissao"
                            name="profissao"
                            placeholder={fieldsContent[field.CAMPO].placeholder}
                            pattern=".{3,}"
                            onChange={(e) => {
                                formatInput(e, (value) => {
                                    const newValue = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]+/g, '')
                                    return formatUppercase(newValue)
                                })
                                handleInputChange(e)
                            }}
                        />
                    </Label>
                )
            case 'cnh':
                return (
                    <Label className="text-primary/80 grid gap-2 font-normal" htmlFor={field.CAMPO}>
                        {`${fieldsContent[field.CAMPO].label} ${field.OBRIGATORIEDADE ? "" : "(Opcional)"}`}
                        <Input defaultValue={formData[field.CAMPO]}
                            required={field.OBRIGATORIEDADE || "cnh" in formData}
                            id={field.CAMPO}
                            type="tel"
                            name={field.CAMPO}
                            pattern=".{11,11}"
                            maxLength={11}
                            placeholder={fieldsContent[field.CAMPO].placeholder}
                            onChange={handleInputChange}
                        />
                    </Label>
                )
            case 'data nascimento':
                return (
                    <Label className="text-primary/80 grid gap-2 font-normal" htmlFor={field.CAMPO}>
                        {`${fieldsContent["data_nascimento"].label} ${field.OBRIGATORIEDADE ? "" : "(Opcional)"}`}
                        <Input defaultValue={formData["data_nascimento"]}
                            required={field.OBRIGATORIEDADE || "data nascimento" in formData}
                            maxLength={10}
                            pattern=".{10,10}"
                            id="data_nascimento"
                            name={"data_nascimento"}
                            type="tel"
                            placeholder={fieldsContent['data_nascimento'].placeholder}
                            onChange={(e) => {
                                handleInputChange(e)
                                formatInput(e, formatBirthDate)
                            }}
                        />
                    </Label>
                )
            case 'email':
                return (
                    <Label className="text-primary/80 grid gap-2 font-normal" htmlFor={field.CAMPO}>
                        {`${fieldsContent[field.CAMPO].label} ${field.OBRIGATORIEDADE ? "" : "(Opcional)"}`}
                        <Input
                            pattern="/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                            defaultValue={formData[field.CAMPO]}
                            required={field.OBRIGATORIEDADE || "email" in formData}
                            id={field.CAMPO}
                            name={field.CAMPO}
                            placeholder={fieldsContent[field.CAMPO]?.placeholder || `Digite ${field}`}
                            onChange={handleInputChange}
                        />
                    </Label>
                );
            case 'senha': return <DefinePasswordForm onInputChange={handleInputChange} data={formData} />
            case 'observações':
                return null
            case 'rg':
                return null
        }
    };

    return (
        <form autoComplete="off" {...props} onSubmit={handleSubmit} className={cn("grid h-fit p-6 gap-4 py-0 w-full overflow-x-hidden max-w-[450px] min-w-[350px] mx-auto [grid-template-rows:min-content]", className)}>
            <div className="flex justify-between mt-4 gap-2 w-[55%] mx-auto">
                {steps[1].fields.length !== 0 && steps.map((_, index) => (
                    <div key={index} className={cn("flex w-full items-center gap-2", index + 1 === steps.length && "w-fit")}>
                        <Step step={index + 1} currentStep={currentStep.step + 1} />
                        {index + 1 < steps.length && (
                            <div
                                className={`w-full h-[3px] rounded-full transition-all duration-500 ${index + 1 <= currentStep.step ? 'bg-livo' : 'bg-primary/10'}`}
                            />
                        )}
                    </div>
                ))}
            </div>
            <div id="form-wrapper" className="relative pb-5">
                <AnimatePresence mode="sync">
                    <motion.div
                        key={currentStep.step}
                        initial={{ opacity: 0, x: currentStep.currentAction === "next" ? 100 : -100 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: 0.3, ease: "circInOut" } }}
                        exit={{ opacity: 0, x: currentStep.currentAction === "prev" ? -100 : 100, position: "absolute" }}
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.3 }
                        }}
                        className="w-full"
                    >
                        <h2 className="font-medium mb-4 text-primary/80 text-[25px] xl:leading-[52px] leading-[42px]">
                            {steps[currentStep.step].title}
                        </h2>
                        {steps[currentStep.step].fields.map((field, index) => (
                            <div key={index} className="mb-4 grid gap-4" >
                                {renderField(field)}
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                <div className={cn("flex justify-end gap-4", currentStep.step > 0 && "justify-between")}>
                    {currentStep.step > 0 && (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(prev => ({ ...prev, currentAction: "prev", step: prev.step - 1 }))}
                            className="grid hover:brightness-[.8] place-content-center text-primary h-12 min-w-12 p-0 rounded-full shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)]  bg-gradient-to-b from-[#101010] to-[#181818d3]  border border-t-0 transition-all duration-300"
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <SaveButton content={currentStep.step === 0 && steps[1].fields.length !== 0 ? 'Continuar' : 'Enviar'} state={!loading ? 'initial' : 'loading'} disabled={loading} />
                </div>
            </div>
        </form>
    )
}