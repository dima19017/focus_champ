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
  username: z.string().min(1, "Введите логин"),
  password: z.string().min(1, "Введите пароль"),
})

export default function LoginPage() {
  const [error, setError] = useState("")
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data: any) => {
    setError("")
    const r = await signIn("credentials", { username: data.username, password: data.password, redirect: false })
    if (r?.error) { setError("Неверный логин или пароль"); return }
    window.location.href = "/dashboard"
  }

  return (
    <div className="flex h-full items-center justify-center px-4">
      <Card className="w-full max-w-sm -mt-16">
        <CardHeader className="text-center">
          <CardTitle>Вход</CardTitle>
          <CardDescription>Войдите в свой аккаунт</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div><Input placeholder="Логин" autoComplete="username" {...register("username")} />
              {errors.username && <p className="mt-1 text-sm text-destructive">{errors.username.message as string}</p>}</div>
            <div><Input type="password" placeholder="Пароль" autoComplete="current-password" {...register("password")} />
              {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message as string}</p>}</div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Входим..." : "Войти"}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Нет аккаунта? <Link href="/register" className="text-primary hover:underline">Зарегистрироваться</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
