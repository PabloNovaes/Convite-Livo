import logo from "@/../public/letter-logo.svg"
import { callApi } from "@/api.config"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SaveButton } from "@/components/ui/save-button"
import { usePromise } from "@/hooks/use-promise"
import { useAuth } from "@/hooks/visitor-area/use-auth"
import { containerVariants, itemVariants } from "@/motion.config"
import { errorToastDispatcher } from "@/utils/error-toast-dispatcher"
import { formatCPF, formatInput } from "@/utils/formatters"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeSlash, LockKey, UserCircle } from "@phosphor-icons/react"
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group"
import c from "js-cookie"
import { motion } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { type ChangeEvent, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

export const radioStyles =
  "text-sm border rounded-full p-2 bg-[#181818]/60 px-5 cursor-pointer transition-all data-[state=checked]:border-[#5c307e] data-[state=checked]:bg-[#5c307e]/20 data-[state=checked]:ring-[#5c307e]/40 data-[state=checked]:ring-[3px]"

export function Login() {
  const [loading, init] = usePromise()
  const [showPass, setShowPass] = useState(false)
  const [isForeign, setIsForeign] = useState(false)
  const { setData } = useAuth()

  // const { setData } = useAuth()
  const nav = useRouter()

  const formSchema = z.object({
    isForeign: z.enum(["true", "false"], { message: "Deve selecionar uma das opções" }),
    document: z.string({ message: "O documento é obrigatório" }).superRefine((val, ctx) => {
      if (isForeign) {
        const passportRegex = /^[a-zA-Z0-9]+$/
        if (!passportRegex.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Formato de passaporte inválido",
          })
        }
      } else {
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
        if (!cpfRegex.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "CPF deve estar no formato 123.456.789-10",
          })
        }
      }
    }),
    password: z.string({ message: "Senha é obrigatoria" }).nonempty(),
  })

  type UserFormValue = z.infer<typeof formSchema>

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isForeign: "false",
    },
  })

  const onSubmit = async () => {
    init(async () => {
      try {
        const { document, password, isForeign } = form.getValues()

        const body = {
          request: "login_visita",
          senha: password,
          tipo: 1,
          estrangeiro: isForeign ? 1 : 0,
          ...(isForeign === "true" ? { cpf: document } : { cpf: document.replace(/\D/g, "") }),
        }

        const data = await callApi("POST", { body })

        if (!data["RESULT"]) throw new Error(data["INFO"] || data["MSG"])


        const getUserData = await callApi("POST", {
          body: {
            request: "get_perfil_visitante",
            tipo: "2"
          },
          headers: {
            Authorization: `Bearer ${data["TOKEN"]}`
          }
        })

        if (!getUserData["RESULT"]) throw new Error(getUserData["INFO"] || getUserData["MSG"])

        c.set("token", data["TOKEN"])
        setData({ ...getUserData, TOKEN: data["TOKEN"] })
        nav.push("/visitante/home")
      } catch (err) {
        errorToastDispatcher(err)
      }
    })
  }

  return (
    <>
      <div className="flex h-full items-center p-4 relative z-10 max-w-[450px]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mx-auto flex w-full flex-col justify-center space-y-6"
        >
          <div className="flex flex-col gap-5">
            <motion.img
              variants={itemVariants} initial='hidden' animate={{
                opacity: .4,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 24,
                },
              }} exit='hidden'
              src={logo || "/placeholder.svg"}
              alt="letter-logo"
              className="h-3 w-fit lg:hidden"
            />
            <motion.h1 variants={itemVariants} className="text-4xl font-medium tracking-tight">
              Preencha o formulario a baixo para acessar área de visitante
            </motion.h1>
          </div>

          <Form {...form}>
            <motion.form
              variants={containerVariants}
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-4"
            >
              <FormField
                control={form.control}
                name="isForeign"
                render={({ field }) => (
                  <FormItem>
                    <motion.div variants={itemVariants}>
                      <FormLabel>Você é estrangeiro?</FormLabel>
                    </motion.div>
                    <FormControl>
                      <motion.div variants={itemVariants}>
                        <RadioGroup
                          required
                          onValueChange={(value) => {
                            field.onChange(value)
                            setIsForeign(value === "true")
                            form.setValue("document", "")
                          }}
                          defaultValue={field.value}
                          className="flex gap-2"
                        >
                          <RadioGroupItem className={radioStyles} value="true">
                            Sim
                          </RadioGroupItem>
                          <RadioGroupItem className={radioStyles} value="false">
                            Não
                          </RadioGroupItem>
                        </RadioGroup>
                      </motion.div>
                    </FormControl>
                    <FormMessage className="text-xs font-light" />
                  </FormItem>
                )}
              />

              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center relative">
                        <FormControl>
                          <Input
                            className="h-12 rounded-xl bg-[#181818]/60 font-light text-sm indent-[26px]"
                            type="text"
                            placeholder={`Digite seu ${form.watch("isForeign") === "true" ? "passaporte (ex: AB123456)" : "CPF (ex: 123.456.789-10)"}`}
                            disabled={loading}
                            value={field.value}
                            maxLength={!isForeign ? 14 : 12}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              formatInput(e, !isForeign ? formatCPF : (value) => value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())
                              form.setValue("document", e.target.value)
                            }}
                          />
                        </FormControl>
                        <UserCircle weight="fill" size={22} className="absolute left-3 text-[#6a6a6a]" />
                      </div>
                      <FormMessage className="text-xs font-light" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center relative">
                        <FormControl>
                          <Input
                            className="h-12 rounded-xl bg-[#181818]/60 font-light text-sm indent-[26px]"
                            type={!showPass ? "password" : "text"}
                            placeholder="Digite sua senha"
                            autoComplete="new-password"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <LockKey weight="fill" size={20} className="absolute left-3 text-[#6a6a6a]" />
                        <button
                          role="button"
                          type="button"
                          className="absolute right-3"
                          onClick={() => setShowPass((prev) => !prev)}
                        >
                          {showPass ? (
                            <Eye size={20} className="text-[#6a6a6a]" />
                          ) : (
                            <EyeSlash size={20} className="text-[#6a6a6a]" />
                          )}
                        </button>
                      </div>
                      <FormMessage className="text-xs font-light" />
                      <Link href={"/visitante/recuperar-senha"} className="text-sm font-airbnb font-light underline">
                        Recuperar senha
                      </Link>
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <SaveButton content="Entrar" state={loading ? "loading" : "initial"} />
              </motion.div>
            </motion.form>
          </Form>

          <motion.p
            variants={itemVariants}
            className="text-muted-foreground px-2.5 text-center text-sm font-light [&_a]:font-light"
          >
            Ao clicar em entrar, você concorda com nossos{" "}
            <a className="hover:text-primary underline underline-offset-1" href="/terms">
              Termos de uso
            </a>{" "}
            e{" "}
            <a className="hover:text-primary underline underline-offset-1" href="/privacy">
              Politica de privacidade
            </a>
          </motion.p>
        </motion.div>
      </div>
    </>
  )
}

