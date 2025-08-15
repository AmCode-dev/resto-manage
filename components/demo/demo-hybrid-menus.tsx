/**
 * Componente de demostración que muestra cómo usar el patrón híbrido Supabase + Prisma
 * Este componente no se incluye en la aplicación principal, solo como ejemplo
 */

"use client"

import { useState, useEffect } from "react"
import { useMenusHybrid } from "@/hooks/use-menus-hybrid"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Search, TrendingUp, Package, DollarSign } from "lucide-react"

interface DemoHybridMenusProps {
  restauranteId: string
}

export function DemoHybridMenus({ restauranteId }: DemoHybridMenusProps) {
  const {
    menus,
    loading,
    error,
    crearMenu,
    actualizarMenu,
    eliminarMenu,
    buscarMenus,
    getMenuStats,
    reloadMenus
  } = useMenusHybrid(restauranteId)

  const [showForm, setShowForm] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  // Formulario para nuevo menú
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    precio: "",
    categoria: "",
    ingredientes: "",
    disponible: true
  })

  // Cargar estadísticas al montar
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const menuStats = await getMenuStats()
    setStats(menuStats)
  }

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await crearMenu({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        categoria: formData.categoria,
        ingredientes: formData.ingredientes,
        disponible: formData.disponible
      })
      
      // Limpiar formulario
      setFormData({
        titulo: "",
        descripcion: "",
        precio: "",
        categoria: "",
        ingredientes: "",
        disponible: true
      })
      setShowForm(false)
      
      // Recargar estadísticas
      loadStats()
    } catch (error) {
      console.error('Error creating menu:', error)
    }
  }

  const handleSearch = async () => {
    await buscarMenus({
      search: searchTerm,
      categoria: selectedCategory || undefined
    })
  }

  const clearFilters = async () => {
    setSearchTerm("")
    setSelectedCategory("")
    await reloadMenus()
  }

  if (loading && menus.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando menús...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Demo: Gestión Híbrida de Menús</h1>
          <p className="text-muted-foreground">
            Ejemplo usando Supabase + Prisma ORM
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Menú
        </Button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Menús</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMenus}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${Number(stats.averagePrice).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.menusByCategory.length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros de búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
          <CardDescription>
            Usa Prisma para búsquedas complejas con filtros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Buscar por título, descripción o ingredientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Label htmlFor="category">Categoría</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="Entrada">Entrada</SelectItem>
                  <SelectItem value="Principal">Principal</SelectItem>
                  <SelectItem value="Postre">Postre</SelectItem>
                  <SelectItem value="Bebida">Bebida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 items-end">
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de nuevo menú */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Menú</CardTitle>
            <CardDescription>
              Se creará usando Prisma y se notificará vía Supabase real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateMenu} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="precio">Precio</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({...formData, precio: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="categoria">Categoría</Label>
                <Select 
                  value={formData.categoria} 
                  onValueChange={(value) => setFormData({...formData, categoria: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entrada">Entrada</SelectItem>
                    <SelectItem value="Principal">Principal</SelectItem>
                    <SelectItem value="Postre">Postre</SelectItem>
                    <SelectItem value="Bebida">Bebida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="ingredientes">Ingredientes</Label>
                <Textarea
                  id="ingredientes"
                  value={formData.ingredientes}
                  onChange={(e) => setFormData({...formData, ingredientes: e.target.value})}
                  placeholder="Lista de ingredientes separados por coma"
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">Crear Menú</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de menús */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menus.map((menu) => (
          <Card key={menu.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{menu.titulo}</CardTitle>
                <Badge variant={menu.disponible ? "default" : "secondary"}>
                  {menu.disponible ? "Disponible" : "No disponible"}
                </Badge>
              </div>
              <CardDescription>{menu.categoria}</CardDescription>
            </CardHeader>
            <CardContent>
              {menu.descripcion && (
                <p className="text-sm text-muted-foreground mb-2">
                  {menu.descripcion}
                </p>
              )}
              {menu.ingredientes && (
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Ingredientes:</strong> {menu.ingredientes}
                </p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">${Number(menu.precio).toFixed(2)}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => eliminarMenu(menu.id)}
                >
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado de error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Estado vacío */}
      {menus.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay menús disponibles</p>
              <p className="text-sm">Crea tu primer menú para comenzar</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}