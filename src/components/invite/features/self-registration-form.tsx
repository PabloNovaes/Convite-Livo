'use client'

import { callApi } from "@/api.config";
import { CommandInput, CommandOption } from "@/components/ui/command-input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SaveButton, SaveState } from "@/components/ui/save-button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { residentLevel, residentTypes } from "@/constants/invite";
import { uploadImage } from "@/form.config";
import { useInvite } from "@/hooks/invite/use-invite";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motionVariants } from "@/motion.config";
import { InviteProps } from "@/types/invite";
import { errorToastDispatcher } from "@/utils/error-toast-dispatcher";
import { formatCPF, formatPhone, formatUppercase } from "@/utils/formatters";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    CheckCircle,
    Eye,
    EyeSlash,
    LockKey,
    UserCircle,
    XCircle
} from "@phosphor-icons/react";
import * as Primitive from "@radix-ui/react-radio-group";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ImageCapture } from "./image-capture";

const FirstStepSchema = z.object({
    units: z.array(z.object({
        id: z.string().optional(),
        label: z.string(),
        value: z.string(),
        icon: z.any().optional(),
        disabled: z.boolean().optional(),
        description: z.string().optional(),
    })).min(1, "Adicione ao menos uma unidade"),
    name: z.string().min(3, "Nome é obrigatório").regex(/^[A-Za-zÀ-ÖØ-öø-ÿ]{3,}( [A-Za-zÀ-ÖØ-öø-ÿ]{3,})+$/, "Forneça nome e sobrenome!"),
    whatsapp: z.string().min(15, "WhatsApp é obrigatório"),
    email: z.string().email("Email inválido"),
    image: z.string({ message: "A imagem é obrigatória!" }),
    type: z.enum(["PROPRIETARIO", "LOCATARIO"]),
    level: z.enum(["TITULAR", "DEPENDENTE"]),
});

const SecondStepSchema = z.object({
    password: z
        .string()
        .min(6, "A senha deve ter pelo menos 6 caracteres")
        .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
        .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
        .regex(/\d/, "A senha deve conter pelo menos um número")
        .regex(/[\W_]/, "A senha deve conter pelo menos um caractere especial"),
    conf_password: z.string().nonempty("Confirmar a senha é obrigatório"),
    cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "Forneça um CPF no formato valido"),
    pinMethod: z.enum(["email", "whatsapp"], { message: "Deve selecionar uma das opções" }),
}).refine((data) => data.password === data.conf_password, {
    message: "As senhas não coincidem",
    path: ["conf_password"],
});

const FinalSchema = z.object({
    pin: z.string({ message: "O PIN é obrigatório!" }).min(4, { message: "Forneça um PIN valido!" })
});

type FirstStepValues = z.infer<typeof FirstStepSchema>;
type SecondStepValues = z.infer<typeof SecondStepSchema>;
type FinalValues = z.infer<typeof FinalSchema>;

export function SelfRegistrationForm({ onSubmit: submit, initTranstion }: { onSubmit: (data: InviteProps) => void, initTranstion: () => void }) {
    const formFirstStep = useForm<FirstStepValues>({
        resolver: zodResolver(FirstStepSchema),
        defaultValues: {
            name: "",
            whatsapp: "",
            email: "",
            type: "PROPRIETARIO",
            level: "TITULAR",
            units: []
        },
        mode: "onSubmit",
    });

    const formSecondStep = useForm<SecondStepValues>({
        resolver: zodResolver(SecondStepSchema),
        defaultValues: {
            cpf: "",
            pinMethod: "email",
            password: "",
            conf_password: "",
        },
        mode: "onSubmit",
    });

    const formFinalStep = useForm<FinalValues>({
        resolver: zodResolver(FinalSchema),
        mode: "onSubmit",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState({ currentAction: "next", step: 0 });
    const [addresses, setAddresses] = useState<{ ENDERECO: string, KEY_ENDERECO: string }[]>([]);
    const [loadingState, setLoadingState] = useState<SaveState>('initial');
    const [errorCount, setErrorCount] = useState(0);
    const [selectedUnits, setSelectedUnits] = useState<CommandOption[]>([]);
    const [formSubmited, setFormSubmited] = useState(false);

    const { data: { KEY_CONDOMINIO } } = useInvite();

    const fetchAddresses = useCallback(async () => {
        try {
            const data = await callApi("POST", {
                body: {
                    request: "get_enderecos",
                    condominio: KEY_CONDOMINIO ?? ''
                }
            });

            if (!data.RESULT) throw new Error(data.MSG ?? data.INFO);

            setAddresses(data.DADOS);
        } catch (err) {
            errorToastDispatcher(err, { position: "top-center", duration: 3000 });
        }
    }, [KEY_CONDOMINIO]);

    useEffect(() => {
        if (!KEY_CONDOMINIO) return;
        fetchAddresses();
    }, [KEY_CONDOMINIO, fetchAddresses]);

    const { email, whatsapp, name, units, pinMethod, pin, level, type, password, image, cpf } = {
        ...formFirstStep.getValues(),
        ...formSecondStep.getValues(),
        ...formFinalStep.getValues()
    };

    const requestPin = useCallback(async () => {
        try {
            if (currentStep.step === 0) {
                setCurrentStep((prev) => ({ ...prev, currentAction: "next", step: prev.step + 1 }));
                return setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 300);
            }

            setLoadingState('loading');

            const data = await callApi("POST", {
                body: {
                    "request": pinMethod === "email" ? "set_email_pin_auto_cadastro" : "set_wpp_pin_auto_cadastro",
                    "campo": pinMethod === "email" ? email : whatsapp.replace(/\D/g, ''),
                    "nome": name
                }
            });

            if (!data.RESULT) throw new Error(data.MSG ?? data.INFO);

            setErrorCount(0);
            toast.success("PIN solicitado", {
                description: `Confira se recebeu o PIN solicitado pelo seu ${pinMethod}`,
                position: "top-center"
            });
            setLoadingState('success');
        } catch (err) {
            errorToastDispatcher(err, { position: "top-center", duration: 3000 });
            setLoadingState('initial');
        }
    }, [currentStep.step, pinMethod, email, whatsapp, name]);

    const onSubmit = useCallback(async () => {
        try {
            setLoadingState('loading');

            const validatePin = await callApi("POST", {
                body: {
                    "request": "set_valida_pin_auto_cadastro",
                    "pin": Number(pin),
                    "campo": pinMethod === "email" ? email : Number(whatsapp.replace(/\D/g, ''))
                }
            });

            if (!validatePin.RESULT) {
                setErrorCount((prev) => prev === 3 ? 0 : prev + 1);
                throw new Error(validatePin.MSG ?? validatePin.INFO);
            }

            const userImageUrl = await uploadImage(image, "login");

            const registerUser = await callApi("POST", {
                body: {
                    "request": "set_integrante_auto_cadastro",
                    "enderecos": JSON.stringify(units.map(({ id }) => ({ key: id }))),
                    "tipo_usuario": residentTypes[type],
                    "nivel_usuario": residentLevel[level],
                    "nome": name,
                    "email": email,
                    "url": userImageUrl,
                    "telefone": whatsapp.replace(/\D/g, ''),
                    "cpf": cpf.replace(/\D/g, ""),
                    "senha": password,
                    "tipo": 1
                },
                headers: { "condominio": KEY_CONDOMINIO ?? "", }
            });

            if (!registerUser.RESULT) throw new Error(registerUser.MSG ?? registerUser.INFO);

            setLoadingState("success");
            initTranstion();
            setTimeout(() => submit({ ...registerUser, TIPO_BIOMETRIA: "SUCCESS", completedInvite: { RESULT: true } }), 400);
        } catch (err) {
            setLoadingState("initial");
            errorToastDispatcher(err, { position: "top-center" });
        }
    }, [pin, pinMethod, email, whatsapp, image, units, type, level, name, cpf, password, KEY_CONDOMINIO, initTranstion, submit]);

    const handleFirstStepSubmit = useCallback(() => {
        setCurrentStep((prev) => ({ ...prev, currentAction: "next", step: prev.step + 1 }));
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 300);
    }, []);

    const handleSecondStepSubmit = useCallback(() => {
        setFormSubmited(true);
        setLoadingState('initial');
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }, []);

    const renderContent = useCallback(() => {
        if (formSubmited) return (
            <motion.div
                className="space-y-4"
                key={3}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                transition={{
                    y: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.3 }, delay: .8
                }}
                layout
            >
                <p>
                    Eu <span className="font-semibold">{name}</span>,
                    anfitrião {units.length > 1 ? "das unidades" : "da unidade"} {units.map(({ label, id }, index) =>
                        <span key={id} className="font-semibold">{label}{index + 1 !== units.length && ", "}</span>
                    )}, venho por meio desta me responsabilizar pelos dados cadastrados no aplicativo <span className="font-semibold">Livo</span>, conforme informado nesse formulário, bem como a veracidade das informações.
                </p>

                {units.map(({ label, id }) => (
                    <p key={id} className="italic text-sm text-gray-400">
                        {label} - {name}
                    </p>
                ))}

                <p>
                    Fico ciente por meio deste documento que a falsidade dessa declaração configura crime previsto no
                    <span className="font-semibold"> art. 298 e 299 do Código Penal Brasileiro</span>, passível de apuração na forma da Lei.
                </p>

                <p>
                    Declaro que estou de acordo com todas as regras do
                    <span className="font-semibold"> Regulamento Interno do LIVO TECNOLOGIA DA INFORMAÇÃO LTDA</span>,
                    sendo este penalizado por quaisquer atos dos mesmos dentro do residencial.
                </p>

                <div className="mt-5">
                    <FormField
                        control={formFinalStep.control}
                        name="pin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>PIN</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        value={field.value?.replace(/\D/g, '')}
                                        type="tel"
                                        maxLength={4}
                                        className="text-center"
                                        placeholder={`Insira o PIN que recebeu por ${pinMethod}`}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </motion.div>
        );

        if (currentStep.step === 0) return (
            <motion.div
                key={1}
                initial={{ opacity: 0, x: currentStep.currentAction === "next" ? 100 : -100 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.3, ease: "circInOut" } }}
                exit={{ opacity: 0, x: currentStep.currentAction === "prev" ? -100 : 100, position: "absolute" }}
                transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.3 }
                }}
            >
                <div className="grid gap-3 min-[440px]:grid-cols-5">
                    <FormField
                        control={formFirstStep.control}
                        name="units"
                        render={({ field: { value, ...rest } }) => (
                            <FormItem className="min-[440px]:col-span-5">
                                <FormLabel>Unidades</FormLabel>
                                <FormControl>
                                    <CommandInput
                                        {...rest}
                                        defaultValue={value as CommandOption[]}
                                        className="text-white"
                                        emptyMessage="Nenhuma unidade encontrada"
                                        placeholder="Procure pela sua unidade..."
                                        onSelect={(newItem) => {
                                            setSelectedUnits((prev) => {
                                                if (formFirstStep.formState.errors.units) {
                                                    formFirstStep.clearErrors("units");
                                                }

                                                const newValue = [...prev, newItem];
                                                formFirstStep.setValue("units", newValue);
                                                return newValue;
                                            });
                                        }}
                                        listMode={{
                                            use: true,
                                            onRemove: ({ id }) =>
                                                setSelectedUnits((prev) => {
                                                    const newValue = prev.filter((current) => current.id !== id);
                                                    formFirstStep.setValue("units", newValue);
                                                    return newValue;
                                                }),
                                        }}
                                        options={
                                            addresses.map(({ ENDERECO, KEY_ENDERECO }) => ({
                                                id: KEY_ENDERECO,
                                                value: ENDERECO,
                                                label: ENDERECO,
                                            }))
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={formFirstStep.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="min-[440px]:col-span-3">
                                <FormLabel>Nome e sobrenome</FormLabel>
                                <FormControl>
                                    <Input
                                        autoComplete="name"
                                        placeholder="Digite seu nome e sobrenome"
                                        {...field}
                                        value={formatUppercase(field.value)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={formFirstStep.control}
                        name="whatsapp"
                        render={({ field }) => (
                            <FormItem className="min-[440px]:col-span-2">
                                <FormLabel>WhatsApp</FormLabel>
                                <FormControl>
                                    <Input
                                        type="tel"
                                        maxLength={15}
                                        placeholder="Digite seu WhatsApp"
                                        {...field}
                                        value={formatPhone(field.value)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={formFirstStep.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="min-[440px]:col-span-5">
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        autoComplete="email"
                                        placeholder="Digite seu email"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid gap-3 grid-cols-2">
                    <FormField
                        control={formFirstStep.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="PROPRIETARIO">Proprietario</SelectItem>
                                        <SelectItem value="LOCATARIO">Locatario</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={formFirstStep.control}
                        name="level"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nível</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="TITULAR">Titular</SelectItem>
                                        <SelectItem value="DEPENDENTE">Dependente</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={formFirstStep.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tire uma foto sua</FormLabel>
                            <FormControl className="flex w-full">
                                <ImageCapture
                                    {...field}
                                    onImageCapture={(url) => {
                                        formFirstStep.setValue("image", url);
                                        formFirstStep.clearErrors("image");
                                    }}
                                    defaultUrl={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </motion.div>
        );

        if (currentStep.step === 1) return (
            <motion.div
                className="grid gap-2"
                key={2}
                initial={{ opacity: 0, x: currentStep.currentAction === "next" ? 100 : -100 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.3, ease: "circInOut" } }}
                exit={{ opacity: 0, x: currentStep.currentAction === "prev" ? -100 : 100, position: "absolute" }}
                transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.3 }
                }}
            >
                <div className="grid gap-1">
                    <FormField
                        control={formSecondStep.control}
                        name="cpf"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>CPF</FormLabel>
                                <div className="flex items-center relative">
                                    <FormControl>
                                        <Input
                                            className="h-12 rounded-xl bg-[#181818]/60 font-light text-sm indent-[26px]"
                                            type="text"
                                            placeholder="Digite seu CPF (ex: 123.456.789-10)"
                                            maxLength={14}
                                            {...field}
                                            onChange={(e) => field.onChange(formatCPF(e.target.value))}
                                            value={formatCPF(field.value)}
                                        />
                                    </FormControl>
                                    <UserCircle weight="fill" size={22} className="absolute left-3 text-[#6a6a6a]" />
                                </div>
                                <FormMessage className="text-xs font-light" />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={formSecondStep.control}
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
                                            formSecondStep.formState.errors.password &&
                                            "focus-visible:ring-red-500 border-red-500",
                                        )}
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="Digite sua senha"
                                    />
                                </FormControl>
                                <LockKey weight="fill" size={20} className="absolute left-3 text-[#6a6a6a]" />
                                <button
                                    role="button"
                                    type="button"
                                    className="absolute right-3"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <Eye size={20} className="text-[#6a6a6a]" />
                                    ) : (
                                        <EyeSlash size={20} className="text-[#6a6a6a]" />
                                    )}
                                </button>
                            </div>

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
                    control={formSecondStep.control}
                    name="conf_password"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-primary/80">Confirme a Senha</FormLabel>
                            <div className="flex items-center relative">
                                <FormControl>
                                    <Input
                                        {...field}
                                        className={cn(
                                            "text-white indent-[26px]",
                                            formSecondStep.formState.errors.conf_password &&
                                            "focus-visible:ring-red-500 border-red-500",
                                        )}
                                        type={showConfirmPassword ? "text" : "password"}
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
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? (
                                        <Eye size={20} className="text-[#6a6a6a]" />
                                    ) : (
                                        <EyeSlash size={20} className="text-[#6a6a6a]" />
                                    )}
                                </button>
                            </div>

                            {formSecondStep.watch("password") === field.value && field.value.length > 0 && (
                                <div className="flex items-center space-x-2 text-emerald-500/50">
                                    <CheckCircle size={20} />
                                    <p className="text-sm text-white">As senhas são iguais</p>
                                </div>
                            )}
                            {formSecondStep.watch("password") !== field.value && field.value.length > 0 && (
                                <div className="flex items-center space-x-2 text-red-500/50">
                                    <XCircle size={20} />
                                    <p className="text-sm text-white">As senhas não são iguais</p>
                                </div>
                            )}

                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={formSecondStep.control}
                    name="pinMethod"
                    render={({ field }) => (
                        <FormItem className="grid gap-1">
                            <FormLabel>Selecione por onde deseja receber o PIN</FormLabel>
                            <FormControl>
                                <Primitive.RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    aria-label="Select PIN method"
                                >
                                    <div className="space-y-3">
                                        <Primitive.RadioGroupItem
                                            className={cn(
                                                "flex justify-between items-center p-4 w-full text-start rounded-xl border cursor-pointer",
                                                "bg-[#181818] text-white transition-colors",
                                                field.value === "email" ? "border-[#672F92]/70" : "border-[#333]"
                                            )}
                                            value="email"
                                            id="email"
                                        >
                                            <div>
                                                <span className="block font-medium">Receber por email</span>
                                                {!formFirstStep.formState.errors.email && <span className="text-sm text-white/70">{email}</span>}
                                            </div>
                                            <span
                                                className={cn(
                                                    "w-4 h-4 rounded-full border-5",
                                                    field.value === "email" ? "bg-white border-[#672F92] " : "border-[#666]"
                                                )}
                                            />
                                        </Primitive.RadioGroupItem>

                                        <Primitive.RadioGroupItem
                                            className={cn(
                                                "flex justify-between items-center p-4 w-full text-start rounded-xl border cursor-pointer",
                                                "bg-[#181818] text-white transition-colors",
                                                field.value === "whatsapp" ? "border-[#672F92]/70" : "border-[#333]"
                                            )}
                                            value="whatsapp"
                                            id="whatsapp"
                                        >
                                            <div>
                                                <span className="block font-medium">Receber por whatsapp</span>
                                                {!formFirstStep.formState.errors.whatsapp && <span className="text-sm text-white/70">{whatsapp}</span>}
                                            </div>
                                            <span
                                                className={cn(
                                                    "w-4 h-4 rounded-full border-5",
                                                    field.value === "whatsapp" ? "bg-white border-[#672F92] " : "border-[#666]"
                                                )}
                                            />
                                        </Primitive.RadioGroupItem>
                                    </div>
                                </Primitive.RadioGroup>
                            </FormControl>
                            <FormMessage className="text-xs font-light" />
                        </FormItem>
                    )}
                />
            </motion.div>
        );
    }, [currentStep.step, currentStep.currentAction, formSubmited, formFirstStep, formSecondStep, addresses, selectedUnits, showPassword, showConfirmPassword, email, whatsapp, name, units, pinMethod]);

    const FormWrapper = ({ children }: { children: ReactNode }) => {
        switch (true) {
            case formSubmited: return (
                <Form {...formFinalStep}>{children}</Form>
            )
            case currentStep.step === 0: return (
                <Form {...formFirstStep}>{children}</Form>
            )
            case currentStep.step === 1: return (
                <Form {...formFirstStep}>{children}</Form>
            )
        }
    }

    const isDesktop = useMediaQuery("(min-width: 768px)");

    const Container = isDesktop ? Dialog : Drawer;
    const Content = isDesktop ? DialogContent : DrawerContent;
    const Title = isDesktop ? DialogTitle : DrawerTitle;
    const Description = isDesktop ? DialogDescription : DrawerDescription;
    const Footer = isDesktop ? DialogFooter : DrawerFooter;
    const Header = isDesktop ? DialogHeader : DrawerHeader;

    return (
        <div className="text-white w-full max-w-[580px] mx-auto grid gap-6 auto-rows-min relative z-10 p-6 place-content-center">
            <Image
                alt="livo-logo"
                src={'/letter-logo.svg'}
                width={120}
                height={24}
                className="h-3"
            />
            {!formSubmited && (
                <motion.h1
                    variants={motionVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className={cn(
                        "text-2xl sm:text-4xl sm:leading-[35px] z-10 -tracking-[1.6px] font-medium text-white",
                    )}
                >
                    Preencha o formulário abaixo para realizar seu autocadastro
                </motion.h1>
            )}

            <FormWrapper>
                <form
                    onSubmit={formSubmited ?
                        formFinalStep.handleSubmit(onSubmit) :
                        currentStep.step === 0 ?
                            formFirstStep.handleSubmit(handleFirstStepSubmit) :
                            formSecondStep.handleSubmit(handleSecondStepSubmit)}
                    className="grid gap-3 pb-4"
                    autoComplete="on"
                >
                    <AnimatePresence mode="sync">{renderContent()}</AnimatePresence>
                    {!formSubmited ? (
                        <div className={cn("flex justify-end gap-4 mt-4", currentStep.step > 0 && "justify-between")}>
                            {currentStep.step > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(prev => ({ ...prev, currentAction: "prev", step: prev.step - 1 }))}
                                    className="grid hover:brightness-[.8] place-content-center text-primary h-12 min-w-12 p-0 rounded-full shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] bg-gradient-to-b from-[#101010] to-[#181818d3] border border-t-0 transition-all duration-300"
                                    aria-label="Voltar passo anterior"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                            )}
                            <SaveButton
                                key={currentStep.step}
                                content={currentStep.step === 0 ? 'Continuar' : 'Enviar'}
                                disabled={loadingState === "loading"}
                                state={loadingState}
                                onReset={() => {
                                    setFormSubmited(true);
                                    setLoadingState('initial');
                                    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
                                }}
                                successContent="PIN enviado"
                            />
                        </div>
                    ) : (
                        <SaveButton
                            key="final-step"
                            content="Assinar termo"
                            disabled={loadingState === "loading"}
                            state={errorCount === 3 || (errorCount === 0 && loadingState === "success") ? 'initial' : loadingState}
                        />
                    )}
                </form>
            </FormWrapper>
            <Container open={errorCount === 3}>
                <Content>
                    <Header className="text-center">
                        <Title className="font-normal">Você enviou um PIN incorreto 3 vezes seguidas, para prosseguir, será necessario solicitar um novo PIN</Title>
                        <Description className="text-xs">Selecione por onde deseja receber o PIN, em seguida basta clicar em "solicitar um novo PIN"</Description>
                    </Header>
                    <div className={cn(!isDesktop && "px-4")}>
                        <Form {...formSecondStep}>
                            <FormField
                                control={formSecondStep.control}
                                name="pinMethod"
                                render={({ field }) => (
                                    <FormItem className="grid gap-1">
                                        <FormControl>
                                            <Primitive.RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                aria-label="Select PIN method"
                                            >
                                                <div className="space-y-3">
                                                    <Primitive.RadioGroupItem
                                                        className={cn(
                                                            "flex justify-between items-center p-4 w-full text-start rounded-xl border cursor-pointer",
                                                            "bg-[#181818] text-white transition-colors",
                                                            field.value === "email" ? "border-[#672F92]/70" : "border-[#333]"
                                                        )}
                                                        value="email"
                                                        id="email-retry"
                                                    >
                                                        <div>
                                                            <span className="block font-medium">Receber por email</span>
                                                            {!formFirstStep.formState.errors.email && <span className="text-sm text-white/70">{email}</span>}
                                                        </div>
                                                        <span
                                                            className={cn(
                                                                "w-4 h-4 rounded-full border-5",
                                                                field.value === "email" ? "bg-white border-[#672F92] " : "border-[#666]"
                                                            )}
                                                        />
                                                    </Primitive.RadioGroupItem>

                                                    <Primitive.RadioGroupItem
                                                        className={cn(
                                                            "flex justify-between items-center p-4 w-full text-start rounded-xl border cursor-pointer",
                                                            "bg-[#181818] text-white transition-colors",
                                                            field.value === "whatsapp" ? "border-[#672F92]/70" : "border-[#333]"
                                                        )}
                                                        value="whatsapp"
                                                        id="whatsapp-retry"
                                                    >
                                                        <div>
                                                            <span className="block font-medium">Receber por whatsapp</span>
                                                            {!formFirstStep.formState.errors.whatsapp && <span className="text-sm text-white/70">{whatsapp}</span>}
                                                        </div>
                                                        <span
                                                            className={cn(
                                                                "w-4 h-4 rounded-full border-5",
                                                                field.value === "whatsapp" ? "bg-white border-[#672F92] " : "border-[#666]"
                                                            )}
                                                        />
                                                    </Primitive.RadioGroupItem>
                                                </div>
                                            </Primitive.RadioGroup>
                                        </FormControl>
                                        <FormMessage className="text-xs font-light" />
                                    </FormItem>
                                )}
                            />
                        </Form>
                    </div>
                    <Footer>
                        <SaveButton
                            onClick={requestPin}
                            disabled={loadingState === "loading"}
                            content="Solictar um novo PIN"
                            state={loadingState}
                        />
                    </Footer>
                </Content>
            </Container>
        </div>
    );
}