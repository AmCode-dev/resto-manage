"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/hooks/use-auth"
import { useRestaurantes } from "@/hooks/use-restaurantes"
import type { InventarioBebida, InventarioBebidaInsert, InventarioBebidaUpdate } from "@/lib/database.types"

export function useInventarioBebidas() {
  const [inventario, setInventario] = useState<InventarioBebida[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { restauranteActual } = useRestaurantes()

  // Cargar inventario
  const cargarInventario = async () => {
    if (!user || !restauranteActual) {
      setInventario([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from("inventario_bebidas")
        .select("*")
        .eq("restaurante_id", restauranteActual.id)
        .order("nombre", { ascending: true })

      if (supabaseError) {
        throw supabaseError
      }

      setInventario(data || [])
    } catch (err) {
      console.error("Error cargando inventario:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  // Crear producto
  const crearProducto = async (producto: Omit<InventarioBebidaInsert, "restaurante_id">) => {
    if (!restauranteActual) {
      throw new Error("No hay restaurante seleccionado")
    }

    try {
      const { data, error: supabaseError } = await supabase
        .from("inventario_bebidas")
        .insert({
          ...producto,
          restaurante_id: restauranteActual.id,
        })
        .select()
        .single()

      if (supabaseError) {
        throw supabaseError
      }

      setInventario((prev) => [...prev, data])
      return data
    } catch (err) {
      console.error("Error creando producto:", err)
      throw err
    }
  }

  // Actualizar producto
  const actualizarProducto = async (id: string, updates: InventarioBebidaUpdate) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from("inventario_bebidas")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (supabaseError) {
        throw supabaseError
      }

      setInventario((prev) => prev.map((item) => (item.id === id ? data : item)))
      return data
    } catch (err) {
      console.error("Error actualizando producto:", err)
      throw err
    }
  }

  // Eliminar producto
  const eliminarProducto = async (id: string) => {
    try {
      const { error: supabaseError } = await supabase.from("inventario_bebidas").delete().eq("id", id)

      if (supabaseError) {
        throw supabaseError
      }

      setInventario((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      console.error("Error eliminando producto:", err)
      throw err
    }
  }

  // Actualizar stock
  const actualizarStock = async (id: string, nuevoStock: number) => {
    return actualizarProducto(id, { stock: nuevoStock })
  }

  // Obtener productos por categoría
  const obtenerPorCategoria = (categoria: string) => {
    return inventario.filter((item) => item.categoria === categoria)
  }

  // Obtener productos con stock bajo
  const obtenerStockBajo = () => {
    return inventario.filter((item) => item.estado === "bajo")
  }

  // Obtener productos agotados
  const obtenerAgotados = () => {
    return inventario.filter((item) => item.estado === "agotado")
  }

  // Obtener productos vencidos
  const obtenerVencidos = () => {
    return inventario.filter((item) => item.estado === "vencido")
  }

  // Obtener estadísticas
  const obtenerEstadisticas = () => {
    const total = inventario.length
    const stockBajo = obtenerStockBajo().length
    const agotados = obtenerAgotados().length
    const vencidos = obtenerVencidos().length
    const valorTotal = inventario.reduce((total, item) => total + item.precio_unidad * item.stock, 0)

    return {
      total,
      stockBajo,
      agotados,
      vencidos,
      valorTotal,
      normal: total - stockBajo - agotados - vencidos,
    }
  }

  // Buscar productos
  const buscarProductos = (termino: string) => {
    const terminoLower = termino.toLowerCase()
    return inventario.filter(
      (item) =>
        item.nombre.toLowerCase().includes(terminoLower) ||
        item.categoria.toLowerCase().includes(terminoLower) ||
        item.proveedor?.toLowerCase().includes(terminoLower) ||
        item.codigo_barras?.toLowerCase().includes(terminoLower),
    )
  }

  // Obtener categorías únicas
  const obtenerCategorias = () => {
    const categorias = [...new Set(inventario.map((item) => item.categoria))]
    return categorias.sort()
  }

  // Obtener bebidas alcohólicas
  const obtenerAlcoholicas = () => {
    return inventario.filter((item) => (item.graduacion_alcoholica || 0) > 0)
  }

  // Obtener bebidas sin alcohol
  const obtenerSinAlcohol = () => {
    return inventario.filter((item) => (item.graduacion_alcoholica || 0) === 0)
  }

  // Cargar inventario cuando cambie el usuario o restaurante
  useEffect(() => {
    cargarInventario()
  }, [user, restauranteActual])

  return {
    inventario,
    loading,
    error,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    actualizarStock,
    obtenerPorCategoria,
    obtenerStockBajo,
    obtenerAgotados,
    obtenerVencidos,
    obtenerEstadisticas,
    buscarProductos,
    obtenerCategorias,
    obtenerAlcoholicas,
    obtenerSinAlcohol,
    recargar: cargarInventario,
  }
}
