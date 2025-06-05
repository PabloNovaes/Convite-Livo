export const formatInput = (e: React.ChangeEvent<HTMLInputElement>, formatter: (value: string) => string) => {
    e.target.value = formatter(e.target.value)
}

export const formatUppercase = (value: string) => {
    return value.toLowerCase().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export const formatPhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
        return phone;
    }
}

export const formatCPF = (value: string) => {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d{3})?(\d{3})?(\d{2})?/, (_, p1, p2, p3, p4) => {
            let result = p1
            if (p2) result += `.${p2}`
            if (p3) result += `.${p3}`
            if (p4) result += `-${p4}`
            return result
        })
}

export const formatBirthDate = (value: string) => {
    let valor = value.replace(/\D/g, '');

    if (valor.length > 2) valor = valor.slice(0, 2) + '/' + valor.slice(2);
    if (valor.length > 5) valor = valor.slice(0, 5) + '/' + valor.slice(5, 9);

    return valor;
}

export const formatRG = (value: string) => {
    const cleaned = value.replace(/[^0-9a-zA-Z]/g, "");

    // Se houver letras no meio (antes do último caractere), bloqueia
    const middle = cleaned.slice(0, -1);
    if (/[a-zA-Z]/.test(middle)) {
        return cleaned.replace(/[^0-9]/g, "") // remove tudo que não for número
            .slice(0, 9) // até 9 dígitos
            .replace(/^(\d{2})(\d{3})(\d{3})(\d{0,2})?$/, (_, p1, p2, p3, p4) => {
                let result = `${p1}.${p2}.${p3}`;
                if (p4) result += `-${p4}`;
                return result;
            });
    }

    const lastChar = cleaned.at(-1);

    // Se termina com uma letra e tem exatamente 8 números antes
    if (lastChar && /[a-zA-Z]/.test(lastChar)) {
        const numbers = cleaned.slice(0, -1).replace(/[^0-9]/g, "").slice(0, 8);
        if (numbers.length < 8) return cleaned; // não formata ainda
        return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}-${lastChar.toUpperCase()}`;
    }

    // Se não termina com letra, aceita até 9 dígitos numéricos
    const numbers = cleaned.replace(/[^0-9]/g, "").slice(0, 10);
    return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,2})?$/, (_, p1, p2, p3, p4) => {
        let result = `${p1}.${p2}.${p3}`;
        if (p4) result += `-${p4}`;
        return result;
    });
};



export const formatPlate = (plate: string): string => {
    const cleaned = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');

    const currentPlateFormat = /^([A-Z]{3})([0-9]{1})([A-Z]{1})([0-9]{2})$/;
    const oldPlateFormat = /^([A-Z]{3})([0-9]{4})$/;

    if (currentPlateFormat.test(cleaned)) {
        return cleaned.replace(currentPlateFormat, '$1-$2$3$4');
    } else if (oldPlateFormat.test(cleaned)) {
        return cleaned.replace(oldPlateFormat, '$1-$2');
    }

    return cleaned;
};

export const getUsDate = (date: string) => {
    const [day, mounth, year] = date.split("/")
    return `${year}-${mounth}-${day}`
}

export const formatDate = (date: string) => {
    const [datePart, timePart] = date.split(" ");

    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    return new Date(year, month - 1, day, hours, minutes, seconds).toLocaleString("pt-BR", {
        dateStyle: "long", timeStyle: "short"
    })
}

export const dateFormater = (dateString: string) => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date)
}

export const isToday = (day: string) => {
    const today = new Date().toLocaleDateString("pt-BR", { weekday: "long" })
    return day.toLowerCase() === today
}

export const formatTimeRange = (startTime: string, endTime: string) => {
    if (startTime === "Closed" || endTime === "Closed") {
        return "Closed"
    }
    return `${startTime} - ${endTime}`
}

export const toSnakeCase = (value: string) => (
    value
        .replace(/\s+/g, '_')
        .replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
        .replace(/__+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase()
)


export const formatPeriod = (init: string, end: string) => {
    if (!init && !end) return

    const parse = (str: string) => {
        const [data, hora] = str.split(' ')
        const [dia, mes, ano] = data.split('/')
        const [h, m] = hora.split(':')
        return new Date(Number(ano), Number(mes) - 1, Number(dia), Number(h), Number(m))
    }

    const formatter = new Intl.DateTimeFormat("pt-BR", {
        dateStyle: 'short',
        timeStyle: 'short'
    })

    const inicioFormatado = formatter.format(parse(init))
    const fimFormatado = formatter.format(parse(end))

    return `${inicioFormatado} até ${fimFormatado}`
}


export function generateInviteMessage({
    qrcode, CONVIDADO, CONDOMINIO, DESC_ENDERECO, DATA_CONVITE
}: {
    qrcode: string,
    CONVIDADO: string,
    CONDOMINIO: string,
    DESC_ENDERECO: string,
    DATA_CONVITE: string
}) {
    const [date, time] = DATA_CONVITE.split(" ")
    const [day, mounth, year] = date.split("/")

    return `
  🎉 *Você está convidado!* 🎉
  
👤 *Convidado:* ${CONVIDADO}  
🏢 *Condominio:* ${CONDOMINIO}  
📍 *Local:* ${DESC_ENDERECO}  
📅 *Data:* ${day}/${mounth}/${year}  
🕛 *Horário:* ${time.split(":")[0]}:${time.split(":")[1]}
  
📸 *Confira seu QR Code:*  
  ${qrcode}
    
🔗 *Saiba mais:* http://www.livoapp.com.br
    `;
}

export function generateCompanionInviteMessage({
    CONDOMINIO,
    DESC_ENDERECO,
    DATA_CONVITE,
    link
}: {
    CONDOMINIO: string,
    DESC_ENDERECO: string,
    DATA_CONVITE: string,
    link: string
}) {
    const [date, time] = DATA_CONVITE.split(" ");
    const [day, month, year] = date.split("/");

    return `
🎉 *Convite Especial!* 🎉

👋 *Você está convidado para ir como meu acompanhante ao*  
🏢 *${CONDOMINIO}*  
📍 *Local:* ${DESC_ENDERECO}  
📅 *Data:* ${day}/${month}/${year}  
🕛 *Horário:* ${time.split(":")[0]}:${time.split(":")[1]}

🔗 *Para facilitar seu acesso, cadastre-se como acompanhante usando o link abaixo:*  
${link}

🔗 *Saiba mais sobre o condomínio:* http://www.livoapp.com.br
    `;
}
