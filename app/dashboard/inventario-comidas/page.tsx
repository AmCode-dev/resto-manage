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
import { format, parse } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Check, Edit, Plus, Search, Trash2, X } from "lucide-react"
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

// Tipos
interface Producto {
  id: number
  nombre: string
  categoria: string
  stock: number
  unidad: string
  precioUnidad: number
  fechaCaducidad: string
  estado: "Normal" | "Bajo" | "Agotado"
  imagen?: string
  descripcion?: string
  proveedor?: string
  ubicacion?: string
  codigoBarras?: string
  alertaStock?: number
}

// Constantes
const CATEGORIAS = ["Carnes", "Verduras", "Lácteos", "Frutas", "Pescados", "Condimentos", "Granos", "Otros"]
const UNIDADES = ["kg", "g", "l", "ml", "unidad", "docena", "caja", "botella", "paquete"]

export default function InventarioComidaPage() {
  // Estados
  const [productos, setProductos] = useState<Producto[]>(inventarioComidas)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null)
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null)
  const [nuevoProducto, setNuevoProducto] = useState<Partial<Producto>>({
    nombre: "",
    categoria: "",
    stock: 0,
    unidad: "",
    precioUnidad: 0,
    fechaCaducidad: format(new Date(), "yyyy-MM-dd"),
    estado: "Normal",
    alertaStock: 5,
  })
  const [fecha, setFecha] = useState<Date | undefined>(new Date())
  const [fechaEdicion, setFechaEdicion] = useState<Date | undefined>(new Date())
  const [errores, setErrores] = useState<Record<string, string>>({})

  // Filtrar productos por categoría y búsqueda
  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda =
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(busqueda.toLowerCase())

    if (filtroCategoria === "todos") {
      return coincideBusqueda
    } else {
      return producto.categoria === filtroCategoria && coincideBusqueda
    }
  })

  // Resumen de inventario
  const resumenInventario = {
    total: productos.length,
    bajos: productos.filter((p) => p.estado === "Bajo").length,
    agotados: productos.filter((p) => p.estado === "Agotado").length,
    valorTotal: productos.reduce((total, p) => total + p.precioUnidad * p.stock, 0),
  }

  // Manejar cambios en el formulario de nuevo producto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const validarFormulario = (producto: Partial<Producto>): boolean => {
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

    if (producto.precioUnidad === undefined || producto.precioUnidad <= 0) {
      nuevosErrores.precioUnidad = "Ingrese un precio válido"
    }

    if (!producto.fechaCaducidad) {
      nuevosErrores.fechaCaducidad = "Seleccione una fecha"
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  // Determinar estado del producto
  const determinarEstado = (stock: number, alertaStock?: number): "Normal" | "Bajo" | "Agotado" => {
    if (stock === 0) return "Agotado"
    if (alertaStock && stock <= alertaStock) return "Bajo"
    return "Normal"
  }

  // Guardar nuevo producto
  const guardarProducto = () => {
    if (!validarFormulario(nuevoProducto)) {
      return
    }

    const estado = determinarEstado(nuevoProducto.stock || 0, nuevoProducto.alertaStock)
    const nuevoId = Math.max(...productos.map((p) => p.id), 0) + 1

    const productoCompleto: Producto = {
      id: nuevoId,
      nombre: nuevoProducto.nombre!,
      categoria: nuevoProducto.categoria!,
      stock: nuevoProducto.stock || 0,
      unidad: nuevoProducto.unidad!,
      precioUnidad: nuevoProducto.precioUnidad || 0,
      fechaCaducidad: nuevoProducto.fechaCaducidad!,
      estado: estado,
      descripcion: nuevoProducto.descripcion,
      proveedor: nuevoProducto.proveedor,
      ubicacion: nuevoProducto.ubicacion,
      codigoBarras: nuevoProducto.codigoBarras,
      alertaStock: nuevoProducto.alertaStock,
    }

    setProductos([...productos, productoCompleto])
    setDialogOpen(false)
    resetearFormulario()

    toast({
      title: "Producto añadido",
      description: `${productoCompleto.nombre} ha sido añadido al inventario.`,
    })
  }

  // Actualizar producto existente
  const actualizarProducto = () => {
    if (!productoEditando || !validarFormulario(productoEditando)) {
      return
    }

    const estado = determinarEstado(productoEditando.stock, productoEditando.alertaStock)

    const productoActualizado: Producto = {
      ...productoEditando,
      estado: estado,
    }

    setProductos(productos.map((p) => (p.id === productoEditando.id ? productoActualizado : p)))
    setEditDialogOpen(false)
    setProductoEditando(null)
    setErrores({})

    toast({
      title: "Producto actualizado",
      description: `${productoActualizado.nombre} ha sido actualizado correctamente.`,
    })
  }

  // Eliminar producto
  const eliminarProducto = () => {
    if (!productoAEliminar) return

    setProductos(productos.filter((p) => p.id !== productoAEliminar.id))
    setDeleteDialogOpen(false)
    setProductoAEliminar(null)

    toast({
      title: "Producto eliminado",
      description: `${productoAEliminar.nombre} ha sido eliminado del inventario.`,
      variant: "destructive",
    })
  }

  // Abrir diálogo de edición
  const abrirEdicion = (producto: Producto) => {
    setProductoEditando({ ...producto })
    setFechaEdicion(parse(producto.fechaCaducidad, "yyyy-MM-dd", new Date()))
    setErrores({})
    setEditDialogOpen(true)
  }

  // Abrir diálogo de eliminación
  const abrirEliminacion = (producto: Producto) => {
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
      precioUnidad: 0,
      fechaCaducidad: format(new Date(), "yyyy-MM-dd"),
      estado: "Normal",
      alertaStock: 5,
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
        fechaCaducidad: format(date, "yyyy-MM-dd"),
      })

      if (errores.fechaCaducidad) {
        setErrores({
          ...errores,
          fechaCaducidad: "",
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
        fechaCaducidad: format(date, "yyyy-MM-dd"),
      })

      if (errores.fechaCaducidad) {
        setErrores({
          ...errores,
          fechaCaducidad: "",
        })
      }
    }
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
              {CATEGORIAS.map((categoria) => (
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Total de Productos</div>
                  <div className="text-2xl font-bold">{resumenInventario.total}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Productos Bajos</div>
                  <div className="text-2xl font-bold text-yellow-600">{resumenInventario.bajos}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Agotados</div>
                  <div className="text-2xl font-bold text-red-600">{resumenInventario.agotados}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Valor Total</div>
                  <div className="text-2xl font-bold">${resumenInventario.valorTotal.toFixed(2)}</div>
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
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosFiltrados.length > 0 ? (
                    productosFiltrados.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.nombre}</TableCell>
                        <TableCell>{item.categoria}</TableCell>
                        <TableCell>{item.stock}</TableCell>
                        <TableCell>{item.unidad}</TableCell>
                        <TableCell>${item.precioUnidad.toFixed(2)}</TableCell>
                        <TableCell>{item.fechaCaducidad}</TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              item.estado === "Normal"
                                ? "bg-green-100 text-green-800"
                                : item.estado === "Bajo"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.estado}
                          </div>
                        </TableCell>
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
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        No se encontraron productos
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="precioUnidad" className="text-base">
                  Precio por unidad <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <Input
                    id="precioUnidad"
                    name="precioUnidad"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={nuevoProducto.precioUnidad}
                    onChange={handleInputChange}
                    className={cn("pl-7", errores.precioUnidad && "border-red-500")}
                  />
                </div>
                {errores.precioUnidad && <p className="text-sm text-red-500">{errores.precioUnidad}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha de caducidad */}
              <div className="space-y-2">
                <Label htmlFor="fechaCaducidad" className="text-base">
                  Fecha de caducidad <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fecha && "text-muted-foreground",
                        errores.fechaCaducidad && "border-red-500",
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
                {errores.fechaCaducidad && <p className="text-sm text-red-500">{errores.fechaCaducidad}</p>}
              </div>

              {/* Alerta de stock bajo */}
              <div className="space-y-2">
                <Label htmlFor="alertaStock" className="text-base">
                  Alerta de stock bajo
                </Label>
                <Input
                  id="alertaStock"
                  name="alertaStock"
                  type="number"
                  min="1"
                  placeholder="Ej: 5"
                  value={nuevoProducto.alertaStock}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground">Cantidad a partir de la cual se marcará como "Bajo"</p>
              </div>
            </div>

            {/* Campos opcionales */}
            <div className="space-y-2">
              <div className="flex items-center">
                <h4 className="text-sm font-medium">Información adicional</h4>
                <div className="ml-2 h-px flex-1 bg-border"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="descripcion" className="text-sm">
                    Descripción
                  </Label>
                  <Input
                    id="descripcion"
                    name="descripcion"
                    placeholder="Descripción del producto"
                    value={nuevoProducto.descripcion || ""}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Proveedor */}
                <div className="space-y-2">
                  <Label htmlFor="proveedor" className="text-sm">
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

                {/* Ubicación */}
                <div className="space-y-2">
                  <Label htmlFor="ubicacion" className="text-sm">
                    Ubicación
                  </Label>
                  <Input
                    id="ubicacion"
                    name="ubicacion"
                    placeholder="Ubicación en almacén"
                    value={nuevoProducto.ubicacion || ""}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Código de barras */}
                <div className="space-y-2">
                  <Label htmlFor="codigoBarras" className="text-sm">
                    Código de barras
                  </Label>
                  <Input
                    id="codigoBarras"
                    name="codigoBarras"
                    placeholder="Código de barras"
                    value={nuevoProducto.codigoBarras || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={guardarProducto} className="w-full sm:w-auto">
              <Check className="mr-2 h-4 w-4" />
              Guardar Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar producto */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                  <Label htmlFor="edit-precioUnidad" className="text-base">
                    Precio por unidad <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">$</span>
                    <Input
                      id="edit-precioUnidad"
                      name="precioUnidad"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={productoEditando.precioUnidad}
                      onChange={handleEditInputChange}
                      className={cn("pl-7", errores.precioUnidad && "border-red-500")}
                    />
                  </div>
                  {errores.precioUnidad && <p className="text-sm text-red-500">{errores.precioUnidad}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha de caducidad */}
                <div className="space-y-2">
                  <Label htmlFor="edit-fechaCaducidad" className="text-base">
                    Fecha de caducidad <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fechaEdicion && "text-muted-foreground",
                          errores.fechaCaducidad && "border-red-500",
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
                  {errores.fechaCaducidad && <p className="text-sm text-red-500">{errores.fechaCaducidad}</p>}
                </div>

                {/* Alerta de stock bajo */}
                <div className="space-y-2">
                  <Label htmlFor="edit-alertaStock" className="text-base">
                    Alerta de stock bajo
                  </Label>
                  <Input
                    id="edit-alertaStock"
                    name="alertaStock"
                    type="number"
                    min="1"
                    placeholder="Ej: 5"
                    value={productoEditando.alertaStock || ""}
                    onChange={handleEditInputChange}
                  />
                  <p className="text-xs text-muted-foreground">Cantidad a partir de la cual se marcará como "Bajo"</p>
                </div>
              </div>

              {/* Campos opcionales */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <h4 className="text-sm font-medium">Información adicional</h4>
                  <div className="ml-2 h-px flex-1 bg-border"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Descripción */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-descripcion" className="text-sm">
                      Descripción
                    </Label>
                    <Input
                      id="edit-descripcion"
                      name="descripcion"
                      placeholder="Descripción del producto"
                      value={productoEditando.descripcion || ""}
                      onChange={handleEditInputChange}
                    />
                  </div>

                  {/* Proveedor */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-proveedor" className="text-sm">
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

                  {/* Ubicación */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-ubicacion" className="text-sm">
                      Ubicación
                    </Label>
                    <Input
                      id="edit-ubicacion"
                      name="ubicacion"
                      placeholder="Ubicación en almacén"
                      value={productoEditando.ubicacion || ""}
                      onChange={handleEditInputChange}
                    />
                  </div>

                  {/* Código de barras */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-codigoBarras" className="text-sm">
                      Código de barras
                    </Label>
                    <Input
                      id="edit-codigoBarras"
                      name="codigoBarras"
                      placeholder="Código de barras"
                      value={productoEditando.codigoBarras || ""}
                      onChange={handleEditInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="w-full sm:w-auto">
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={actualizarProducto} className="w-full sm:w-auto">
              <Check className="mr-2 h-4 w-4" />
              Actualizar Producto
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
            <AlertDialogAction onClick={eliminarProducto} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const inventarioComidas = [
  {
    id: 1,
    nombre: "Pechuga de Pollo",
    categoria: "Carnes",
    stock: 25,
    unidad: "kg",
    precioUnidad: 8.99,
    fechaCaducidad: "2023-06-15",
    estado: "Normal" as const,
    alertaStock: 5,
  },
  {
    id: 2,
    nombre: "Carne Molida",
    categoria: "Carnes",
    stock: 10,
    unidad: "kg",
    precioUnidad: 7.5,
    fechaCaducidad: "2023-06-10",
    estado: "Bajo" as const,
    alertaStock: 15,
  },
  {
    id: 3,
    nombre: "Tomates",
    categoria: "Verduras",
    stock: 15,
    unidad: "kg",
    precioUnidad: 2.99,
    fechaCaducidad: "2023-06-08",
    estado: "Normal" as const,
    alertaStock: 5,
  },
  {
    id: 4,
    nombre: "Lechuga",
    categoria: "Verduras",
    stock: 8,
    unidad: "unidad",
    precioUnidad: 1.5,
    fechaCaducidad: "2023-06-05",
    estado: "Bajo" as const,
    alertaStock: 10,
  },
  {
    id: 5,
    nombre: "Queso Mozzarella",
    categoria: "Lácteos",
    stock: 5,
    unidad: "kg",
    precioUnidad: 12.99,
    fechaCaducidad: "2023-06-20",
    estado: "Normal" as const,
    alertaStock: 3,
  },
  {
    id: 6,
    nombre: "Huevos",
    categoria: "Lácteos",
    stock: 0,
    unidad: "docena",
    precioUnidad: 3.99,
    fechaCaducidad: "2023-06-25",
    estado: "Agotado" as const,
    alertaStock: 5,
  },
  {
    id: 7,
    nombre: "Harina",
    categoria: "Otros",
    stock: 20,
    unidad: "kg",
    precioUnidad: 1.99,
    fechaCaducidad: "2023-08-15",
    estado: "Normal" as const,
    alertaStock: 5,
  },
]
