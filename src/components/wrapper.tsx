import { InviteProvider } from "@/contexts/invite-context";
import { DefaultLayout } from "@/layout/invite/base";
import { ReactNode } from "react";
import { Protector } from "./invite/protector";

export function Wrapper({ children }: { children: ReactNode }) {
    return (
        <InviteProvider>
            <DefaultLayout>
                <Protector>
                    {children}
                </Protector>
            </DefaultLayout>
        </InviteProvider>
    )
}