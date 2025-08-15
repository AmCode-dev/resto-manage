"use client"

import { useState } from "react"
import { Plus, Search, Filter, Edit, Trash2, Eye, DollarSign, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useMenus, type Menu } from "@/hooks/use-menus"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { useAuth } from "@/hooks/use-auth"

export default function MenusPage() {
  const { hasPermission } = useAuth()
  const {
    menus,
    categorias,
    estadisticas,
    loading,
    searchTerm,
    setSearchTerm,
    categoriaFiltro,
    setCategoriaFiltro,
    crearMenu,
    actualizarMenu,
    eliminarMenu,
  } = useMenus()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    disponible: true,
    tiempo_preparacion: "",
    ingredientes: "",
    alergenos: "",
    calorias: "",
    imagen_url: "",
  })

  const handleCreateMenu = async () => {
    try {
      await crearMenu({
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        precio: Number.parseFloat(formData.precio),
        categoria: formData.categoria,
        disponible: formData.disponible,
        tiempo_preparacion: formData.tiempo_preparacion ? Number.parseInt(formData.tiempo_preparacion) : undefined,
        ingredientes: formData.ingredientes ? formData.ingredientes.split(",").map((i) => i.trim()) : [],
        alergenos: formData.alergenos
          ? formData.alergenos
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean)
          : [],
        calorias: formData.calorias ? Number.parseInt(formData.calorias) : undefined,
        imagen_url: formData.imagen_url || undefined,
      })
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error creating menu:", error)
    }
  }

  const handleEditMenu = async () => {
    if (!selectedMenu) return

    try {
      await actualizarMenu(selectedMenu.id, {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        precio: Number.parseFloat(formData.precio),
        categoria: formData.categoria,
        disponible: formData.disponible,
        tiempo_preparacion: formData.tiempo_preparacion ? Number.parseInt(formData.tiempo_preparacion) : undefined,
        ingredientes: formData.ingredientes ? formData.ingredientes.split(",").map((i) => i.trim()) : [],
        alergenos: formData.alergenos
          ? formData.alergenos
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean)
          : [],
        calorias: formData.calorias ? Number.parseInt(formData.calorias) : undefined,
        imagen_url: formData.imagen_url || undefined,
      })
      setIsEditDialogOpen(false)
      setSelectedMenu(null)
      resetForm()
    } catch (error) {
      console.error("Error updating menu:", error)
    }
  }

  const handleDeleteMenu = async (id: string) => {
    try {
      await eliminarMenu(id)
    } catch (error) {
      console.error("Error deleting menu:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      precio: "",
      categoria: "",
      disponible: true,
      tiempo_preparacion: "",
      ingredientes: "",
      alergenos: "",
      calorias: "",
      imagen_url: "",
    })
  }

  const openEditDialog = (menu: Menu) => {
    setSelectedMenu(menu)
    setFormData({
      nombre: menu.nombre,
      descripcion: menu.descripcion || "",
      precio: menu.precio.toString(),
      categoria: menu.categoria,
      disponible: menu.disponible,
      tiempo_preparacion: menu.tiempo_preparacion?.toString() || "",
      ingredientes: Array.isArray(menu.ingredientes) ? menu.ingredientes.join(", ") : "",
      alergenos: Array.isArray(menu.alergenos) ? menu.alergenos.join(", ") : "",
      calorias: menu.calorias?.toString() || "",
      imagen_url: menu.imagen_url || "",
    })
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Asegurar que las propiedades no sean undefined
  const menusSeguro = menus || []
  const categoriasSeguro = categorias || []
  const estadisticasSeguro = estadisticas || {
    total: 0,
    disponibles: 0,
    noDisponibles: 0,
    precioPromedio: 0,
    tiempoPromedio: 0,
    categorias: 0,
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Menús</h1>
          <p className="text-muted-foreground">Administra los platos y bebidas de tu restaurante</p>
        </div>
        <PermissionGuard requiredPermission="gestionar_menus">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Plato
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Plato</DialogTitle>
                <DialogDescription>Añade un nuevo plato o bebida al menú de tu restaurante</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Nombre del plato"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio *</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción del plato"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriasSeguro.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiempo_preparacion">Tiempo de Preparación (min)</Label>
                  <Input
                    id="tiempo_preparacion"
                    type="number"
                    value={formData.tiempo_preparacion}
                    onChange={(e) => setFormData({ ...formData, tiempo_preparacion: e.target.value })}
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ingredientes">Ingredientes (separados por coma)</Label>
                  <Input
                    id="ingredientes"
                    value={formData.ingredientes}
                    onChange={(e) => setFormData({ ...formData, ingredientes: e.target.value })}
                    placeholder="Tomate, Lechuga, Carne"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alergenos">Alérgenos (separados por coma)</Label>
                  <Input
                    id="alergenos"
                    value={formData.alergenos}
                    onChange={(e) => setFormData({ ...formData, alergenos: e.target.value })}
                    placeholder="Gluten, Lácteos"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calorias">Calorías</Label>
                  <Input
                    id="calorias"
                    type="number"
                    value={formData.calorias}
                    onChange={(e) => setFormData({ ...formData, calorias: e.target.value })}
                    placeholder="350"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imagen_url">URL de Imagen</Label>
                  <Input
                    id="imagen_url"
                    value={formData.imagen_url}
                    onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateMenu}
                  disabled={!formData.nombre || !formData.precio || !formData.categoria}
                >
                  Crear Plato
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PermissionGuard>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platos</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticasSeguro.total}</div>
            <p className="text-xs text-muted-foreground">{estadisticasSeguro.disponibles} disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estadisticasSeguro.precioPromedio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Por plato</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticasSeguro.categorias}</div>
            <p className="text-xs text-muted-foreground">Diferentes tipos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticasSeguro.tiempoPromedio} min</div>
            <p className="text-xs text-muted-foreground">De preparación</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar platos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs por Categoría */}
      <Tabs value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          {categoriasSeguro.slice(0, 5).map((categoria) => (
            <TabsTrigger key={categoria} value={categoria}>
              {categoria}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={categoriaFiltro} className="mt-6">
          {menusSeguro.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">No hay platos disponibles</div>
              <PermissionGuard requiredPermission="gestionar_menus">
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primer plato
                </Button>
              </PermissionGuard>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menusSeguro.map((menu) => (
                <Card key={menu.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {menu.imagen_url ? (
                      <img
                        src={menu.imagen_url || "/placeholder.svg"}
                        alt={menu.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-muted-foreground">Sin imagen</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={menu.disponible ? "default" : "secondary"}>
                        {menu.disponible ? "Disponible" : "No disponible"}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{menu.nombre}</CardTitle>
                        <CardDescription className="text-sm">{menu.categoria}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">${menu.precio}</div>
                        {menu.tiempo_preparacion && (
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {menu.tiempo_preparacion} min
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {menu.descripcion && <p className="text-sm text-muted-foreground mb-3">{menu.descripcion}</p>}

                    {menu.ingredientes && menu.ingredientes.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium mb-1">Ingredientes:</p>
                        <div className="flex flex-wrap gap-1">
                          {menu.ingredientes.slice(0, 3).map((ingrediente, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {ingrediente}
                            </Badge>
                          ))}
                          {menu.ingredientes.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{menu.ingredientes.length - 3} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {menu.alergenos && menu.alergenos.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium mb-1 text-orange-600">Alérgenos:</p>
                        <div className="flex flex-wrap gap-1">
                          {menu.alergenos.map((alergeno, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {alergeno}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      {menu.calorias && <span className="text-xs text-muted-foreground">{menu.calorias} cal</span>}
                      <PermissionGuard requiredPermission="gestionar_menus">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(menu)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar plato?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. El plato "{menu.nombre}" será eliminado
                                  permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteMenu(menu.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </PermissionGuard>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Plato</DialogTitle>
            <DialogDescription>Modifica los detalles del plato seleccionado</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre *</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre del plato"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-precio">Precio *</Label>
              <Input
                id="edit-precio"
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-descripcion">Descripción</Label>
              <Textarea
                id="edit-descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción del plato"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-categoria">Categoría *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasSeguro.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tiempo_preparacion">Tiempo de Preparación (min)</Label>
              <Input
                id="edit-tiempo_preparacion"
                type="number"
                value={formData.tiempo_preparacion}
                onChange={(e) => setFormData({ ...formData, tiempo_preparacion: e.target.value })}
                placeholder="15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ingredientes">Ingredientes (separados por coma)</Label>
              <Input
                id="edit-ingredientes"
                value={formData.ingredientes}
                onChange={(e) => setFormData({ ...formData, ingredientes: e.target.value })}
                placeholder="Tomate, Lechuga, Carne"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-alergenos">Alérgenos (separados por coma)</Label>
              <Input
                id="edit-alergenos"
                value={formData.alergenos}
                onChange={(e) => setFormData({ ...formData, alergenos: e.target.value })}
                placeholder="Gluten, Lácteos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-calorias">Calorías</Label>
              <Input
                id="edit-calorias"
                type="number"
                value={formData.calorias}
                onChange={(e) => setFormData({ ...formData, calorias: e.target.value })}
                placeholder="350"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-imagen_url">URL de Imagen</Label>
              <Input
                id="edit-imagen_url"
                value={formData.imagen_url}
                onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditMenu} disabled={!formData.nombre || !formData.precio || !formData.categoria}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
