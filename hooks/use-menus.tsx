"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"

export interface Menu {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  imagen?: string
  disponible: boolean
  ingredientes: string[]
  alergenos: string[]
  tiempo_preparacion: number
  calorias?: number
  restaurante_id: string
  created_at: string
  updated_at: string
}

interface MenusStats {
  total: number
  disponibles: number
  noDisponibles: number
  categorias: number
  precioPromedio: number
}

interface UseMenusReturn {
  menus: Menu[]
  categorias: string[]
  loading: boolean
  error: string | null
  stats: MenusStats
  menusFiltrados: Menu[]
  searchTerm: string
  categoriaActiva: string
  setSearchTerm: (term: string) => void
  setCategoriaActiva: (categoria: string) => void
  crearMenu: (menu: Omit<Menu, "id" | "created_at" | "updated_at" | "restaurante_id">) => Promise<void>
  actualizarMenu: (id: string, menu: Partial<Menu>) => Promise<void>
  eliminarMenu: (id: string) => Promise<void>
  getCategorias: () => string[]
  obtenerCategorias: () => string[]
  buscarMenus: (termino: string) => Menu[]
  filtrarPorCategoria: (categoria: string) => Menu[]
}

export function useMenus(): UseMenusReturn {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaActiva, setCategoriaActiva] = useState("todas")

  // Datos de ejemplo para desarrollo
  const menusEjemplo: Menu[] = [
    {
      id: "menu-1",
      nombre: "Hamburguesa Clásica",
      descripcion: "Hamburguesa de carne con lechuga, tomate, cebolla y salsa especial",
      precio: 12.99,
      categoria: "platos-principales",
      imagen: "/placeholder.svg?height=200&width=300&text=Hamburguesa",
      disponible: true,
      ingredientes: ["Carne de res", "Pan de hamburguesa", "Lechuga", "Tomate", "Cebolla", "Salsa especial"],
      alergenos: ["Gluten", "Huevo"],
      tiempo_preparacion: 15,
      calorias: 650,
      restaurante_id: "mock-restaurant-id",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "menu-2",
      nombre: "Ensalada César",
      descripcion: "Ensalada fresca con pollo, crutones, parmesano y aderezo césar",
      precio: 9.99,
      categoria: "entradas",
      imagen: "/placeholder.svg?height=200&width=300&text=Ensalada",
      disponible: true,
      ingredientes: ["Lechuga romana", "Pollo a la parrilla", "Crutones", "Queso parmesano", "Aderezo césar"],
      alergenos: ["Lácteos", "Huevo"],
      tiempo_preparacion: 10,
      calorias: 420,
      restaurante_id: "mock-restaurant-id",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "menu-3",
      nombre: "Tiramisu",
      descripcion: "Postre italiano con café, mascarpone y cacao",
      precio: 6.99,
      categoria: "postres",
      imagen: "/placeholder.svg?height=200&width=300&text=Tiramisu",
      disponible: true,
      ingredientes: ["Mascarpone", "Café espresso", "Bizcochos de soletilla", "Cacao en polvo", "Huevos"],
      alergenos: ["Lácteos", "Huevo", "Gluten"],
      tiempo_preparacion: 5,
      calorias: 380,
      restaurante_id: "mock-restaurant-id",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "menu-4",
      nombre: "Coca Cola",
      descripcion: "Bebida gaseosa refrescante",
      precio: 2.5,
      categoria: "bebidas",
      imagen: "/placeholder.svg?height=200&width=300&text=Coca+Cola",
      disponible: true,
      ingredientes: ["Agua carbonatada", "Azúcar", "Extracto de cola"],
      alergenos: [],
      tiempo_preparacion: 1,
      calorias: 140,
      restaurante_id: "mock-restaurant-id",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "menu-5",
      nombre: "Nachos con Guacamole",
      descripcion: "Nachos crujientes con guacamole casero y jalapeños",
      precio: 7.99,
      categoria: "aperitivos",
      imagen: "/placeholder.svg?height=200&width=300&text=Nachos",
      disponible: false,
      ingredientes: ["Tortillas de maíz", "Aguacate", "Tomate", "Cebolla", "Jalapeños", "Queso cheddar"],
      alergenos: ["Lácteos"],
      tiempo_preparacion: 8,
      calorias: 520,
      restaurante_id: "mock-restaurant-id",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  ]

  // Cargar menús
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from("menus")
          .select("*")
          .order("created_at", { ascending: false })

        if (fetchError) {
          console.error("Error fetching menus:", fetchError)
          // Usar datos de ejemplo si hay error
          setMenus(menusEjemplo)
        } else if (data && data.length > 0) {
          // Procesar datos para asegurar que ingredientes y alergenos sean arrays
          const processedMenus = data.map((menu) => ({
            ...menu,
            ingredientes: Array.isArray(menu.ingredientes) ? menu.ingredientes : [],
            alergenos: Array.isArray(menu.alergenos) ? menu.alergenos : [],
          }))
          setMenus(processedMenus)
        } else {
          // Si no hay datos, usar ejemplos
          console.log("No menus found, using example data")
          setMenus(menusEjemplo)
        }
      } catch (error) {
        console.error("Error in fetchMenus:", error)
        setError("Error al cargar los menús")
        setMenus(menusEjemplo)
      } finally {
        setLoading(false)
      }
    }

    fetchMenus()
  }, [])

  // Obtener categorías únicas
  const getCategorias = (): string[] => {
    const categoriasUnicas = Array.from(new Set(menus.map((menu) => menu.categoria)))
    return categoriasUnicas.length > 0
      ? categoriasUnicas
      : ["platos-principales", "entradas", "postres", "bebidas", "aperitivos"]
  }

  // Alias para compatibilidad
  const obtenerCategorias = getCategorias

  // Calcular estadísticas
  const stats: MenusStats = {
    total: menus.length,
    disponibles: menus.filter((menu) => menu.disponible).length,
    noDisponibles: menus.filter((menu) => !menu.disponible).length,
    categorias: getCategorias().length,
    precioPromedio: menus.length > 0 ? menus.reduce((sum, menu) => sum + menu.precio, 0) / menus.length : 0,
  }

  // Filtrar menús
  const menusFiltrados = menus.filter((meniu) => {
  const menu = meniu ?? '';
    const matchesSearch =
      menu.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoriaActiva === "todas" || menu.categoria === categoriaActiva
    return matchesSearch && matchesCategory
  })

  // Funciones de búsqueda y filtrado
  const buscarMenus = (termino: string): Menu[] => {
    return menus.filter(
      (menu) =>
        menu.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        menu.descripcion.toLowerCase().includes(termino.toLowerCase()),
    )
  }

  const filtrarPorCategoria = (categoria: string): Menu[] => {
    if (categoria === "todas") return menus
    return menus.filter((menu) => menu.categoria === categoria)
  }

  // Funciones CRUD
  const crearMenu = async (
    menuData: Omit<Menu, "id" | "created_at" | "updated_at" | "restaurante_id">,
  ): Promise<void> => {
    try {
      const nuevoMenu: Menu = {
        ...menuData,
        id: `menu-${Date.now()}`,
        restaurante_id: "mock-restaurant-id",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("menus").insert([nuevoMenu])

      if (error) {
        console.error("Error creating menu:", error)
        // Agregar localmente si hay error con la base de datos
        setMenus((prev) => [nuevoMenu, ...prev])
      } else {
        // Recargar menús
        setMenus((prev) => [nuevoMenu, ...prev])
      }
    } catch (error) {
      console.error("Error in crearMenu:", error)
      throw error
    }
  }

  const actualizarMenu = async (id: string, menuData: Partial<Menu>): Promise<void> => {
    try {
      const { error } = await supabase.from("menus").update(menuData).eq("id", id)

      if (error) {
        console.error("Error updating menu:", error)
        // Actualizar localmente si hay error con la base de datos
        setMenus((prev) =>
          prev.map((menu) => (menu.id === id ? { ...menu, ...menuData, updated_at: new Date().toISOString() } : menu)),
        )
      } else {
        // Actualizar localmente
        setMenus((prev) =>
          prev.map((menu) => (menu.id === id ? { ...menu, ...menuData, updated_at: new Date().toISOString() } : menu)),
        )
      }
    } catch (error) {
      console.error("Error in actualizarMenu:", error)
      throw error
    }
  }

  const eliminarMenu = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from("menus").delete().eq("id", id)

      if (error) {
        console.error("Error deleting menu:", error)
        // Eliminar localmente si hay error con la base de datos
        setMenus((prev) => prev.filter((menu) => menu.id !== id))
      } else {
        // Eliminar localmente
        setMenus((prev) => prev.filter((menu) => menu.id !== id))
      }
    } catch (error) {
      console.error("Error in eliminarMenu:", error)
      throw error
    }
  }

  return {
    menus,
    categorias: getCategorias(),
    loading,
    error,
    stats,
    menusFiltrados,
    searchTerm,
    categoriaActiva,
    setSearchTerm,
    setCategoriaActiva,
    crearMenu,
    actualizarMenu,
    eliminarMenu,
    getCategorias,
    obtenerCategorias,
    buscarMenus,
    filtrarPorCategoria,
  }
}
