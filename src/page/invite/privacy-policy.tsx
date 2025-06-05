import { Backpage } from "@/components/ui/back-page";
import { motion } from "framer-motion";

export function PrivacyPolicy() {
    return (
        <motion.section
            className="h-full flex gap-4 flex-col w-full p-8 max-w-4xl m-auto text-white z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeIn" }}
        >
            <header className=" flex gap-4 items-center">
                <Backpage className="relative m-0" />
                <h1 className="text-xl font-semibold">POLÍTICA DE PRIVACIDADE</h1>
            </header>
            <p>
                A LIVO TECNOLOGIA DA INFORMACAO LTDA ("Empresa") empenha-se continuamente para atender devidamente as exigências referentes à proteção de dados de todos os tipos e a sua privacidade é muito importante para nós.
            </p>

            <h2 className="text-xl font-medium mt-4">ESCOPO</h2>
            <p className="text-white/90">
                Com esse Comunicado de Privacidade, a LIVO TECNOLOGIA DA INFORMACAO LTDA explica quais os dados coletados, bem como a forma que utilizamos e armazenamos.
                Aqui fornecemos aos indivíduos que utilizam nossos serviços de maneira geral, ora denominados "Titular de Dados", informações importantes sobre como a Empresa lida com as suas Informações Pessoais, incluindo usuários, funcionários, etc.
                A Empresa é o Controlador de dados ("Controlador") e responsável por realizar o tratamento de suas Informações Pessoais.
            </p>

            <h2 className="text-xl font-medium mt-4">CATEGORIAS DAS INFORMAÇÕES PESSOAIS TRATADAS</h2>
            <p className="text-white/90">
                O tratamento de Informações Pessoais fornecidas para a empresa compreende as seguintes categorias: Informações pessoais: nome, nome social, data de nascimento, CPF, RG, CNH, endereço, número de telefone, e-mail, fotos, imagens e/ou vídeos, posts individuais em mídia social/discussões [incluindo, mas não limitado a Facebook, Twitter, Instagram, blogs], dados de viagem etc.
            </p>

            <h2 className="text-xl font-medium mt-4">FINALIDADE DO TRATAMENTO E DIVULGAÇÃO DE INFORMAÇÕES PESSOAIS</h2>
            <p className="text-white/90">
                A Empresa precisa usar as informações fornecidas, ou de outro modo, tratar Informações Pessoais:
            </p>
            <ul className="list-disc list-inside ml-4">
                <li>Informações Pessoais: para identificar e confirmar sua identidade para fins de cadastro, atender a solicitações e demandas dos próprios usuários e eventuais dependentes, de órgãos reguladores e/ou autoridades administrativas no cumprimento de obrigações legais, regulatórias ou ordens judiciais; para analisar a utilização do serviço do aplicativo com vistas a melhorar a experiência de usuário;</li>
                <li>Informações sensíveis adicionais: para realizar análise técnica, geração de pareceres, realizar prevenção à fraude.</li>
            </ul>

            <p className="mt-4">
                De acordo com disposições legais e regulatórias, e também como premissa para a execução dos serviços pela Empresa, o Titular de Dados é obrigado a nos fornecer suas Informações Pessoais para os propósitos de tratamento descritos acima.
                Caso não o faça, a consequência poderá ser a interrupção da prestação de nossos serviços em seu favor.
            </p>

            <h2 className="text-xl font-medium mt-4">RETENÇÃO DE INFORMAÇÕES PESSOAIS</h2>
            <p className="text-white/90">
                Informações Pessoais serão retidas apenas pelo tempo razoavelmente necessário para o cumprimento das finalidades de tratamento acima estabelecidas, de acordo com a legislação e a regulação aplicáveis.
            </p>

            <h2 className="text-xl font-medium mt-4">SEGURANÇA E INTEGRIDADE DE INFORMAÇÕES PESSOAIS</h2>
            <p className="text-white/90">
                A Empresa mantém medidas de segurança rígida para salvaguardar as Informações Pessoais contra perda, interferência, uso indevido, acesso não autorizado, divulgação, alteração ou destruição.
                A Empresa também mantém procedimentos para ajudar a assegurar que tais informações sejam confiáveis para o uso aos quais se destinam e também para que sejam corretas, completas e atualizadas.
            </p>

            <h2 className="text-xl font-medium mt-4">DIREITOS</h2>
            <p className="text-white/90">
                Os Titulares de Dados podem entrar em contato conosco por meio do e-mail contato@livoapp.com.br para requerer confirmação da existência de tratamento, acesso a Informações Pessoais que possuímos a seu respeito, para corrigir inexatidões, incompletudes ou erros, ou para requerer anonimização, bloqueio ou eliminação de suas Informações Pessoais ou para revogar o consentimento eventualmente dado para a realização do tratamento, de acordo com a legislação aplicável.
            </p>

            <h2 className="text-xl font-medium mt-4">INFORMAÇÃO DE CONTATO</h2>
            <p className="text-white/90">
                Os Titulares de Dados podem levantar quaisquer questões acerca do tratamento de Informações Pessoais por meio do e-mail contato@livoapp.com.br ou acessando quaisquer canais de atendimento.
            </p>
        </motion.section>
    )
}