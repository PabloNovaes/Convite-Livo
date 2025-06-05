interface Props extends Omit<RequestInit, 'body'> {
    body?: Record<string, string | number | boolean>;
    endpoint?: string
}

const debug = false

// export const isLocal = [
//     "https://livo-convite.vercel.app",
//     "http://localhost",
//     "http://192.168",
//     "loca.lt"
// ].some(env => window.location.href.startsWith(env))

// const environment = isLocal
//     ? 
//     : "https://app.applivo.com.br/api_2_0/index.php"

export const DOMAIN = "https://convite-livo.vercel.app/"

export const BASE_URL = debug ? "https://app.applivo.com.br/api_2_0/homologacao.php" : "https://app.applivo.com.br/api_2_0/index.php"

export const BASE_HEADERS = {
    "Content-Type": "application/json",
    "redirect": "visita",
    "Authorization": "hash"
}

export const callApi = async (method: 'GET' | 'POST', { body, headers, endpoint }: Props) => {
    try {
        const req = await fetch(endpoint ?? BASE_URL, {
            method,
            body: JSON.stringify(body),
            headers: {
                ...BASE_HEADERS,
                ...(headers && headers)
            }
        })
        const res = await req.json()
        return res
    } catch (err) {
        console.log(err);
    }
}
