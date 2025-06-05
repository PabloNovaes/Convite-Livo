import { InviteProvider } from "@/contexts/invite-context";
import "@/globals.css";
import { BaseLayout } from "@/layout/invite/base";

export default async function RootLayout({
    children,
}: Readonly<{
    params: Promise<{ id: string }>;
    children: React.ReactNode;
}>) {

    return (
        <html lang="pt-BR">
            <body>
                <InviteProvider>
                    <BaseLayout>
                        {children}
                    </BaseLayout>
                </InviteProvider>
            </body>
        </html>
    )
}