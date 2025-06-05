import { CompletedInvite, RequestBodyProps } from "@/components/invite/features/recover-invite-form"

export interface InviteViewerProps extends InviteProps {
    completedInvite: CompletedInvite
    handleRefreshStatus: (data: CompletedInvite) => void
}

export interface InviteFields {
    CAMPO: string
    ESSENCIAL: boolean
    EXIBIR: boolean
    OBRIGATORIEDADE: boolean
    RESULT: boolean
}

export interface InviteProps {
    MENSAGEM: {
        show: boolean
        content: string
    } | null
    USUARIO: string
    ADD_ACOMPANHANTE: boolean
    RECORRENTE?: boolean
    CAMPOS: InviteFields[]
    RECUPERAR: boolean
    CEP_CONDOMINIO?: string
    CONDOMINIO?: string
    DESC_ENDERECO?: string
    NUMERO_CONDOMINIO?: string
    TIPO_BIOMETRIA?: string
    TELEFONE_USUARIO?: string
    DATA_CONVITE?: string
    LOGO_CLIENTE: string
    LOGO_PARCEIRO: string
    FACE?: boolean
    INFO?: string
    requestBody: RequestBodyProps | null
    completedInvite: CompletedInvite | null
    ROUTE_KEY: string
    PRIVATE_KEY_USUARIO?: string
    INVITE_STATUS?: boolean
    LOGIN?: boolean
    CATEGORY?: string
    VISITA?: string
    PET?: boolean
    KEY_CONDOMINIO?: string
}
