import logo from "@/../public/letter-logo.svg"
import { callApi } from "@/api.config"
import { cn } from "@/lib/utils"
import { errorToastDispatcher } from "@/utils/error-toast-dispatcher"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle, Eye, EyeSlash, LockKey, XCircle } from "@phosphor-icons/react"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { SaveButton } from "@/components/ui/save-button"
import c from "js-cookie"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const recoverPassSchema = z
    .object({
        otp: z.string().regex(/^\d{6}$/, "O código deve conter exatamente 6 dígitos"),
        password: z
            .string()
            .min(6, "A senha deve ter pelo menos 6 caracteres")
            .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
            .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
            .regex(/\d/, "A senha deve conter pelo menos um número")
            .regex(/[\W_]/, "A senha deve conter pelo menos um caractere especial"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    })

export type RecoverPassValue = z.infer<typeof recoverPassSchema>

export function DefineNewPasswordForm({ keyUser }: { keyUser: string }) {
    const [loading, startTransition] = useTransition()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const nav = useRouter()

    const form = useForm<RecoverPassValue>({
        resolver: zodResolver(recoverPassSchema),
        defaultValues: {
            otp: "",
            password: "",
            confirmPassword: "",
        },
    })

    const handleSubmit = (values: RecoverPassValue) => {
        startTransition(() => {
            (async () => {
                try {
                    const body = {
                        request: "set_nova_senha_login_visita",
                        visita: keyUser,
                        pin: values.otp,
                        senha: values.password,
                    }

                    const data = await callApi("POST", { body })

                    if (!data["RESULT"]) throw new Error(data["INFO"] || data["MSG"])

                    toast.success("Tudo certo!", { position: "bottom-center", description: "Sua senha foi alterada com sucesso" })
                    setTimeout(() => {
                        c.set('token', data["TOKEN"])
                        nav.push("/visitante/home")
                    }, 1000)
                } catch (err) {
                    errorToastDispatcher(err)
                }
            })()
        })
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value
        form.setValue("password", newPassword, { shouldValidate: true })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full space-y-6">
                <div className="flex flex-col gap-5">
                    <img src={logo || "/placeholder.svg"} alt="letter-logo" className="h-4 w-fit opacity-55 lg:hidden" />
                    <h1 className="text-4xl font-medium tracking-tight">
                        Agora que recebeu o PIN, defina qual será sua nova senha
                    </h1>
                </div>

                <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Código de verificação</FormLabel>
                            <FormControl>
                                <InputOTP maxLength={6} id="OTP" value={field.value} onChange={field.onChange}>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                    </InputOTPGroup>
                                    <InputOTPSeparator />
                                    <InputOTPGroup>
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Password Input */}
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-primary/80">Senha</FormLabel>
                            <div className="flex items-center relative">
                                <FormControl>
                                    <Input
                                        {...field}
                                        className={cn(
                                            "h-12 rounded-xl bg-[#181818]/60 font-light text-sm indent-[26px]",
                                            field.value.length >= 1 &&
                                            form.formState.errors.password &&
                                            "focus-visible:ring-red-500 border-red-500",
                                        )}
                                        type={showPassword ? "text" : "password"}
                                        minLength={6}
                                        autoComplete="new-password"
                                        onChange={(e) => {
                                            field.onChange(e)
                                            handlePasswordChange(e)
                                        }}
                                        placeholder="Digite sua senha"
                                        disabled={loading}
                                    />
                                </FormControl>
                                <LockKey weight="fill" size={20} className="absolute left-3 text-[#6a6a6a]" />
                                <button
                                    role="button"
                                    type="button"
                                    className="absolute right-3"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                >
                                    {showPassword ? (
                                        <Eye size={20} className="text-[#6a6a6a]" />
                                    ) : (
                                        <EyeSlash size={20} className="text-[#6a6a6a]" />
                                    )}
                                </button>
                            </div>

                            {/* Password requirements */}
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">A senha deve ter:</p>
                                <ul className="text-xs text-muted-foreground space-y-1 pl-4">
                                    <li className={cn(field.value.length >= 6 ? "text-emerald-500" : "text-muted-foreground")}>
                                        Pelo menos 6 caracteres
                                    </li>
                                    <li className={cn(field.value.match(/[A-Z]/) ? "text-emerald-500" : "text-muted-foreground")}>
                                        Pelo menos uma letra maiúscula
                                    </li>
                                    <li className={cn(field.value.match(/[a-z]/) ? "text-emerald-500" : "text-muted-foreground")}>
                                        Pelo menos uma letra minúscula
                                    </li>
                                    <li className={cn(field.value.match(/\d/) ? "text-emerald-500" : "text-muted-foreground")}>
                                        Pelo menos um número
                                    </li>
                                    <li className={cn(field.value.match(/[\W_]/) ? "text-emerald-500" : "text-muted-foreground")}>
                                        Pelo menos um caractere especial
                                    </li>
                                </ul>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-primary/80">Confirme a Senha</FormLabel>
                            <div className="flex items-center relative">
                                <FormControl>
                                    <Input
                                        {...field}
                                        className={cn(
                                            "h-12 rounded-xl bg-[#181818]/60 font-light text-sm indent-[26px]",
                                            field.value.length >= 1 &&
                                            form.formState.errors.confirmPassword &&
                                            "focus-visible:ring-red-500 border-red-500",
                                        )}
                                        type={showConfirmPassword ? "text" : "password"}
                                        minLength={6}
                                        autoComplete="new-password"
                                        placeholder="Confirme sua senha"
                                        disabled={loading}
                                    />
                                </FormControl>
                                <LockKey weight="fill" size={20} className="absolute left-3 text-[#6a6a6a]" />
                                <button
                                    role="button"
                                    type="button"
                                    className="absolute right-3"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                >
                                    {showConfirmPassword ? (
                                        <Eye size={20} className="text-[#6a6a6a]" />
                                    ) : (
                                        <EyeSlash size={20} className="text-[#6a6a6a]" />
                                    )}
                                </button>
                            </div>

                            {/* Password match indicator */}
                            {form.watch("password") === field.value && field.value.length > 0 && (
                                <div className="flex items-center space-x-2 text-emerald-500/50">
                                    <CheckCircle size={20} />
                                    <p className="text-sm text-white">As senhas são iguais</p>
                                </div>
                            )}
                            {form.watch("password") !== field.value && field.value.length > 0 && (
                                <div className="flex items-center space-x-2 text-red-500/50">
                                    <XCircle size={20} />
                                    <p className="text-sm text-white">As senhas não são iguais</p>
                                </div>
                            )}

                            <FormMessage />
                        </FormItem>
                    )}
                />
                <SaveButton content="Salvar nova senha" state={loading ? "loading" : "initial"} />
            </form>
        </Form>
    )
}

