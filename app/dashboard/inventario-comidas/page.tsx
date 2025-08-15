"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { format, parse } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Check, Edit, Plus, Search, Trash2, X, Package, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useInventarioComidas } from "@/hooks/use-inventario-comidas"
import { useRestaurantes } from "@/hooks/use-restaurantes"
import type { InventarioComida, InventarioComidaInsert } from "@/hooks/use-inventario-comidas"

// Constantes
const CATEGORIAS = [
  "Carnes",
  "Verduras",
  "Lácteos",
  "Frutas",
  "Pescados",
  "Condimentos",
  "Granos",
  "Panadería",
  "Otros",
]
const UNIDADES = ["kg", "g", "l", "ml", "unidad", "docena", "caja", "botella", "paquete"]

export default function InventarioComidaPage() {
  const { restauranteActual, loading: loadingRestaurante } = useRestaurantes()
  const {
    inventario,
    loading,
    error,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    obtenerEstadisticas,
    buscarProductos,
    obtenerCategorias,
  } = useInventarioComidas()

  // Estados
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const [productoAEliminar, setProductoAEliminar] = useState<InventarioComida | null>(null)
  const [productoEditando, setProductoEditando] = useState<InventarioComida | null>(null)
  const [nuevoProducto, setNuevoProducto] = useState<Partial<InventarioComidaInsert>>({
    nombre: "",
    categoria: "",
    stock: 0,
    unidad: "",
    precio_unidad: 0,
    fecha_caducidad: format(new Date(), "yyyy-MM-dd"),
    alerta_stock: 5,
    proveedor: "",
    descripcion: "",
    ubicacion: "",
    codigo_barras: "",
  })
  const [fecha, setFecha] = useState<Date | undefined>(new Date())
  const [fechaEdicion, setFechaEdicion] = useState<Date | undefined>(new Date())
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [guardando, setGuardando] = useState(false)

  // Si no hay restaurante configurado
  if (loadingRestaurante) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!restauranteActual) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Restaurante no configurado</h3>
          <p className="text-muted-foreground mb-4">
            Necesitas configurar tu restaurante antes de gestionar el inventario.
          </p>
          <Button asChild>
            <a href="/dashboard/configuracion">Configurar Restaurante</a>
          </Button>
        </div>
      </div>
    )
  }

  // Filtrar productos
  const productosFiltrados = (() => {
    let productos = inventario

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      productos = buscarProductos(busqueda)
    }

    // Filtrar por categoría
    if (filtroCategoria !== "todos") {
      productos = productos.filter((p) => p.categoria === filtroCategoria)
    }

    return productos
  })()

  // Obtener estadísticas
  const estadisticas = obtenerEstadisticas()

  // Obtener categorías disponibles
  const categoriasDisponibles = obtenerCategorias()
  const todasLasCategorias = [...new Set([...CATEGORIAS, ...categoriasDisponibles])].sort()

  // Manejar cambios en el formulario de nuevo producto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const parsedValue = type === "number" ? (value === "" ? 0 : Number.parseFloat(value)) : value

    setNuevoProducto({
      ...nuevoProducto,
      [name]: parsedValue,
    })

    if (errores[name]) {
      setErrores({
        ...errores,
        [name]: "",
      })
    }
  }

  // Manejar cambios en el formulario de edición
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!productoEditando) return

    const { name, value, type } = e.target
    const parsedValue = type === "number" ? (value === "" ? 0 : Number.parseFloat(value)) : value

    setProductoEditando({
      ...productoEditando,
      [name]: parsedValue,
    })

    if (errores[name]) {
      setErrores({
        ...errores,
        [name]: "",
      })
    }
  }

  // Validar formulario
  const validarFormulario = (producto: Partial<InventarioComidaInsert>): boolean => {
    const nuevosErrores: Record<string, string> = {}

    if (!producto.nombre?.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio"
    }

    if (!producto.categoria) {
      nuevosErrores.categoria = "Seleccione una categoría"
    }

    if (producto.stock === undefined || producto.stock < 0) {
      nuevosErrores.stock = "Ingrese un stock válido"
    }

    if (!producto.unidad) {
      nuevosErrores.unidad = "Seleccione una unidad"
    }

    if (producto.precio_unidad === undefined || producto.precio_unidad <= 0) {
      nuevosErrores.precio_unidad = "Ingrese un precio válido"
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  // Guardar nuevo producto
  const guardarProducto = async () => {
    if (!validarFormulario(nuevoProducto)) {
      return
    }

    try {
      setGuardando(true)
      await crearProducto(nuevoProducto as Omit<InventarioComidaInsert, "restaurante_id">)

      setDialogOpen(false)
      resetearFormulario()

      toast({
        title: "Producto añadido",
        description: `${nuevoProducto.nombre} ha sido añadido al inventario.`,
      })
    } catch (error) {
      console.error("Error guardando producto:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el producto. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setGuardando(false)
    }
  }

  // Actualizar producto existente
  const actualizarProductoExistente = async () => {
    if (!productoEditando || !validarFormulario(productoEditando)) {
      return
    }

    try {
      setGuardando(true)
      await actualizarProducto(productoEditando.id, productoEditando)

      setEditDialogOpen(false)
      setProductoEditando(null)
      setErrores({})

      toast({
        title: "Producto actualizado",
        description: `${productoEditando.nombre} ha sido actualizado correctamente.`,
      })
    } catch (error) {
      console.error("Error actualizando producto:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setGuardando(false)
    }
  }

  // Eliminar producto
  const eliminarProductoConfirmado = async () => {
    if (!productoAEliminar) return

    try {
      await eliminarProducto(productoAEliminar.id)

      setDeleteDialogOpen(false)
      setProductoAEliminar(null)

      toast({
        title: "Producto eliminado",
        description: `${productoAEliminar.nombre} ha sido eliminado del inventario.`,
        variant: "destructive",
      })
    } catch (error) {
      console.error("Error eliminando producto:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  // Abrir diálogo de edición
  const abrirEdicion = (producto: InventarioComida) => {
    setProductoEditando({ ...producto })
    if (producto.fecha_caducidad) {
      setFechaEdicion(parse(producto.fecha_caducidad, "yyyy-MM-dd", new Date()))
    }
    setErrores({})
    setEditDialogOpen(true)
  }

  // Abrir diálogo de eliminación
  const abrirEliminacion = (producto: InventarioComida) => {
    setProductoAEliminar(producto)
    setDeleteDialogOpen(true)
  }

  // Resetear formulario
  const resetearFormulario = () => {
    setNuevoProducto({
      nombre: "",
      categoria: "",
      stock: 0,
      unidad: "",
      precio_unidad: 0,
      fecha_caducidad: format(new Date(), "yyyy-MM-dd"),
      alerta_stock: 5,
      proveedor: "",
      descripcion: "",
      ubicacion: "",
      codigo_barras: "",
    })
    setFecha(new Date())
    setErrores({})
  }

  // Cambiar fecha para nuevo producto
  const handleFechaChange = (date: Date | undefined) => {
    setFecha(date)
    if (date) {
      setNuevoProducto({
        ...nuevoProducto,
        fecha_caducidad: format(date, "yyyy-MM-dd"),
      })

      if (errores.fecha_caducidad) {
        setErrores({
          ...errores,
          fecha_caducidad: "",
        })
      }
    }
  }

  // Cambiar fecha para edición
  const handleFechaEdicionChange = (date: Date | undefined) => {
    setFechaEdicion(date)
    if (date && productoEditando) {
      setProductoEditando({
        ...productoEditando,
        fecha_caducidad: format(date, "yyyy-MM-dd"),
      })

      if (errores.fecha_caducidad) {
        setErrores({
          ...errores,
          fecha_caducidad: "",
        })
      }
    }
  }

  // Obtener color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "normal":
        return "bg-green-100 text-green-800"
      case "bajo":
        return "bg-yellow-100 text-yellow-800"
      case "agotado":
        return "bg-red-100 text-red-800"
      case "vencido":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Obtener texto del estado
  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case "normal":
        return "Normal"
      case "bajo":
        return "Stock Bajo"
      case "agotado":
        return "Agotado"
      case "vencido":
        return "Vencido"
      default:
        return estado
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
          <p className="text-muted-foreground">Cargando inventario...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error al cargar inventario</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inventario de Comidas</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar producto..."
            className="pl-8"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="todos" className="space-y-4" value={filtroCategoria} onValueChange={setFiltroCategoria}>
        <ScrollArea className="w-full">
          <div className="flex pb-2 pr-2">
            <TabsList className="flex-nowrap">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              {todasLasCategorias.map((categoria) => (
                <TabsTrigger key={categoria} value={categoria}>
                  {categoria}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </ScrollArea>

        <TabsContent value={filtroCategoria} className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Resumen de Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Total de Productos</div>
                  <div className="text-2xl font-bold">{estadisticas.total}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Stock Bajo</div>
                  <div className="text-2xl font-bold text-yellow-600">{estadisticas.stockBajo}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Agotados</div>
                  <div className="text-2xl font-bold text-red-600">{estadisticas.agotados}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Vencidos</div>
                  <div className="text-2xl font-bold text-gray-600">{estadisticas.vencidos}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Valor Total</div>
                  <div className="text-2xl font-bold">${estadisticas.valorTotal.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Precio/Unidad</TableHead>
                    <TableHead>Fecha Caducidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosFiltrados.length > 0 ? (
                    productosFiltrados.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{item.nombre}</div>
                            {item.codigo_barras && (
                              <div className="text-xs text-muted-foreground">Código: {item.codigo_barras}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.categoria}</TableCell>
                        <TableCell>{item.stock}</TableCell>
                        <TableCell>{item.unidad}</TableCell>
                        <TableCell>${item.precio_unidad.toFixed(2)}</TableCell>
                        <TableCell>
                          {item.fecha_caducidad ? format(new Date(item.fecha_caducidad), "dd/MM/yyyy") : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getEstadoColor(item.estado)}`}
                          >
                            {getEstadoTexto(item.estado)}
                          </div>
                        </TableCell>
                        <TableCell>{item.proveedor || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => abrirEdicion(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => abrirEliminacion(item)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                        {busqueda
                          ? "No se encontraron productos que coincidan con la búsqueda"
                          : "No hay productos en el inventario"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para nuevo producto */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Producto</DialogTitle>
            <DialogDescription>Complete los detalles del producto para añadirlo al inventario.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre del producto */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-base">
                  Nombre del producto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Ej: Pechuga de pollo"
                  value={nuevoProducto.nombre}
                  onChange={handleInputChange}
                  className={cn(errores.nombre && "border-red-500")}
                />
                {errores.nombre && <p className="text-sm text-red-500">{errores.nombre}</p>}
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-base">
                  Categoría <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={nuevoProducto.categoria}
                  onValueChange={(value) => {
                    setNuevoProducto({ ...nuevoProducto, categoria: value })
                    if (errores.categoria) {
                      setErrores({ ...errores, categoria: "" })
                    }
                  }}
                >
                  <SelectTrigger id="categoria" className={cn(errores.categoria && "border-red-500")}>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errores.categoria && <p className="text-sm text-red-500">{errores.categoria}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stock */}
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-base">
                  Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej: 10"
                  value={nuevoProducto.stock}
                  onChange={handleInputChange}
                  className={cn(errores.stock && "border-red-500")}
                />
                {errores.stock && <p className="text-sm text-red-500">{errores.stock}</p>}
              </div>

              {/* Unidad */}
              <div className="space-y-2">
                <Label htmlFor="unidad" className="text-base">
                  Unidad <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={nuevoProducto.unidad}
                  onValueChange={(value) => {
                    setNuevoProducto({ ...nuevoProducto, unidad: value })
                    if (errores.unidad) {
                      setErrores({ ...errores, unidad: "" })
                    }
                  }}
                >
                  <SelectTrigger id="unidad" className={cn(errores.unidad && "border-red-500")}>
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES.map((unidad) => (
                      <SelectItem key={unidad} value={unidad}>
                        {unidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errores.unidad && <p className="text-sm text-red-500">{errores.unidad}</p>}
              </div>

              {/* Precio por unidad */}
              <div className="space-y-2">
                <Label htmlFor="precio_unidad" className="text-base">
                  Precio por unidad <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <Input
                    id="precio_unidad"
                    name="precio_unidad"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={nuevoProducto.precio_unidad}
                    onChange={handleInputChange}
                    className={cn("pl-7", errores.precio_unidad && "border-red-500")}
                  />
                </div>
                {errores.precio_unidad && <p className="text-sm text-red-500">{errores.precio_unidad}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha de caducidad */}
              <div className="space-y-2">
                <Label htmlFor="fecha_caducidad" className="text-base">
                  Fecha de caducidad
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fecha && "text-muted-foreground",
                        errores.fecha_caducidad && "border-red-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fecha ? format(fecha, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={fecha} onSelect={handleFechaChange} initialFocus locale={es} />
                  </PopoverContent>
                </Popover>
                {errores.fecha_caducidad && <p className="text-sm text-red-500">{errores.fecha_caducidad}</p>}
              </div>

              {/* Alerta de stock bajo */}
              <div className="space-y-2">
                <Label htmlFor="alerta_stock" className="text-base">
                  Alerta de stock bajo
                </Label>
                <Input
                  id="alerta_stock"
                  name="alerta_stock"
                  type="number"
                  min="1"
                  placeholder="Ej: 5"
                  value={nuevoProducto.alerta_stock}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground">Cantidad a partir de la cual se marcará como "Bajo"</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Proveedor */}
              <div className="space-y-2">
                <Label htmlFor="proveedor" className="text-base">
                  Proveedor
                </Label>
                <Input
                  id="proveedor"
                  name="proveedor"
                  placeholder="Nombre del proveedor"
                  value={nuevoProducto.proveedor || ""}
                  onChange={handleInputChange}
                />
              </div>

              {/* Código de barras */}
              <div className="space-y-2">
                <Label htmlFor="codigo_barras" className="text-base">
                  Código de barras
                </Label>
                <Input
                  id="codigo_barras"
                  name="codigo_barras"
                  placeholder="Código de barras"
                  value={nuevoProducto.codigo_barras || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-base">
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  placeholder="Descripción del producto"
                  value={nuevoProducto.descripcion || ""}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              {/* Ubicación */}
              <div className="space-y-2">
                <Label htmlFor="ubicacion" className="text-base">
                  Ubicación en almacén
                </Label>
                <Input
                  id="ubicacion"
                  name="ubicacion"
                  placeholder="Ej: Estante A, Refrigerador 1"
                  value={nuevoProducto.ubicacion || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={guardarProducto} disabled={guardando} className="w-full sm:w-auto">
              {guardando ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Guardar Producto
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar producto */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>Modifique los detalles del producto en el inventario.</DialogDescription>
          </DialogHeader>

          {productoEditando && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre del producto */}
                <div className="space-y-2">
                  <Label htmlFor="edit-nombre" className="text-base">
                    Nombre del producto <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-nombre"
                    name="nombre"
                    placeholder="Ej: Pechuga de pollo"
                    value={productoEditando.nombre}
                    onChange={handleEditInputChange}
                    className={cn(errores.nombre && "border-red-500")}
                  />
                  {errores.nombre && <p className="text-sm text-red-500">{errores.nombre}</p>}
                </div>

                {/* Categoría */}
                <div className="space-y-2">
                  <Label htmlFor="edit-categoria" className="text-base">
                    Categoría <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={productoEditando.categoria}
                    onValueChange={(value) => {
                      setProductoEditando({ ...productoEditando, categoria: value })
                      if (errores.categoria) {
                        setErrores({ ...errores, categoria: "" })
                      }
                    }}
                  >
                    <SelectTrigger id="edit-categoria" className={cn(errores.categoria && "border-red-500")}>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errores.categoria && <p className="text-sm text-red-500">{errores.categoria}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stock */}
                <div className="space-y-2">
                  <Label htmlFor="edit-stock" className="text-base">
                    Stock <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej: 10"
                    value={productoEditando.stock}
                    onChange={handleEditInputChange}
                    className={cn(errores.stock && "border-red-500")}
                  />
                  {errores.stock && <p className="text-sm text-red-500">{errores.stock}</p>}
                </div>

                {/* Unidad */}
                <div className="space-y-2">
                  <Label htmlFor="edit-unidad" className="text-base">
                    Unidad <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={productoEditando.unidad}
                    onValueChange={(value) => {
                      setProductoEditando({ ...productoEditando, unidad: value })
                      if (errores.unidad) {
                        setErrores({ ...errores, unidad: "" })
                      }
                    }}
                  >
                    <SelectTrigger id="edit-unidad" className={cn(errores.unidad && "border-red-500")}>
                      <SelectValue placeholder="Seleccionar unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIDADES.map((unidad) => (
                        <SelectItem key={unidad} value={unidad}>
                          {unidad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errores.unidad && <p className="text-sm text-red-500">{errores.unidad}</p>}
                </div>

                {/* Precio por unidad */}
                <div className="space-y-2">
                  <Label htmlFor="edit-precio_unidad" className="text-base">
                    Precio por unidad <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">$</span>
                    <Input
                      id="edit-precio_unidad"
                      name="precio_unidad"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={productoEditando.precio_unidad}
                      onChange={handleEditInputChange}
                      className={cn("pl-7", errores.precio_unidad && "border-red-500")}
                    />
                  </div>
                  {errores.precio_unidad && <p className="text-sm text-red-500">{errores.precio_unidad}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha de caducidad */}
                <div className="space-y-2">
                  <Label htmlFor="edit-fecha_caducidad" className="text-base">
                    Fecha de caducidad
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fechaEdicion && "text-muted-foreground",
                          errores.fecha_caducidad && "border-red-500",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaEdicion ? format(fechaEdicion, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fechaEdicion}
                        onSelect={handleFechaEdicionChange}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  {errores.fecha_caducidad && <p className="text-sm text-red-500">{errores.fecha_caducidad}</p>}
                </div>

                {/* Alerta de stock bajo */}
                <div className="space-y-2">
                  <Label htmlFor="edit-alerta_stock" className="text-base">
                    Alerta de stock bajo
                  </Label>
                  <Input
                    id="edit-alerta_stock"
                    name="alerta_stock"
                    type="number"
                    min="1"
                    placeholder="Ej: 5"
                    value={productoEditando.alerta_stock || ""}
                    onChange={handleEditInputChange}
                  />
                  <p className="text-xs text-muted-foreground">Cantidad a partir de la cual se marcará como "Bajo"</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Proveedor */}
                <div className="space-y-2">
                  <Label htmlFor="edit-proveedor" className="text-base">
                    Proveedor
                  </Label>
                  <Input
                    id="edit-proveedor"
                    name="proveedor"
                    placeholder="Nombre del proveedor"
                    value={productoEditando.proveedor || ""}
                    onChange={handleEditInputChange}
                  />
                </div>

                {/* Código de barras */}
                <div className="space-y-2">
                  <Label htmlFor="edit-codigo_barras" className="text-base">
                    Código de barras
                  </Label>
                  <Input
                    id="edit-codigo_barras"
                    name="codigo_barras"
                    placeholder="Código de barras"
                    value={productoEditando.codigo_barras || ""}
                    onChange={handleEditInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="edit-descripcion" className="text-base">
                    Descripción
                  </Label>
                  <Textarea
                    id="edit-descripcion"
                    name="descripcion"
                    placeholder="Descripción del producto"
                    value={productoEditando.descripcion || ""}
                    onChange={handleEditInputChange}
                    rows={3}
                  />
                </div>

                {/* Ubicación */}
                <div className="space-y-2">
                  <Label htmlFor="edit-ubicacion" className="text-base">
                    Ubicación en almacén
                  </Label>
                  <Input
                    id="edit-ubicacion"
                    name="ubicacion"
                    placeholder="Ej: Estante A, Refrigerador 1"
                    value={productoEditando.ubicacion || ""}
                    onChange={handleEditInputChange}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="w-full sm:w-auto">
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={actualizarProductoExistente} disabled={guardando} className="w-full sm:w-auto">
              {guardando ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Actualizar Producto
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el producto{" "}
              <strong>{productoAEliminar?.nombre}</strong> del inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={eliminarProductoConfirmado} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
