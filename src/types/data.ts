export type Address = {
    CONDOMINIO: string;
    ENDERECO: string;
    RESULT: string;
    STATUS: string;
    VISITA: {
        RESULT: string;
        DIA: string;
        FAIXA: string;
        STATUS: boolean;
    }[] | null;
    KEY: string;
    KEY_CONDOMINIO: string;
    BOTAO: boolean;
    ID: string
    RECORRENTE: boolean
    DATA_INI?: string
    DATA_FIM?: string
}

export type Historical = {
    RESULT: string | null;
    EVENTO: string | null;
    ANFITRIAO: string | null;
    DATA_CONVITE: string | null;
    HORA_CONVITE: string | null;
    ADIANTADO: string | null;
    ATRASADO: string | null;
    STATUS_ANTECIPACAO: string | null;
    DESC_STATUS: string | null;
    NOME_CONDOMINIO: string | null;
    ENDERECO: string | null;
}

export type AllHistoric = {
    CONDOMINIO: string
    DATA_ACESSO: string
    ENDERECO: string
    INFO_ACESSO: string
    KEY_STATUS_ACESSO: string
    RESULT: boolean
}

export type AddressFilterOptions = {
    KEY_CONDOMINIO: string
    CONDOMINIO: string
}