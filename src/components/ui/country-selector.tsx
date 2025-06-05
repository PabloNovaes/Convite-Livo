/* eslint-disable @typescript-eslint/no-unused-vars */
import { callApi } from "@/api.config"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"
import { usePromise } from "@/hooks/use-promise"
import { cn } from "@/lib/utils"
import { CaretDown } from "@phosphor-icons/react"
import { Check } from "lucide-react"
import { useEffect, useState } from "react"

type Country = {
    label: string
    value: string
    countryCode: string
    flag: string
}

export function CountrySelector({
    onValueChange,
    currentData,
}: {
    currentData: Record<string, string>
    onValueChange: (formData: Record<string, string>) => void
}) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [countries, setCountries] = useState<Country[]>([])
    const [_, init] = usePromise()
    const isMobile = useMediaQuery("(max-width: 768px)")

    useEffect(() => {
        init(async () => {
            const data = await callApi("GET", { endpoint: "https://restcountries.com/v3.1/all", cache: 'force-cache' })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const content = data.map((country: any) => ({
                label: country.translations.por.common,
                value: country.translations.por.common.toLowerCase(),
                countryCode: country.idd.root
                    ? country.idd.root + (country.idd.suffixes?.[0] || "")
                    : "",
                flag: country.flags.svg,
            })).sort((a: Country, b: Country) => a.label.localeCompare(b.label))

            setCountries(content)
        })
    }, [])

    const triggerButton = (
        <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-32 justify-between text-white shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] h-12 rounded-xl bg-[#181818] border-t-0"
        >
            <span className="flex">
                <img
                    src={
                        countries.find(country => country.value === value)?.flag ||
                        "https://flagcdn.com/br.svg"
                    }
                    alt={"bandeira"}
                    className="w-5 h-5 mr-1"
                />
                <p className="line-clamp-1">
                    {value
                        ? countries.find(country => country.value === value)?.label
                        : "Brasil"}
                </p>
            </span>
            <CaretDown className={cn("opacity-50 transition-all", open && "rotate-180")} />
        </Button>
    )

    const countryList = (
        <Command className="bg-transparent">
            <CommandInput placeholder="Selecione seu país..." className="h-full text-white" />
            <CommandList className="[&::-webkit-scrollbar]:w-0 mt-2">
                <CommandEmpty>País não encontrado.</CommandEmpty>
                <CommandGroup>
                    {countries.map((country, indx) => (
                        <CommandItem
                            key={country.value + indx}
                            value={country.value}
                            onSelect={(currentValue) => {
                                setValue(() => {
                                    const newValue = currentValue === value ? "" : currentValue
                                    const data = {
                                        ...currentData,
                                        countryCode: countries.find(c => c.value === currentValue)?.countryCode as string
                                    }

                                    onValueChange({
                                        ...data,
                                        countryCode: data.countryCode === "+1201" ? "+1" : data.countryCode
                                    })

                                    return newValue
                                })
                                setOpen(false)
                            }}
                        >
                            <img src={country.flag} alt={country.label} className="w-5 h-5 mr-1 rounded-[4px]" />
                            {country.label}
                            <Check className={cn("ml-auto", value === country.value ? "opacity-100" : "opacity-0")} />
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    )

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
                <DrawerContent className="p-4">{countryList}</DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{triggerButton}</DialogTrigger>
            <DialogContent hiddenCloseButton className="p-2 py-3 top-[40%] rounded-2xl pt-2">{countryList}</DialogContent>
        </Dialog>
    )
}
