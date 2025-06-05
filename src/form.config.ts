import { BASE_URL } from "./api.config";

export const headers = {
    redirect: "convite",
    authorization: "hash"
};

export const uploadVehicle = async (plate: string) => {
    try {
        const res = await fetch(`${BASE_URL}/convite`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                "request": "set_veiculo",
                "placa": plate.replace(/[^a-zA-Z0-9]/g, "")
            })
        })
        const data = await res.json()
        return data["KEY_VEICULO"]
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(err.message)
        }
    }
}

export const uploadImage = async (image: string, repo: "login" | "invite" | "pet") => {
    const IMAGE_REPOS = {
        login: "292d4b163717b102f4c82d957a0fe965e6585bad",
        invite: "80b3d62c5cd5f636540a30544481e20232b6b1b0",
        pet: "12beddd4d7f0bdd7d0854e428df36600d11fe6be"
    }
    try {
        const res = await fetch(`${BASE_URL}/convite`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                "request": "salva_imagem",
                "repositorio": IMAGE_REPOS[repo],
                "imagem": image
            })
        })

        const data = await res.json()

        if (!data.RESULT) throw new Error(data.MSG ?? data.INFO)

        return data["URL"]
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(err.message)
        }
    }
}