"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "./use-auth"
import type { Database } from "@/lib/database.types"

type Restaurante = Database["public"]["Tables"]["restaurantes"]["Row"]
type RestauranteInsert = Database["public"]["Tables"]["restaurantes"]["Insert"]
type RestauranteUpdate = Database["public"]["Tables"]["restaurantes"]["Update"]

export function useRestaurantes() {
  const { user } = useAuth()
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([])
  const [restauranteActual, setRestauranteActual] = useState<Restaurante | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar restaurantes del usuario
  const fetchRestaurantes = async () => {
    if (!user) {
      setLoading(false)
      setRestaurantes([])
      setRestauranteActual(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("Fetching restaurantes for user:", user.id)

      const { data, error } = await supabase
        .from("restaurantes")
        .select("*")
        .eq("user_id", user.id)
        .eq("activo", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching restaurantes:", error)
        setError(error.message)
        return
      }

      console.log("Restaurantes fetched:", data)
      setRestaurantes(data || [])

      // Si hay restaurantes, seleccionar el primero como actual
      if (data && data.length > 0) {
        setRestauranteActual(data[0])
      } else {
        setRestauranteActual(null)
      }
    } catch (err) {
      console.error("Error in fetchRestaurantes:", err)
      setError("Error al cargar restaurantes")
    } finally {
      setLoading(false)
    }
  }

  // Crear nuevo restaurante
  const crearRestaurante = async (restauranteData: Omit<RestauranteInsert, "user_id">) => {
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    try {
      setError(null)

      console.log("Creating restaurante with data:", restauranteData)

      const { data, error } = await supabase
        .from("restaurantes")
        .insert([
          {
            ...restauranteData,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error creating restaurante:", error)
        throw new Error(error.message)
      }

      console.log("Restaurante creado:", data)

      // Actualizar la lista
      await fetchRestaurantes()

      return data
    } catch (err) {
      console.error("Error in crearRestaurante:", err)
      throw err
    }
  }

  // Actualizar restaurante
  const actualizarRestaurante = async (id: string, updates: RestauranteUpdate) => {
    try {
      setError(null)

      const { data, error } = await supabase.from("restaurantes").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("Error updating restaurante:", error)
        throw new Error(error.message)
      }

      console.log("Restaurante actualizado:", data)

      // Actualizar la lista
      await fetchRestaurantes()

      return data
    } catch (err) {
      console.error("Error in actualizarRestaurante:", err)
      throw err
    }
  }

  // Eliminar restaurante (marcar como inactivo)
  const eliminarRestaurante = async (id: string) => {
    try {
      setError(null)

      const { error } = await supabase.from("restaurantes").update({ activo: false }).eq("id", id)

      if (error) {
        console.error("Error deleting restaurante:", error)
        throw new Error(error.message)
      }

      console.log("Restaurante eliminado:", id)

      // Actualizar la lista
      await fetchRestaurantes()
    } catch (err) {
      console.error("Error in eliminarRestaurante:", err)
      throw err
    }
  }

  // Seleccionar restaurante actual
  const seleccionarRestaurante = (restaurante: Restaurante) => {
    setRestauranteActual(restaurante)
  }

  // Cargar datos al montar el componente o cuando cambie el usuario
  useEffect(() => {
    fetchRestaurantes()
  }, [user])

  return {
    restaurantes,
    restauranteActual,
    loading,
    error,
    crearRestaurante,
    actualizarRestaurante,
    eliminarRestaurante,
    seleccionarRestaurante,
    refetch: fetchRestaurantes,
  }
}
