import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle, Eye, EyeSlash, LockKey, XCircle } from "@phosphor-icons/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const recoverPassSchema = z
    .object({
        password: z
            .string()
            .min(6, "A senha deve ter pelo menos 6 caracteres")
            .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
            .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
            .regex(/\d/, "A senha deve conter pelo menos um número")
            .regex(/[\W_]/, "A senha deve conter pelo menos um caractere especial"),
        "conf-password": z.string(),
    })
    .refine((data) => data.password === data["conf-password"], {
        message: "As senhas não coincidem",
        path: ["conf-password"],
    })

export type RecoverPassValue = z.infer<typeof recoverPassSchema>

export function DefinePasswordForm({ data, onInputChange }: { data: Record<string, string>, onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const form = useForm<RecoverPassValue>({
        resolver: zodResolver(recoverPassSchema),
        defaultValues: {
            password: data["password"] ?? '',
            "conf-password": data["conf-password"] ?? '',
        },
    })

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onInputChange(e)
        const newPassword = e.target.value
        form.setValue("password", newPassword, { shouldValidate: true })
    }

    const handleConfPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onInputChange(e)
        const newPassword = e.target.value
        form.setValue("conf-password", newPassword, { shouldValidate: true })
    }

    return (
        <Form {...form}>
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel className="text-primary/80">Senha</FormLabel>
                        <div className="flex items-center relative">
                            <FormControl>
                                <Input
                                    {...field}
                                    className={cn(
                                        "text-white indent-[26px]",
                                        form.formState.errors.password &&
                                        "focus-visible:ring-red-500 border-red-500",
                                    )}
                                    type={showPassword ? "text" : "password"}
                                    minLength={6}
                                    autoComplete="new-password"
                                    onChange={handlePasswordChange}
                                    placeholder="Digite sua senha"
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
                name="conf-password"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel className="text-primary/80">Confirme a Senha</FormLabel>
                        <div className="flex items-center relative">
                            <FormControl>
                                <Input
                                    required
                                    {...field}
                                    className={cn(
                                        "text-white indent-[26px]",
                                        form.formState.errors["conf-password"] &&
                                        "focus-visible:ring-red-500 border-red-500",
                                    )}
                                    onChange={handleConfPasswordChange}
                                    type={showConfirmPassword ? "text" : "password"}
                                    minLength={6}
                                    autoComplete="new-password"
                                    placeholder="Confirme sua senha"
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
        </Form >
    )
}

