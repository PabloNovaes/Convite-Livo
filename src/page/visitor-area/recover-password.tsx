import logo from "@/../public/letter-logo.svg"
import { callApi } from "@/api.config"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SaveButton } from "@/components/ui/save-button"
import type { RecoverPasswordVisitorProps } from "@/types/visitor"
import { errorToastDispatcher } from "@/utils/error-toast-dispatcher"
import { formatCPF, formatInput } from "@/utils/formatters"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserCircle } from "@phosphor-icons/react"
import { AnimatePresence, motion } from "framer-motion"
import { type ChangeEvent, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { radioStyles } from "./login"

import { DefineNewPasswordForm } from "@/components/visitor-area/features/define-new-password-form"
import { containerVariants, fadeInVariants, itemVariants } from "@/motion.config"
import * as Primitive from "@radix-ui/react-radio-group"

export function RecoverPassword() {
    const [visitorData, setVisitorData] = useState<RecoverPasswordVisitorProps | null>(null)
    const [showDefinePassword, setShowDefinePassword] = useState(false)
    const [loading, startTransition] = useTransition()
    const [docType, setDocType] = useState<"cpf" | "passporte">("cpf")

    const baseFormSchema = z.object({
        type: z.enum(["email", "telefone"], { message: "Deve selecionar uma das opções" }),
    })

    type UserFormValue = z.infer<typeof baseFormSchema>

    const baseForm = useForm<UserFormValue>({
        resolver: zodResolver(baseFormSchema),
        defaultValues: {
            type: "email",
        },
    })

    const formSchema = z.object({
        docType: z.enum(["cpf", "passaporte"], { message: "Deve selecionar uma das opções" }),
        document: z.string({ message: "O documento é obrigatório" }).superRefine((val, ctx) => {
            if (docType === "passporte") {
                const passportRegex = /[^a-zA-Z0-9]/g
                if (!passportRegex.test(val)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Formato de passaporte inválido",
                    })
                }
            } else {
                const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
                if (!cpfRegex.test(val)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "CPF deve estar no formato 123.456.789-10",
                    })
                }
            }
        }),
    })

    type FormValue = z.infer<typeof formSchema>

    const form = useForm<FormValue>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            docType: "cpf",
        },
    })

    const getVisitorData = async () => {
        startTransition(() => {
            (async () => {
                const { docType, document } = form.getValues()
                try {
                    const body = {
                        request: "get_rec_senha_login_visita",
                        ...(docType === "cpf" ? { cpf: document.replace(/\D/g, "") } : { passporte: document }),
                    }

                    const data = await callApi("POST", { body })

                    if (!data["RESULT"]) throw new Error(data["INFO"] || data["MSG"])
                    setVisitorData(data as RecoverPasswordVisitorProps)
                } catch (err) {
                    errorToastDispatcher(err)
                }
            })()
        })
    }

    const onSubmit = async () => {
        const { type } = baseForm.getValues()
        startTransition(() => {
            (async () => {
                try {
                    const body = {
                        request: type === "telefone" ? "get_pin_rec_senha_wpp" : "get_pin_rec_senha_email",
                        visita: visitorData?.PRIVATE_KEY_VISITA as string,
                    }
                    const data = await callApi("POST", { body, headers: { Authorization: "hash" } })

                    if (!data["RESULT"]) throw new Error(data["INFO"] || data["MSG"])
                    setShowDefinePassword(true)
                } catch (err) {
                    errorToastDispatcher(err)
                }
            })()
        })
    }

    const renderContent = () => {
        if (showDefinePassword) {
            return (
                <motion.div key="define-password" variants={fadeInVariants} initial="hidden" animate="show">
                    <DefineNewPasswordForm keyUser={visitorData?.PRIVATE_KEY_VISITA as string} />
                </motion.div>
            )
        }

        if (!visitorData) {
            return (
                <motion.div key="document-verification" className="grid gap-5" variants={containerVariants} initial="hidden" animate="show">
                    <div className="flex flex-col gap-5">
                        <motion.img
                            variants={itemVariants} initial='hidden' animate='show' exit='hidden'
                            src={logo || "/placeholder.svg"}
                            alt="letter-logo"
                            className="h-4 w-fit opacity-55 lg:hidden"
                        />
                        <motion.h1 variants={itemVariants} initial='hidden' animate='show' exit='hidden' className="text-4xl font-medium tracking-tight">
                            Selecione o tipo de documento que deseja usar:
                        </motion.h1>
                    </div>
                    <Form {...form}>
                        <motion.form
                            variants={containerVariants}
                            onSubmit={form.handleSubmit(getVisitorData)}
                            className="w-full space-y-4 font-medium"
                        >
                            <motion.div variants={itemVariants} initial='hidden' animate='show' exit='hidden'>
                                <FormField
                                    control={form.control}
                                    name="docType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Você é estrangeiro?</FormLabel>
                                            <FormControl>
                                                <Primitive.RadioGroup
                                                    required
                                                    onValueChange={(value) => {
                                                        field.onChange(value)
                                                        setDocType(value as "cpf" | "passporte")
                                                        form.setValue("document", "")
                                                    }}
                                                    defaultValue={field.value}
                                                    className="flex gap-2"
                                                >
                                                    <Primitive.RadioGroupItem className={radioStyles} value="passaporte">
                                                        Sim
                                                    </Primitive.RadioGroupItem>
                                                    <Primitive.RadioGroupItem className={radioStyles} value="cpf">
                                                        Não
                                                    </Primitive.RadioGroupItem>
                                                </Primitive.RadioGroup>
                                            </FormControl>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants} initial='hidden' animate='show' exit='hidden'>
                                <FormField
                                    control={form.control}
                                    name="document"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center relative">
                                                <FormControl>
                                                    <Input
                                                        className="h-12 rounded-xl bg-[#181818]/60 font-light text-sm indent-[26px]"
                                                        type="text"
                                                        placeholder={`Digite seu ${form.watch("docType") === "passaporte" ? "passaporte (ex: AB123456)" : "CPF (ex: 123.456.789-10)"}`}
                                                        disabled={loading}
                                                        value={field.value}
                                                        maxLength={docType === "cpf" ? 14 : 12}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                            formatInput(e, docType === "cpf" ? formatCPF : (value) => value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())
                                                            form.setValue("document", e.target.value)
                                                        }}
                                                    />
                                                </FormControl>
                                                <UserCircle weight="fill" size={22} className="absolute left-3 text-[#6a6a6a]" />
                                            </div>
                                            <FormMessage className="text-xs font-light" />
                                        </FormItem>
                                    )}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants} initial='hidden' animate='show' exit='hidden'>
                                <SaveButton content="Verificar documento" state={loading ? "loading" : "initial"} />
                            </motion.div>
                        </motion.form>
                    </Form>
                </motion.div>
            )
        }

        return (
            <motion.div key="pin-delivery-method" className="grid gap-5" variants={containerVariants} initial="hidden" animate="show">
                <div className="flex flex-col gap-5">
                    <motion.img
                        variants={itemVariants} initial='hidden' animate='show' exit='hidden'
                        src={logo || "/placeholder.svg"}
                        alt="letter-logo"
                        className="h-4 w-fit opacity-55 lg:hidden"
                    />
                    <motion.h1 variants={itemVariants} initial='hidden' animate='show' exit='hidden' className="text-4xl font-medium tracking-tight">
                        Escolha por onde deseja receber o PIN de recuperação de senha:
                    </motion.h1>
                </div>
                <Form {...baseForm}>
                    <motion.form
                        variants={containerVariants}
                        onSubmit={baseForm.handleSubmit(onSubmit)}
                        className="w-full grid gap-5"
                    >
                        <motion.div className="mt-3" variants={itemVariants} initial='hidden' animate='show' exit='hidden'>
                            <FormField
                                control={baseForm.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <RadioGroup
                                                defaultValue={field.value}
                                                onValueChange={(value) => {
                                                    baseForm.setValue("type", value as "email" | "telefone")
                                                }}
                                            >
                                                {visitorData.EMAIL_VISITA && (
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="email" id="email" />
                                                        <Label className="text-[15px] leading-0" htmlFor="email">
                                                            <span className="font-medium">Receber por email:</span> {visitorData.EMAIL_VISITA}
                                                        </Label>
                                                    </div>
                                                )}
                                                {visitorData.TELEFONE_VISITA && (
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="telefone" id="telefone" />
                                                        <Label className="text-[15px] leading-0" htmlFor="telefone">
                                                            <span className="font-medium">Receber por whatsapp:</span> {visitorData.TELEFONE_VISITA}
                                                        </Label>
                                                    </div>
                                                )}
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} initial='hidden' animate='show' exit='hidden'>
                            <SaveButton content="Enviar PIN" state={loading ? "loading" : "initial"} />
                        </motion.div>
                    </motion.form>
                </Form>
            </motion.div>
        )
    }

    return (
        <>
            <div className="flex h-full items-center px-4 lg:p-8 relative z-10 max-w-[450px]">
                <motion.div className="mx-auto flex w-full flex-col justify-center space-y-6">
                    <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>

                    <motion.p
                        variants={itemVariants} initial='hidden' animate='show' exit='hidden'
                        className="text-muted-foreground px-2.5 text-center text-sm font-light [&_a]:font-light"
                    >
                        Ao continuar, você estara concordando com nossos{" "}
                        <a className="hover:text-primary underline underline-offset-1" href="/terms">
                            Termos de uso
                        </a>{" "}
                        e{" "}
                        <a className="hover:text-primary underline underline-offset-1" href="/privacy">
                            Politica de privacidade
                        </a>
                    </motion.p>
                </motion.div>
            </div>
        </>
    )
}

