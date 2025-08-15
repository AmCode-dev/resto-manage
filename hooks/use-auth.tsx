"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase-client"
import { 
  findEmpleadoByUserId, 
  findEmpleadosByEmail, 
  createEmpleadoForUser, 
  associateUserWithEmpleado,
  findPotentialRestaurantsForEmail
} from "@/lib/database-service"

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
  signUp: (email: string, password: string, empleadoInfo?: EmpleadoSignUpInfo) => Promise<void>
  signOut: () => Promise<void>
  hasPermission: (permiso: keyof Empleado["permisos"]) => boolean
}

export interface EmpleadoSignUpInfo {
  nombre: string
  cargo?: string
  telefono?: string
  salario?: number
  restaurante_id?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [empleado, setEmpleado] = useState<Empleado | null>(null)
  const [loading, setLoading] = useState(true)

  // Función para obtener datos del empleado
  const fetchEmpleado = async (userId: string, userEmail?: string) => {
    try {
      console.log('Fetching empleado for user:', userId)
      
      const { empleado, restaurante, error } = await findEmpleadoByUserId(userId)

      if (error) {
        console.error("Error fetching empleado:", error)
        setEmpleado(null)
        return
      }

      if (empleado) {
        console.log('Found empleado:', empleado.nombre, 'Cargo:', empleado.cargo)
        setEmpleado(empleado)
        return
      }

      // Si no existe empleado asociado, buscar empleados con el mismo email
      if (userEmail) {
        console.log('No empleado found, searching by email:', userEmail)
        
        const { empleados: existingEmpleados } = await findEmpleadosByEmail(userEmail)
        
        if (existingEmpleados && existingEmpleados.length > 0) {
          // Si encontramos empleados con el mismo email, asociar con el primero activo
          const activeEmpleado = existingEmpleados.find(emp => emp.estado === 'Activo')
          if (activeEmpleado) {
            console.log('Found existing empleado, associating with user:', activeEmpleado.nombre)
            
            const { success } = await associateUserWithEmpleado(userId, activeEmpleado.id)
            if (success) {
              // Recargar empleado después de asociar
              await fetchEmpleado(userId, userEmail)
              return
            }
          }
        }

        // Si no encontramos empleados existentes, buscar restaurantes potenciales
        const { restaurantes } = await findPotentialRestaurantsForEmail(userEmail)
        
        if (restaurantes && restaurantes.length > 0) {
          // Crear empleado automáticamente en el primer restaurante encontrado
          console.log('Creating new empleado for user in restaurant:', restaurantes[0].nombre)
          
          const { empleado: newEmpleado } = await createEmpleadoForUser({
            nombre: userEmail.split('@')[0], // Usar parte local del email como nombre por defecto
            email: userEmail,
            user_id: userId,
            restaurante_id: restaurantes[0].id
          })

          if (newEmpleado) {
            console.log('Created new empleado:', newEmpleado.nombre)
            setEmpleado(newEmpleado)
            return
          }
        }
      }

      // Si llegamos aquí, no se pudo encontrar o crear un empleado
      console.log("No empleado found and could not create one")
      setEmpleado(null)
      
    } catch (error) {
      console.error("Error in fetchEmpleado:", error)
      setEmpleado(null)
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
        await fetchEmpleado(data.user.id, data.user.email || undefined)
      }
    } catch (error) {
      console.error("Error in signIn:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Función de registro
  const signUp = async (email: string, password: string, empleadoInfo?: EmpleadoSignUpInfo): Promise<void> => {
    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: empleadoInfo?.nombre || email.split('@')[0],
            cargo: empleadoInfo?.cargo,
            telefono: empleadoInfo?.telefono,
          },
        },
      })

      if (error) {
        console.error("Supabase signup error:", error)
        throw error
      }

      // Si el usuario se registra exitosamente y hay información de empleado,
      // el empleado se creará automáticamente cuando se confirme el email
      // y se ejecute fetchEmpleado en el hook de auth state change

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
          await fetchEmpleado(session.user.id, session.user.email || undefined)
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
        await fetchEmpleado(session.user.id, session.user.email || undefined)
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
