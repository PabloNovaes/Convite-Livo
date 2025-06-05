import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import React, { ForwardedRef, forwardRef } from "react"
import { CountrySelector } from "./country-selector"

type FormData = Record<string, string>

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    handleInputChange: (data: FormData) => void
    values?: [string, string, string]
    required: boolean
    data: FormData
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
    (
        { handleInputChange, values = ["", "", ""], className, required, data, ...props },
        ref: ForwardedRef<HTMLInputElement>
    ) => {

        return (
            <div className={cn("grid gap-2 max-w-md", className)}>
                <Label htmlFor="phoneNumber" className="text-primary/80 font-normal">
                    Telefone {!required && "(Opcional)"}
                </Label>
                <div className="grid grid-cols-[auto_50px_1fr] gap-2">
                    <CountrySelector onValueChange={handleInputChange} currentData={data} />
                    <Input
                        type="tel"
                        id="areaCode"
                        name="areaCode"
                        defaultValue={values[1]}
                        onChange={(e) => handleInputChange({ ...data, "areaCode": e.target.value })}
                        maxLength={3}
                        pattern="^[0-9]{1,3}"
                        required={required}
                        className="bg-primary-foreground border text-primary"
                        placeholder="11"
                    />
                    <Input
                        ref={ref}
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        defaultValue={values[2]}
                        onChange={(e) => {
                            e.target.value = e.target.value.replace(/\D/g, "")
                            handleInputChange({ ...data, "phoneNumber": e.target.value })
                        }}
                        maxLength={9}
                        minLength={data["countryCode"] === "+55" ? 9 : 6}
                        pattern={data["countryCode"] === "+55" ? "^[0-9]{9,9}$" : "^[0-9]{6,9}$"}
                        required={required || !!values[1]}
                        className="bg-primary-foreground border text-primary"
                        placeholder="12345-6789"
                        {...props}
                    />
                </div>
            </div>
        )
    }
)

PhoneInput.displayName = "PhoneInput"