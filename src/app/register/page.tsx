"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const schema = z.object({
  username: z.string().min(3, "Минимум 3 символа").max(20).regex(/^[a-zA-Z0-9_]+$/, "Только латиница, цифры и _"),
  password: z.string().min(6, "Минимум 6 символов"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Пароли не совпадают", path: ["confirm"] })

export default function RegisterPage() {
  const [error, setError] = useState("")
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data: any) => {
    setError("")
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: data.username, password: data.password }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error || "Ошибка"); return }

    const result = await signIn("credentials", { username: data.username, password: data.password, redirect: false })
    if (result?.error) { setError("Аккаунт создан, но вход не удался"); return }
    window.location.href = "/dashboard"
  }

  return (
    <div className="flex h-full items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Регистрация</CardTitle>
          <CardDescription>Создайте аккаунт для участия в соревнованиях</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div><Input placeholder="Логин" autoComplete="username" {...register("username")} />
              {errors.username && <p className="mt-1 text-sm text-destructive">{errors.username.message as string}</p>}</div>
            <div><Input type="password" placeholder="Пароль" autoComplete="new-password" {...register("password")} />
              {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message as string}</p>}</div>
            <div><Input type="password" placeholder="Повторите пароль" {...register("confirm")} />
              {errors.confirm && <p className="mt-1 text-sm text-destructive">{errors.confirm.message as string}</p>}</div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Создаём..." : "Зарегистрироваться"}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Уже есть аккаунт? <Link href="/login" className="text-primary hover:underline">Войти</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
