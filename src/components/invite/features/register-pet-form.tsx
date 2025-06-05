'use client'

import { callApi } from "@/api.config";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { CommandInput } from "@/components/ui/command-input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    Form,
    FormControl,
    FormDescription,
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
import { uploadImage } from "@/form.config";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePromise } from "@/hooks/use-promise";
import { cn } from "@/lib/utils";
import { errorToastDispatcher } from "@/utils/error-toast-dispatcher";
import { formatUppercase } from "@/utils/formatters";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dog } from "@phosphor-icons/react";
import { Image, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImageCapture } from "./image-capture";

interface PetsProps {
    types: {
        TIPO_PET: string
        KEY_TIPO_PET: string
    }[]
    breed: {
        RACA: string
        KEY_RACA: string
    }[]
}

const petSchema = z.object({
    photo: z.string({ message: "Você precisa enviar uma foto do seu Pet!" }).nonempty({ message: "Você precisa enviar uma foto do seu Pet!" }),
    name: z.string().min(1, { message: "Nome é obrigatório" }),
    species: z.string().min(1, { message: "Tipo é obrigatório" }),
    breed: z.string().nonempty({ message: "Raça é obrigatória!" }),
    registrationNumber: z.string().optional(),
});

type PetFormValues = z.infer<typeof petSchema>;

export interface Pet extends Omit<PetFormValues, "photo"> {
    breed_key: string
    type_key: string
    photo: string | null;
}

export function RegisterPetForm({ handleSubmit }: { handleSubmit: (data: { data: Pet[], submited: boolean }) => void }) {
    const [pets, setPets] = useState<Pet[]>([]);
    const [currentType, setCurrentType] = useState("")
    const [petsProps, setPetsProps] = useState<PetsProps>({
        types: [], breed: []
    })

    const [loadingState, setLoadingState] = useState<SaveState>("initial")
    const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
    const [resetImg, setResetImg] = useState(false);
    const [open, setOpen] = useState(false);
    const [, init] = usePromise()
    const [state, setState] = useState("")

    const isDesktop = useMediaQuery("(min-width: 768px)");
    const params = useParams()

    const token = params?.token as string

    const form = useForm<PetFormValues>({
        resolver: zodResolver(petSchema),
        defaultValues: {
            name: "",
            species: "",
            breed: "",
            registrationNumber: "",
        },
    });

    useEffect(() => {
        init(async () => {
            try {
                const data = await callApi("POST", {
                    body: {
                        "request": "get_tipos_pet",
                        "tipo": 1
                    }
                })

                if (!data["RESULT"]) throw new Error(data["ERROR"])

                setPetsProps((prev) => ({ ...prev, types: data["DADOS"] }))
            } catch (err) {
                errorToastDispatcher(err)
            }
        })
    }, [])

    useEffect(() => {
        init(async () => {
            if (!currentType) return
            try {
                form.setValue("breed", "")
                const data = await callApi("POST", {
                    body: {
                        "request": "get_racas_pet",
                        "tipo_pet": petsProps.types.find(type => type.TIPO_PET === currentType)?.KEY_TIPO_PET ?? '',
                        "tipo": 1
                    }
                })

                if (!data["RESULT"]) throw new Error(data["ERROR"])

                setPetsProps((prev) => ({ ...prev, breed: data["DADOS"] }))
            } catch (err) {
                errorToastDispatcher(err)
            }
        })
    }, [currentType])


    useEffect(() => {
        if (resetImg) {
            setTimeout(() => setResetImg(false), 100);
        }
    }, [resetImg]);

    const deletePet = (id: string) => setPets(pets.filter(pet => pet.breed_key !== id));

    const setRowRadius = (index: number, position: "init" | "end" | ""): string => {
        let style = "";

        if (pets.length === 1) {
            switch (position) {
                case "end":
                    style = "rounded-r-xl"
                    break;
                case "init":
                    style = "rounded-l-xl"
                    break;
            }
            return style
        }

        if (index === 0) {
            switch (position) {
                case "init": style = "rounded-tl-xl"
                    break;
                case "end": style = "rounded-tr-xl"
                    break;
                default: style = ""
            }
            return style
        }

        if (index === pets.length - 1) {
            switch (position) {
                case "init": style = "rounded-bl-xl"
                    break;
                case "end": style = "rounded-br-xl"
                    break;
            }
            return style
        }

        return style
    }

    const onSubmit = (data: PetFormValues) => {
        const { breed, types } = petsProps

        const newPet: Pet = {
            ...data,
            breed_key: breed.filter(({ RACA }) => RACA === data.breed)[0].KEY_RACA,
            type_key: types.filter(({ TIPO_PET }) => TIPO_PET === data.species)[0].KEY_TIPO_PET,
            photo: currentPhoto,
        };

        setPets([...pets, newPet]);
        setResetImg(true);
        setCurrentPhoto("");
        form.reset();
        setOpen(false);
    };

    const registerPets = async () => {
        setLoadingState("loading")
        try {
            init(async () => {
                setState("img")
                const images = await Promise.all([...pets.map(({ photo, }) => uploadImage(photo as string, "pet"))])

                setState("pet")
                await Promise.all([...pets.map(({ name, registrationNumber, breed_key, type_key }, index) => {
                    return callApi("POST", {
                        body: {
                            "request": "set_pet",
                            "tipo_pet": type_key,
                            "raca_pet": breed_key,
                            "convite": token,
                            "url": images[index],
                            "nome": name,
                            "registro": registrationNumber ?? "",
                            "tipo": 1
                        }
                    })
                }
                )])
                setLoadingState("success")
                handleSubmit({ data: pets, submited: true })
            })
        } catch (err) {
            errorToastDispatcher(err)
        }
    }

    const Trigger = isDesktop ? DialogTrigger : DrawerTrigger;
    const Container = isDesktop ? Dialog : Drawer;
    const Content = isDesktop ? DialogContent : DrawerContent;

    return (
        <div className="space-y-6 z-10 relative">
            <Container open={open} onOpenChange={setOpen}>
                <Trigger asChild>
                    <Button className="gap-2 w-full h-11 rounded-xl shadow-sm">
                        <Plus className="h-4 w-4" />
                        Adicionar Pet
                    </Button>
                </Trigger>

                <Content className="sm:max-w-[425px]">
                    {isDesktop ? (
                        <DialogHeader>
                            <DialogTitle>Preencha os dados do seu Pet</DialogTitle>
                        </DialogHeader>
                    ) : (
                        <DrawerHeader>
                            <DrawerTitle className="flex items-center justify-center gap-2"><Dog size={18} weight="fill" />Preencha os dados do seu Pet </DrawerTitle>
                        </DrawerHeader>
                    )}

                    <CardContent className="pt-6 overflow-auto">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
                                <FormField
                                    control={form.control}
                                    name="photo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-primary/80 grid gap-1 relative">
                                                Precisamos de uma foto do seu Pet
                                                <ImageCapture
                                                    resetImg={resetImg}
                                                    required
                                                    mode="environment"
                                                    defaultUrl={field.value}
                                                    error="Precisa enviar uma foto do seu Pet"
                                                    pet={true}
                                                    onImageCapture={(url) => {
                                                        form.setValue("photo", url);
                                                        setCurrentPhoto(url);
                                                    }}
                                                />
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-primary/80">Nome</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Nome do animal"
                                                    {...field}
                                                    value={formatUppercase(field.value)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="species"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-primary/80">Tipo</FormLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(val) => {
                                                        form.setValue("species", val)
                                                        setCurrentType(val)
                                                    }}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione o tipo" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {petsProps?.types?.map(({ TIPO_PET, KEY_TIPO_PET }) => (
                                                            <SelectItem key={KEY_TIPO_PET} value={TIPO_PET}>{TIPO_PET}</SelectItem>
                                                        ))}

                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="breed"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-primary/80">Raça</FormLabel>
                                                <CommandInput
                                                    {...field}
                                                    placeholder="Selecione a raça"
                                                    emptyMessage="Nenhuma raça encontrada"
                                                    options={petsProps?.breed.map(({ KEY_RACA, RACA }) => ({ id: KEY_RACA, label: RACA, value: RACA }))}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="registrationNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-primary/80">
                                                RGA (Registro)
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Opcional" {...field} value={field.value?.toUpperCase()} />
                                            </FormControl>
                                            <FormDescription>
                                                Número de registro do animal (opcional)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-center pt-4 pb-4">
                                    <Button className="gap-2 w-full h-11 rounded-xl shadow-sm">
                                        <Plus className="h-4 w-4" />
                                        Adicionar
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Content>
            </Container>

            {/* Pets list */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">
                    {pets.length === 0 ? "Nenhum pet cadastrado" : "Meus Pets"}
                </h3>

                {pets.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="text-center p-8 rounded-xl shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] bg-[#141414] border">
                            <div className="mx-auto flex justify-center mb-3">
                                <div className="p-3 bg-pet-purple/5 rounded-full">
                                    <Image className="h-8 w-8 text-pet-purple" strokeWidth={1.8} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-medium">Sua lista de pets está vazia</h3>
                                <p className="text-sm text-neutral-500">Adicione um pet acima para começar</p>
                            </div>
                        </div>
                    </motion.div>
                    // <table className="min-w-full ">
                ) : (
                    <div className="rounded-xl text-sm bg-[#181818] p-1 shadow-sm">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="text-left p-2 pl-3">Foto</th>
                                    <th className="text-left p-2 pl-3">Nome</th>
                                    <th className="text-left p-2 pl-3">Tipo</th>
                                    <th className="text-left p-2 pl-3 hidden sm:table-cell">Raça</th>
                                </tr>
                            </thead>
                            <tbody className="relative before divide-y">
                                {[pets.map(({ name, species, breed, photo, breed_key }, index) => (
                                    <tr key={breed_key}>
                                        <td className={cn("p-3 bg-[#252525]", setRowRadius(index, "init"))}>
                                            <img src={photo ?? ''} className="min-w-14 max-w-14 rounded-full" alt="" />
                                        </td>
                                        <td className={cn("p-3 bg-[#252525]", setRowRadius(index, ""))}>{name}</td>
                                        <td className={cn("p-3 bg-[#252525]", setRowRadius(index, ""))}>{species}</td>
                                        <td className={cn("p-3 bg-[#252525] hidden sm:table-cell", setRowRadius(index, ""))}>{breed ?? "-"}</td>
                                        <td className={cn("p-3 bg-[#252525]", setRowRadius(index, "end"))}>
                                            <button onClick={() => deletePet(breed_key)} className="p-2 z-20 relative rounded-lg border border-red-500/75 bg-red-500/30 ">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))]}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {pets.length > 0 && (
                <SaveButton
                    onClick={registerPets}
                    state={loadingState}
                    content={"Cadastrar"}
                    loadingContent={state === "img" ? "Enviando as fotos..." : "Cadastrando os pets..."}
                    successContent="Pets cadastrados com sucesso"
                />
            )}
        </div>
    );
}