"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase-client"

export interface Empleado {
  id: string
  nombre: string
  email: string
  cargo: string
  telefono?: string
  fecha_contratacion: string
  salario?: number
  activo: boolean
  permisos: {
    pos: boolean
    inventario: boolean
    empleados: boolean
    reportes: boolean
    configuracion: boolean
    reservas: boolean
    menus: boolean
  }
  restaurante_id: string
  user_id: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  empleado: Empleado | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, nombre: string) => Promise<void>
  signOut: () => Promise<void>
  hasPermission: (permiso: keyof Empleado["permisos"]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [empleado, setEmpleado] = useState<Empleado | null>(null)
  const [loading, setLoading] = useState(true)

  // Empleado mock para desarrollo
  const empleadoMock: Empleado = {
    id: "mock-empleado-id",
    nombre: "Administrador Demo",
    email: "admin@demo.com",
    cargo: "Propietario",
    telefono: "+1234567890",
    fecha_contratacion: "2024-01-01",
    salario: 50000,
    activo: true,
    permisos: {
      pos: true,
      inventario: true,
      empleados: true,
      reportes: true,
      configuracion: true,
      reservas: true,
      menus: true,
    },
    restaurante_id: "mock-restaurant-id",
    user_id: "mock-user-id",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  }

  // Función para obtener datos del empleado
  const fetchEmpleado = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("empleados").select("*").eq("user_id", userId).maybeSingle()

      if (error) {
        console.error("Error fetching empleado:", error)
        // En caso de error, usar empleado mock
        setEmpleado(empleadoMock)
        return
      }

      if (data) {
        // Asegurar que los permisos estén correctamente estructurados
        const empleadoData: Empleado = {
          ...data,
          permisos: data.permisos || {
            pos: data.cargo === "Propietario" || data.cargo === "Gerente",
            inventario: data.cargo === "Propietario" || data.cargo === "Gerente",
            empleados: data.cargo === "Propietario",
            reportes: data.cargo === "Propietario" || data.cargo === "Gerente",
            configuracion: data.cargo === "Propietario",
            reservas: true,
            menus: data.cargo === "Propietario" || data.cargo === "Gerente" || data.cargo === "Chef",
          },
        }
        setEmpleado(empleadoData)
      } else {
        // Si no existe empleado, usar mock para desarrollo
        console.log("No empleado found, using mock data for development")
        setEmpleado(empleadoMock)
      }
    } catch (error) {
      console.error("Error in fetchEmpleado:", error)
      // En caso de cualquier error, usar empleado mock
      setEmpleado(empleadoMock)
    }
  }

  // Función para verificar permisos
  const hasPermission = (permiso: keyof Empleado["permisos"]): boolean => {
    if (!empleado) return false
    return empleado.permisos[permiso] || false
  }

  // Función de login
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Supabase auth error:", error)
        throw error
      }

      if (data.user) {
        setUser(data.user)
        await fetchEmpleado(data.user.id)
      }
    } catch (error) {
      console.error("Error in signIn:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Función de registro
  const signUp = async (email: string, password: string, nombre: string): Promise<void> => {
    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
          },
        },
      })

      if (error) {
        console.error("Supabase signup error:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in signUp:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Función de logout
  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Supabase signout error:", error)
        throw error
      }

      setUser(null)
      setEmpleado(null)
    } catch (error) {
      console.error("Error in signOut:", error)
      throw error
    }
  }

  // Efecto para manejar cambios de autenticación
  useEffect(() => {
    let mounted = true

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          if (mounted) {
            setLoading(false)
          }
          return
        }

        if (session?.user && mounted) {
          setUser(session.user)
          await fetchEmpleado(session.user.id)
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      if (!mounted) return

      if (session?.user) {
        setUser(session.user)
        await fetchEmpleado(session.user.id)
      } else {
        setUser(null)
        setEmpleado(null)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const contextValue: AuthContextType = {
    user,
    empleado,
    loading,
    signIn,
    signUp,
    signOut,
    hasPermission,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
