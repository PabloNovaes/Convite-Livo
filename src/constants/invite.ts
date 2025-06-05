export type ErrorTypes = "empty-invite" | "invalid-invite" | "expired-invite" | "completed-invite" | "updated-image" | "canceled-invite" | ""

interface ErrorInviteTypes {
    title: string;
    description: string;
}

export const INVITE_INFO_MESSAGE = ["Convite Expirado!", "Nenhum convite encontrado!"];

export const ROUTE_KEYS = {
    RESIDENT_REGISTER_KEY: "c0611118c53c9c3ebc3bd3175907b3cdd309e662",
    COMMON_INVITE_KEY: "210f1609ea70180dd8a07804d702c09594121a89",
    UPDATE_IMAGE_KEY: "32dafaf3f3317b8fab1dce681f56cb7c3d005f6a",
    REGISTER_PET_KEY: "1490c2db41f2831752d93a530bb96461e9034d07",
    SELF_REGISTRATION: "11731101c595a0b29e0a2874515f5d9fb2dada81",
};

export const ROUTES_PATH = ["/foto", "/auto", "/pets"]

export const UPDATE_IMAGE_KEYS = {
    AUTH_KEY: "599c8e7234e7ef6d152582fdeea67e6c3dd3d446",
    NO_AUTH_KEY: "7063432fed71dbbba186b5e5fe2ca5b08b1d20bd"
}

export const REGISTER_USER_FIELDS = [
    { "CAMPO": "SENHA" },
    { "CAMPO": "FOTO" },
    { "CAMPO": "CPF" },
    { "CAMPO": "EMAIL" },
    { "CAMPO": "TELEFONE" }
];

export const residentTypes = {
    "PROPRIETARIO": "9d95194b40356d379ef46a260537484b23656813",
    "LOCATARIO": "cb95b6c909ac5ece8d54f3d14d64d03993df5d02",
    "ADMINISTRADOR": "e13395abd504008413108c6e2424955a551f0a7b",
    "RESIDENTE": "01521bdfaa189d9baae5d8a66572d1bae967101c"
};

export const residentLevel = {
    "TITULAR": "b011227723f160e648472df12316a0214c0b2ae9",
    "DEPENDENTE": "5245009b55f188c581964e47a4f14befdc848532"
};


export const errorMessages: Record<string, ErrorInviteTypes> = {
    "empty-invite": {
        title: "Convite não encontrado!",
        description:
            "Não localizamos um convite válido na sua URL. Verifique se o link está correto ou solicite um novo à pessoa que lhe enviou.",
    },
    "invalid-invite": {
        title: "Convite inválido!",
        description:
            "O convite que você tentou acessar não é válido ou não existe. Por favor, confirme o link ou peça um novo para quem lhe enviou.",
    },
    "expired-invite": {
        title: "Seu convite expirou!",
        description:
            "O convite informado não está mais ativo. Entre em contato com a pessoa que gerou o convite para solicitar um novo.",
    },
    "canceled-invite": {
        title: "Convite cancelado!",
        description:
            "Este convite foi cancelado pelo morador. Recomendamos que você entre em contato com o mesmo para mais informações.",
    },
    "completed-invite": {
        title: "Convite já utilizado!",
        description:
            "Este convite já foi utilizado anteriormente. Para continuar, será necessário solicitar um novo.",
    },
    "updated-image": {
        title: "Link de foto já utilizado!",
        description:
            "Parece que você já usou este link para atualizar sua foto. Se desejar fazer uma nova atualização, solicite um novo link.",
    },
};
