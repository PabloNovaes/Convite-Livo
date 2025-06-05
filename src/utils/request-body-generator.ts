import { ROUTE_KEYS } from "@/constants/invite";
import { uploadImage, uploadVehicle } from "@/form.config";
import { getUsDate } from "./formatters";

export const generateRequestBody = async (ROUTE_KEY: string, {
    formData, RECORRENTE, token, userId
}: {
    formData: Record<string, string>, RECORRENTE: boolean, token: string, userId: string
}) => {
    const { countryCode, areaCode, phoneNumber } = formData

    let body

    switch (ROUTE_KEY) {
        case ROUTE_KEYS.COMMON_INVITE_KEY:
            body = {
                request: RECORRENTE ? "set_login_visita" : "cadastra_convite",
                nome: `${formData["nome"]} ${formData["sobrenome"]}`.trim(),
                estrangeiro: formData.estrangeiro === "true" ? 1 : 0,
                convite: token,
                ...(formData.password && { senha: formData.password }),
                ...(formData.data_nascimento && { data_nascimento: getUsDate(formData.data_nascimento) }),
                ...(areaCode && phoneNumber && { telefone: `${areaCode}${phoneNumber.replace("-", "")}` }),
                ...(countryCode && { ddi: countryCode }),
                ...(formData.foto && { url: await uploadImage(formData.foto, "invite") }),
                ...(formData.cnh && { cnh: formData.cnh }),
                ...(formData.placa && {
                    veiculo: await uploadVehicle(formData.placa),
                    placa: formData.placa?.replace(/[^a-zA-Z0-9]/g, ""),
                }),
                ...(formData.cpf && formData["estrangeiro"] === "false" && { cpf: formData.cpf?.replace(/\D/g, "") }),
                ...(formData.rg && { rg: formData.rg?.replace(/\D/g, "") }),
                ...(formData.email && { email: formData.email }),
                ...(formData["profissao"] && { desc_profissao: formData["profissao"] }),
                ...(formData.passaporte && formData["estrangeiro"] === "true" && { passaporte: formData.passaporte }),
            }
            break
        case ROUTE_KEYS.RESIDENT_REGISTER_KEY:
            body = {
                "request": "set_login_usuario",
                "usuario": userId,
                "senha": formData["password"],
                "cpf": formData["cpf"],
                "email": formData["email"],
                ...(areaCode && phoneNumber && { telefone: `${areaCode}${phoneNumber.replace("-", "")}` }),
                "tipo": 3,
                "convite": token,
                ...(formData.foto && { "url": await uploadImage(formData.foto, "login") })
            }
            break
    }

    return JSON.stringify(body)
}