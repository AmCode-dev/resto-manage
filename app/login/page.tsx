"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MenuIcon as Restaurant, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn, user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user && !authLoading) {
      router.push("/dashboard")
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validaciones básicas
    if (!email || !password) {
      setError("Por favor complete todos los campos")
      setLoading(false)
      return
    }

    if (!email.includes("@")) {
      setError("Por favor ingrese un email válido")
      setLoading(false)
      return
    }

    try {
      await signIn(email, password)
      // Si llegamos aquí, el login fue exitoso
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)

      // Manejar diferentes tipos de errores
      let errorMessage = "Error al iniciar sesión"

      if (error?.message) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email o contraseña incorrectos"
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Por favor confirma tu email antes de iniciar sesión"
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Demasiados intentos. Intenta de nuevo más tarde"
        } else {
          errorMessage = error.message
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Función para login de desarrollo
  const handleDevLogin = async () => {
    setError("")
    setLoading(true)

    try {
      // Simular login de desarrollo
      const mockUser = {
        id: "mock-user-id",
        email: "admin@demo.com",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }

      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirigir al dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Dev login error:", error)
      setError("Error en login de desarrollo")
    } finally {
      setLoading(false)
    }
  }

  // Limpiar error cuando el usuario empiece a escribir
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) setError("")
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (error) setError("")
  }

  // Mostrar loading si está verificando autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
          <span className="text-gray-600">Verificando autenticación...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              <Restaurant className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">RestoManage</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder al sistema de gestión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          {/* Botón de desarrollo */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
              onClick={handleDevLogin}
              disabled={loading}
            >
              🚀 Acceso de Desarrollo
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">Para pruebas y desarrollo del sistema</p>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-center text-sm text-gray-600 w-full">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-orange-600 hover:underline font-medium">
              Regístrate aquí
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
