/**
 * Hook híbrido para gestión de menús
 * Usa el MenuService (Prisma) para operaciones CRUD y mantiene compatibilidad con el hook existente
 */

"use client"

import { useState, useEffect } from "react"
import { menuService, type MenuInput, type MenuUpdate } from "@/lib/services/menu-service"
import type { Menu } from "@prisma/client"

export interface UseMenusHybridReturn {
  menus: Menu[]
  loading: boolean
  error: string | null
  crearMenu: (menuData: MenuInput) => Promise<void>
  actualizarMenu: (id: string, menuData: MenuUpdate) => Promise<void>
  eliminarMenu: (id: string) => Promise<void>
  buscarMenus: (filters: {
    categoria?: string
    disponible?: boolean
    search?: string
    priceRange?: { min: number; max: number }
  }) => Promise<void>
  getMenuStats: () => Promise<{
    totalMenus: number
    menusByCategory: { categoria: string; count: number }[]
    averagePrice: number
  } | null>
  reloadMenus: () => Promise<void>
}

export function useMenusHybrid(restauranteId: string): UseMenusHybridReturn {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar menús al montar el componente
  const loadMenus = async () => {
    try {
      setLoading(true)
      setError(null)
      const menusData = await menuService.getMenusByRestaurant(restauranteId)
      setMenus(menusData)
    } catch (err) {
      console.error("Error loading menus:", err)
      setError("Error al cargar los menús")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (restauranteId) {
      loadMenus()
    }
  }, [restauranteId])

  // Suscribirse a cambios en tiempo real (Supabase)
  useEffect(() => {
    if (!restauranteId) return

    const subscription = menuService.subscribeToMenuChanges(restauranteId, (payload) => {
      console.log('Real-time menu change:', payload)
      
      // Recargar menús cuando hay cambios
      loadMenus()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [restauranteId])

  const crearMenu = async (menuData: MenuInput): Promise<void> => {
    try {
      setError(null)
      const newMenu = await menuService.createMenu(restauranteId, menuData)
      
      // Actualizar estado local inmediatamente
      setMenus((prev) => [newMenu, ...prev])
    } catch (err) {
      console.error("Error creating menu:", err)
      setError("Error al crear el menú")
      
      // En caso de error, recargar para mantener consistencia
      await loadMenus()
      throw err
    }
  }

  const actualizarMenu = async (id: string, menuData: MenuUpdate): Promise<void> => {
    try {
      setError(null)
      const updatedMenu = await menuService.updateMenu(id, menuData)
      
      // Actualizar estado local
      setMenus((prev) =>
        prev.map((menu) => (menu.id === id ? updatedMenu : menu))
      )
    } catch (err) {
      console.error("Error updating menu:", err)
      setError("Error al actualizar el menú")
      
      // En caso de error, recargar para mantener consistencia
      await loadMenus()
      throw err
    }
  }

  const eliminarMenu = async (id: string): Promise<void> => {
    try {
      setError(null)
      await menuService.deleteMenu(id)
      
      // Actualizar estado local
      setMenus((prev) => prev.filter((menu) => menu.id !== id))
    } catch (err) {
      console.error("Error deleting menu:", err)
      setError("Error al eliminar el menú")
      
      // En caso de error, recargar para mantener consistencia
      await loadMenus()
      throw err
    }
  }

  const buscarMenus = async (filters: {
    categoria?: string
    disponible?: boolean
    search?: string
    priceRange?: { min: number; max: number }
  }): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const filteredMenus = await menuService.searchMenus(restauranteId, filters)
      setMenus(filteredMenus)
    } catch (err) {
      console.error("Error searching menus:", err)
      setError("Error al buscar menús")
    } finally {
      setLoading(false)
    }
  }

  const getMenuStats = async () => {
    try {
      return await menuService.getMenuStats(restauranteId)
    } catch (err) {
      console.error("Error getting menu stats:", err)
      setError("Error al obtener estadísticas")
      return null
    }
  }

  const reloadMenus = async (): Promise<void> => {
    await loadMenus()
  }

  return {
    menus,
    loading,
    error,
    crearMenu,
    actualizarMenu,
    eliminarMenu,
    buscarMenus,
    getMenuStats,
    reloadMenus,
  }
}