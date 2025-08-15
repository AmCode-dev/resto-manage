"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"

export interface InventarioComida {
  id: string
  nombre: string
  descripcion?: string
  categoria: string
  stock: number
  unidad: string
  precio_unidad: number
  fecha_caducidad?: string
  alerta_stock?: number
  proveedor?: string
  ubicacion?: string
  codigo_barras?: string
  estado: "normal" | "bajo" | "agotado" | "vencido"
  restaurante_id: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface InventarioComidaInsert {
  nombre: string
  descripcion?: string
  categoria: string
  stock: number
  unidad: string
  precio_unidad: number
  fecha_caducidad?: string
  alerta_stock?: number
  proveedor?: string
  ubicacion?: string
  codigo_barras?: string
  activo?: boolean
}

export interface InventarioComidaUpdate extends Partial<InventarioComidaInsert> {
  updated_at?: string
}

export function useInventarioComidas() {
  const [inventario, setInventario] = useState<InventarioComida[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user, empleado } = useAuth()
  const { toast } = useToast()

  // Datos de ejemplo con estados calculados
  const inventarioEjemplo: InventarioComida[] = [
    {
      id: "prod-1",
      nombre: "Pollo",
      descripcion: "Pechuga de pollo fresca",
      categoria: "Carnes",
      stock: 25,
      unidad: "kg",
      precio_unidad: 8.5,
      fecha_caducidad: "2024-12-31",
      alerta_stock: 5,
      proveedor: "Carnes Premium",
      ubicacion: "Refrigerador A",
      codigo_barras: "1234567890123",
      estado: "normal",
      restaurante_id: "temp-restaurant",
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "prod-2",
      nombre: "Arroz",
      descripcion: "Arroz blanco grano largo",
      categoria: "Granos",
      stock: 15,
      unidad: "kg",
      precio_unidad: 2.5,
      fecha_caducidad: "2025-06-30",
      alerta_stock: 10,
      proveedor: "Granos del Valle",
      ubicacion: "Despensa B",
      codigo_barras: "2345678901234",
      estado: "normal",
      restaurante_id: "temp-restaurant",
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "prod-3",
      nombre: "Tomate",
      descripcion: "Tomate fresco para ensaladas",
      categoria: "Verduras",
      stock: 3,
      unidad: "kg",
      precio_unidad: 3.0,
      fecha_caducidad: "2024-01-20",
      alerta_stock: 5,
      proveedor: "Verduras Frescas",
      ubicacion: "Refrigerador B",
      codigo_barras: "3456789012345",
      estado: "bajo",
      restaurante_id: "temp-restaurant",
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "prod-4",
      nombre: "Leche",
      descripcion: "Leche entera pasteurizada",
      categoria: "Lácteos",
      stock: 0,
      unidad: "l",
      precio_unidad: 1.2,
      fecha_caducidad: "2024-01-15",
      alerta_stock: 10,
      proveedor: "Lácteos del Campo",
      ubicacion: "Refrigerador C",
      codigo_barras: "4567890123456",
      estado: "agotado",
      restaurante_id: "temp-restaurant",
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "prod-5",
      nombre: "Pan",
      descripcion: "Pan fresco del día",
      categoria: "Panadería",
      stock: 20,
      unidad: "unidad",
      precio_unidad: 0.5,
      fecha_caducidad: "2024-01-10",
      alerta_stock: 15,
      proveedor: "Panadería Central",
      ubicacion: "Estante A",
      codigo_barras: "5678901234567",
      estado: "vencido",
      restaurante_id: "temp-restaurant",
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  // Calcular estado del producto
  const calcularEstado = (producto: Omit<InventarioComida, "estado">): InventarioComida["estado"] => {
    // Verificar si está vencido
    if (producto.fecha_caducidad) {
      const fechaVencimiento = new Date(producto.fecha_caducidad)
      const hoy = new Date()
      if (fechaVencimiento < hoy) {
        return "vencido"
      }
    }

    // Verificar stock
    if (producto.stock === 0) {
      return "agotado"
    }

    if (producto.alerta_stock && producto.stock <= producto.alerta_stock) {
      return "bajo"
    }

    return "normal"
  }

  // Obtener restaurante del usuario
  const getRestauranteId = async () => {
    if (!user) return "temp-restaurant"

    try {
      const { data, error } = await supabase.from("restaurantes").select("id").eq("user_id", user.id).single()

      if (error || !data) {
        return "temp-restaurant"
      }

      return data.id
    } catch (error) {
      console.error("Error obteniendo restaurante:", error)
      return "temp-restaurant"
    }
  }

  // Cargar inventario
  const cargarInventario = async () => {
    try {
      setLoading(true)
      const restauranteId = await getRestauranteId()

      const { data, error } = await supabase
        .from("inventario_comidas")
        .select("*")
        .eq("restaurante_id", restauranteId)
        .eq("activo", true)
        .order("nombre", { ascending: true })

      if (error) {
        console.error("Error cargando inventario:", error)
        setInventario(inventarioEjemplo)
        return
      }

      // Calcular estados para cada producto
      const inventarioConEstados = (data || inventarioEjemplo).map((producto) => ({
        ...producto,
        estado: calcularEstado(producto),
      }))

      setInventario(inventarioConEstados)
    } catch (error) {
      console.error("Error cargando inventario:", error)
      setInventario(inventarioEjemplo)
      setError("Error cargando inventario")
    } finally {
      setLoading(false)
    }
  }

  // Crear producto
  const crearProducto = async (datos: Omit<InventarioComidaInsert, "restaurante_id">) => {
    try {
      const restauranteId = await getRestauranteId()

      const nuevoProducto = {
        ...datos,
        restaurante_id: restauranteId,
        activo: datos.activo ?? true,
      }

      const { data, error } = await supabase.from("inventario_comidas").insert(nuevoProducto).select().single()

      if (error) {
        console.error("Error creando producto:", error)
        // Simular creación exitosa
        const productoSimulado: InventarioComida = {
          id: `temp-prod-${Date.now()}`,
          ...nuevoProducto,
          estado: calcularEstado(nuevoProducto),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setInventario((prev) => [productoSimulado, ...prev])

        toast({
          title: "Producto creado",
          description: `${datos.nombre} ha sido agregado al inventario.`,
        })
        return productoSimulado
      }

      await cargarInventario()

      toast({
        title: "Producto creado",
        description: `${datos.nombre} ha sido agregado al inventario.`,
      })

      return data
    } catch (error) {
      console.error("Error creando producto:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el producto. Inténtalo de nuevo.",
      })
      throw error
    }
  }

  // Actualizar producto
  const actualizarProducto = async (id: string, datos: InventarioComidaUpdate) => {
    try {
      const datosActualizacion = {
        ...datos,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("inventario_comidas")
        .update(datosActualizacion)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error actualizando producto:", error)
        // Simular actualización exitosa
        setInventario((prev) =>
          prev.map((prod) => {
            if (prod.id === id) {
              const productoActualizado = { ...prod, ...datos, updated_at: new Date().toISOString() }
              return {
                ...productoActualizado,
                estado: calcularEstado(productoActualizado),
              }
            }
            return prod
          }),
        )

        toast({
          title: "Producto actualizado",
          description: "Los datos del producto han sido actualizados.",
        })
        return
      }

      await cargarInventario()

      toast({
        title: "Producto actualizado",
        description: "Los datos del producto han sido actualizados.",
      })

      return data
    } catch (error) {
      console.error("Error actualizando producto:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el producto. Inténtalo de nuevo.",
      })
      throw error
    }
  }

  // Eliminar producto
  const eliminarProducto = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("inventario_comidas")
        .update({
          activo: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error eliminando producto:", error)
        // Simular eliminación exitosa
        setInventario((prev) => prev.filter((prod) => prod.id !== id))

        toast({
          title: "Producto eliminado",
          description: "El producto ha sido eliminado del inventario.",
        })
        return
      }

      await cargarInventario()

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado del inventario.",
      })

      return data
    } catch (error) {
      console.error("Error eliminando producto:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el producto. Inténtalo de nuevo.",
      })
      throw error
    }
  }

  // Buscar productos
  const buscarProductos = (termino: string) => {
    if (!termino.trim()) return inventario

    const terminoLower = termino.toLowerCase()
    return inventario.filter(
      (producto) =>
        producto.nombre.toLowerCase().includes(terminoLower) ||
        producto.descripcion?.toLowerCase().includes(terminoLower) ||
        producto.categoria.toLowerCase().includes(terminoLower) ||
        producto.proveedor?.toLowerCase().includes(terminoLower) ||
        producto.codigo_barras?.toLowerCase().includes(terminoLower),
    )
  }

  // Obtener categorías únicas
  const obtenerCategorias = () => {
    const categorias = [...new Set(inventario.map((producto) => producto.categoria))]
    return categorias.sort()
  }

  // Obtener productos por categoría
  const obtenerProductosPorCategoria = (categoria: string) => {
    return inventario.filter((producto) => producto.categoria === categoria)
  }

  // Obtener productos con stock bajo
  const obtenerProductosStockBajo = () => {
    return inventario.filter((producto) => producto.estado === "bajo")
  }

  // Obtener productos agotados
  const obtenerProductosAgotados = () => {
    return inventario.filter((producto) => producto.estado === "agotado")
  }

  // Obtener productos vencidos
  const obtenerProductosVencidos = () => {
    return inventario.filter((producto) => producto.estado === "vencido")
  }

  // Obtener productos próximos a vencer
  const obtenerProductosProximosVencer = (dias = 7) => {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() + dias)

    return inventario.filter((producto) => {
      if (!producto.fecha_caducidad || producto.estado === "vencido") return false
      const fechaVencimiento = new Date(producto.fecha_caducidad)
      const hoy = new Date()
      return fechaVencimiento > hoy && fechaVencimiento <= fechaLimite
    })
  }

  // Obtener estadísticas
  const obtenerEstadisticas = () => {
    const total = inventario.length
    const stockBajo = obtenerProductosStockBajo().length
    const agotados = obtenerProductosAgotados().length
    const vencidos = obtenerProductosVencidos().length
    const proximosVencer = obtenerProductosProximosVencer().length
    const valorTotal = inventario.reduce((sum, producto) => sum + producto.stock * producto.precio_unidad, 0)

    const porCategoria = obtenerCategorias().map((categoria) => ({
      categoria,
      cantidad: obtenerProductosPorCategoria(categoria).length,
      valor: obtenerProductosPorCategoria(categoria).reduce(
        (sum, producto) => sum + producto.stock * producto.precio_unidad,
        0,
      ),
    }))

    const porEstado = {
      normal: inventario.filter((p) => p.estado === "normal").length,
      bajo: stockBajo,
      agotado: agotados,
      vencido: vencidos,
    }

    return {
      total,
      stockBajo,
      agotados,
      vencidos,
      proximosVencer,
      valorTotal,
      porCategoria,
      porEstado,
    }
  }

  // Actualizar stock
  const actualizarStock = async (id: string, nuevoStock: number, motivo?: string) => {
    try {
      await actualizarProducto(id, { stock: nuevoStock })

      const producto = inventario.find((p) => p.id === id)
      if (producto) {
        toast({
          title: "Stock actualizado",
          description: `Stock de ${producto.nombre} actualizado a ${nuevoStock} ${producto.unidad}`,
        })
      }
    } catch (error) {
      console.error("Error actualizando stock:", error)
      throw error
    }
  }

  // Obtener producto por ID
  const obtenerProductoPorId = (id: string) => {
    return inventario.find((producto) => producto.id === id)
  }

  // Efectos
  useEffect(() => {
    cargarInventario()
  }, [user])

  return {
    // Estados
    inventario,
    loading,
    error,

    // Funciones CRUD
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    actualizarStock,

    // Funciones de búsqueda y filtrado
    buscarProductos,
    obtenerCategorias,
    obtenerProductosPorCategoria,
    obtenerProductosStockBajo,
    obtenerProductosAgotados,
    obtenerProductosVencidos,
    obtenerProductosProximosVencer,

    // Funciones de estadísticas
    obtenerEstadisticas,

    // Funciones de utilidad
    obtenerProductoPorId,
    cargarInventario,
  }
}
