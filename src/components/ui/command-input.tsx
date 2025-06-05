"use client"

import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Input, inputStyles } from "@/components/ui/input"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { CaretDown, Check } from "@phosphor-icons/react"
import { X } from "lucide-react"
import type React from "react"
import { forwardRef, memo, useEffect, useRef, useState, type KeyboardEvent } from "react"
import { Drawer, DrawerContent, DrawerHeader } from "./drawer"

export type CommandOption = {
    id: string
    label: string
    value: string
    icon?: React.ReactNode
    disabled?: boolean
    description?: string
}

type CommandInputProps = {
    options: CommandOption[]
    placeholder?: string
    value?: string
    onChange?: (value: string) => void
    onSelect?: (option: CommandOption) => void
    className?: string
    listClassName?: string
    emptyMessage?: string
    filterFunction?: (option: CommandOption, search: string) => boolean
    maxResults?: number
    disabled?: boolean
    defaultValue?: CommandOption[]
    listMode?: {
        onRemove: (option: CommandOption) => void
        use: boolean
    }
}

export const CommandInput = forwardRef<HTMLDivElement, CommandInputProps>(({
    options,
    placeholder = "Type a command...",
    value = "",
    onChange,
    onSelect,
    className,
    listClassName,
    emptyMessage = "No commands found.",
    filterFunction,
    maxResults = 5,
    disabled = false,
    defaultValue,
    listMode
}, ref) => {
    const [inputValue, setInputValue] = useState(value)
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const commandListRef = useRef<HTMLDivElement>(null)
    const [showList, setShowList] = useState(false)
    const [selecteds, setSelecteds] = useState<CommandOption[]>(defaultValue ?? [])

    const inputRef = useRef<HTMLInputElement>(null)
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const defaultFilterFunction = (option: CommandOption, search: string) => {
        return (
            option.label.toLowerCase().includes(search.toLowerCase()) ||
            option.value.toLowerCase().includes(search.toLowerCase())
        )
    }

    useEffect(() => {
        setInputValue(value)
    }, [value])

    const filter = filterFunction || defaultFilterFunction

    const filteredOptions =
        inputValue.trim() === "" ? options : options.filter((option) => filter(option, inputValue)).slice(0, maxResults)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)
        onChange?.(newValue)
        setIsOpen(true)
        setHighlightedIndex(0)
    }

    const handleSelectOption = (option: CommandOption) => {
        if (option.disabled) return

        if (listMode) {
            setSelecteds((prev) => ([...prev, option]))
            setInputValue("")
            onChange?.(option.value)
            onSelect?.(option)
            inputRef.current?.focus()
            return
        }

        setInputValue(option.value)
        onChange?.(option.value)
        onSelect?.(option)
        setIsOpen(false)
        inputRef.current?.focus()
    }


    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault()
                setIsOpen(true)
            }
            return
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev))
                break
            case "ArrowUp":
                e.preventDefault()
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
                break
            case "Enter":
                e.preventDefault()
                if (filteredOptions.length > 0 && !filteredOptions[highlightedIndex]?.disabled) {
                    handleSelectOption(filteredOptions[highlightedIndex])
                }
                break
            case "Escape":
                e.preventDefault()
                setIsOpen(false)
                break
            default:
                break
        }
    }

    useEffect(() => {
        if (isOpen && commandListRef.current) {
            const highlightedElement = commandListRef.current.querySelector(`[data-highlighted="true"]`)
            if (highlightedElement) {
                highlightedElement.scrollIntoView({ block: "nearest" })
            }
        }
    }, [highlightedIndex, isOpen])

    useEffect(() => {
        let timeout: NodeJS.Timeout

        if (isOpen) {
            setShowList(true)
        } else {

            timeout = setTimeout(() => {
                setShowList(false)
            }, 150)
        }

        return () => clearTimeout(timeout)
    }, [isOpen])


    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(e.target as Node) &&
                commandListRef.current &&
                !commandListRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])


    const ListContent = memo(() => (
        <Command className={cn("", listClassName)}>
            <CommandList id="command-list" className={cn("h-full overflow-y-auto", isDesktop && "max-h-[200px]")}>
                {filteredOptions.length === 0 ? (
                    <CommandEmpty>{emptyMessage}</CommandEmpty>
                ) : (
                    <CommandGroup className="bg-red-white/0">
                        {filteredOptions.map((option, index) => (
                            <CommandItem
                                key={option.id}
                                id={`command-item-${option.id}`}
                                onSelect={() => handleSelectOption(option)}
                                disabled={selecteds.map(({ id }) => id).includes(option.id)}
                                data-highlighted={index === highlightedIndex}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 cursor-pointer h-10",
                                    index === highlightedIndex && "bg-accent text-accent-foreground",
                                    option.disabled && "opacity-50 cursor-not-allowed",
                                )}
                            >
                                {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                                <div className="flex flex-col w-full">
                                    <div className="font-medium flex justify-between">
                                        {option.label}
                                        {selecteds.map(({ id }) => id).includes(option.id) && <Check className="gap-11 text-white" />}
                                    </div>
                                    {option.description && (
                                        <span className="text-xs text-muted-foreground">
                                            {option.description}

                                        </span>
                                    )}
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </Command>
    ))

    return (
        <div className="relative w-full">
            {listMode?.use && !isDesktop ?
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className={cn(inputStyles, "flex items-center justify-between transition-all active:scale-[.98] hover:border-ring hover:ring-ring/50 hover:ring-[3px]")}>
                    Selecione suas unidades <CaretDown />
                </button>
                : (
                    <Input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        className={cn("w-full", className)}
                        disabled={disabled}
                        aria-expanded={isOpen}
                        aria-autocomplete="list"
                        aria-controls="command-list"
                        aria-activedescendant={
                            isOpen && filteredOptions.length > 0 ? `command-item-${filteredOptions[highlightedIndex]?.id}` : undefined
                        }
                    />
                )
            }

            {isDesktop && showList ? (
                <div
                    className={cn(
                        "absolute z-50 w-full mt-1",
                        isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none",
                        "transition-all duration-150 ease-in-out",
                    )}
                >
                    <div
                        ref={commandListRef}
                        className={cn(
                            "overflow-hidden bg-popover text-popover-foreground rounded-md border shadow-md",
                            isOpen && "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
                        )}
                    >
                        <ListContent />
                    </div>
                </div>
            ) : (
                <Drawer open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
                    <DrawerContent>
                        <DrawerHeader className="px-2">
                            <Input
                                placeholder={placeholder}
                                value={inputValue}
                                onChange={handleInputChange}
                            />
                        </DrawerHeader>
                        <div className="px-2">
                            <ListContent />
                        </div>
                    </DrawerContent>
                </Drawer>
            )}
            {listMode?.use && <div className={cn("flex flex-wrap gap-2 pl-1", selecteds.length !== 0 && "pt-3")}>
                {selecteds.map((item) => {
                    const { label, id: currentId } = item
                    return (
                        <div key={currentId} className="flex items-center gap-1 text-[11px] p-1 px-2 pr-1 bg-primary text-black rounded-md">
                            {label}
                            <button type="button"
                                onClick={() => {
                                    setSelecteds((prev) => prev.filter(({ id }) => id !== currentId))
                                    listMode.onRemove(item)
                                }}
                                className="text-[#202020] transition-all cursor-pointer">
                                <X size={14} />
                            </button>
                        </div>
                    )
                })
                }
            </div>}
        </div>
    )

})
