export type ErrorTypes = "empty-invite" | "invalid-invite" | "expired-invite" | "completed-invite" | ""

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
};

export const UPDATE_IMAGE_KEYS = {
    AUTH_KEY: "7063432fed71dbbba186b5e5fe2ca5b08b1d20bd",
    NO_AUTH_KEY: "599c8e7234e7ef6d152582fdeea67e6c3dd3d446"
}

export const REGISTER_USER_FIELDS = [
    { "CAMPO": "SENHA" },
    { "CAMPO": "FOTO" },
    { "CAMPO": "CPF" },
    { "CAMPO": "EMAIL" },
    { "CAMPO": "TELEFONE" }
];


export const errorMessages: Record<string, ErrorInviteTypes> = {
    "empty-invite": {
        title: "Parece que seu convite está vazio",
        description: "Notamos a ausência de um convite valido na sua URL, entre em contato com a pessoa que te forneceu o link para mais detalhes."
    },
    "invalid-invite": {
        title: "Convite inválido",
        description: "O convite que você está tentando usar não é válido ou não foi encontrado. Solicite um novo à pessoa que lhe enviou o link."
    },
    "expired-invite": {
        title: "Parece que seu convite expirou",
        description: "O convite na sua URL não é mais válido. Por favor, entre em contato com a pessoa que te forneceu o link para obter um novo convite."
    },
    "completed-invite": {
        title: "Esse convite já foi preenchido",
        description: "Parece que o convite que está tentando acessar já foi preenchido. Será necessario solicitar um novo"
    },
    "offline": {
        title: "Parece que você está desconectado",
        description: "Conecte a uma rede de internete para poder continuar"
    }
}