import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface Props {
    name: string;
    className?: string;
    list: { label: string, value: string }[];
    onSelect?: (data: { value: string, name: string }) => void;
    hidden?: boolean;
    required: boolean;
    label: string
    defaultValue?: string
}

export const RadioGroup = forwardRef<HTMLDivElement, Props>(({ defaultValue, list, onSelect, name, hidden = false, label, required, className, ...props }, ref) => {
    return (
        <>
            {!hidden && (
                <div className="grid gap-2" ref={ref} {...props}>
                    <label className="text-primary/80">{label}</label>
                    <div className="flex gap-2 flex-wrap">
                        {list.map((item) => {
                            return (
                                <label onClick={() => {
                                    if (onSelect) return onSelect({ value: item.value, name })
                                }}
                                    key={item.value}
                                    className={cn(
                                        "radio-group text-[13px] w-fit text-center py-2 px-5 bg-primary-foreground border text-primary cursor-pointer rounded-full transition-all duration-500",
                                        className)}>
                                    {item.label}
                                    <input defaultChecked={defaultValue === item.value} required={required} disabled={!required} className="mt-2" type="radio" name={name} id={item.value} value={item.value} />
                                </label>
                            )
                        })}

                    </div>
                </div>
            )}
        </>
    )
})

