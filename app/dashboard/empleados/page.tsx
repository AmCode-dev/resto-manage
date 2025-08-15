"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Search, Filter, MoreHorizontal, Edit, UserCheck, UserX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useEmpleados, type EmpleadoInsert } from "@/hooks/use-empleados"
import { PermissionGuard } from "@/components/auth/permission-guard"

export default function EmpleadosPage() {
  const {
    empleados,
    loading,
    crearEmpleado,
    actualizarEmpleado,
    eliminarEmpleado,
    reactivarEmpleado,
    obtenerEstadisticas,
  } = useEmpleados()

  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activos" | "inactivos">("activos")
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [empleadoEditando, setEmpleadoEditando] = useState<string | null>(null)
  const [formData, setFormData] = useState<EmpleadoInsert>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    cargo: "",
    salario: 0,
    fecha_ingreso: new Date().toISOString().split("T")[0],
    permisos: {
      pos: false,
      inventario: false,
      reportes: false,
      configuracion: false,
      empleados: false,
      finanzas: false,
    },
    activo: true,
  })

  const estadisticas = obtenerEstadisticas()

  // Filtrar empleados
  const empleadosFiltrados = empleados.filter((empleado) => {
    const coincideBusqueda =
      empleado.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      empleado.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      empleado.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      empleado.cargo.toLowerCase().includes(busqueda.toLowerCase())

    const coincideEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "activos" && empleado.activo) ||
      (filtroEstado === "inactivos" && !empleado.activo)

    return coincideBusqueda && coincideEstado
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (empleadoEditando) {
        await actualizarEmpleado(empleadoEditando, formData)
      } else {
        await crearEmpleado(formData)
      }

      setDialogoAbierto(false)
      resetForm()
    } catch (error) {
      console.error("Error guardando empleado:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      cargo: "",
      salario: 0,
      fecha_ingreso: new Date().toISOString().split("T")[0],
      permisos: {
        pos: false,
        inventario: false,
        reportes: false,
        configuracion: false,
        empleados: false,
        finanzas: false,
      },
      activo: true,
    })
    setEmpleadoEditando(null)
  }

  const handleEdit = (empleado: any) => {
    setFormData({
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      email: empleado.email,
      telefono: empleado.telefono || "",
      cargo: empleado.cargo,
      salario: empleado.salario || 0,
      fecha_ingreso: empleado.fecha_ingreso,
      permisos: empleado.permisos,
      activo: empleado.activo,
    })
    setEmpleadoEditando(empleado.id)
    setDialogoAbierto(true)
  }

  const handlePermisoChange = (permiso: keyof typeof formData.permisos, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [permiso]: checked,
      },
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Cargando empleados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empleados</h1>
          <p className="text-muted-foreground">Gestiona el equipo de trabajo de tu restaurante</p>
        </div>
        <PermissionGuard requiredPermission="empleados">
          <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{empleadoEditando ? "Editar Empleado" : "Nuevo Empleado"}</DialogTitle>
                <DialogDescription>
                  {empleadoEditando ? "Modifica los datos del empleado" : "Agrega un nuevo miembro al equipo"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input
                      id="apellido"
                      value={formData.apellido}
                      onChange={(e) => setFormData((prev) => ({ ...prev, apellido: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData((prev) => ({ ...prev, telefono: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Select
                      value={formData.cargo}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, cargo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gerente">Gerente</SelectItem>
                        <SelectItem value="Subgerente">Subgerente</SelectItem>
                        <SelectItem value="Cajero">Cajero</SelectItem>
                        <SelectItem value="Mesero">Mesero</SelectItem>
                        <SelectItem value="Cocinero">Cocinero</SelectItem>
                        <SelectItem value="Ayudante de Cocina">Ayudante de Cocina</SelectItem>
                        <SelectItem value="Bartender">Bartender</SelectItem>
                        <SelectItem value="Limpieza">Limpieza</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salario">Salario</Label>
                    <Input
                      id="salario"
                      type="number"
                      value={formData.salario}
                      onChange={(e) => setFormData((prev) => ({ ...prev, salario: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_ingreso">Fecha de Ingreso</Label>
                  <Input
                    id="fecha_ingreso"
                    type="date"
                    value={formData.fecha_ingreso}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fecha_ingreso: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Permisos</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pos"
                        checked={formData.permisos.pos}
                        onCheckedChange={(checked) => handlePermisoChange("pos", checked as boolean)}
                      />
                      <Label htmlFor="pos">Punto de Venta</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inventario"
                        checked={formData.permisos.inventario}
                        onCheckedChange={(checked) => handlePermisoChange("inventario", checked as boolean)}
                      />
                      <Label htmlFor="inventario">Inventario</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reportes"
                        checked={formData.permisos.reportes}
                        onCheckedChange={(checked) => handlePermisoChange("reportes", checked as boolean)}
                      />
                      <Label htmlFor="reportes">Reportes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="empleados"
                        checked={formData.permisos.empleados}
                        onCheckedChange={(checked) => handlePermisoChange("empleados", checked as boolean)}
                      />
                      <Label htmlFor="empleados">Empleados</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="finanzas"
                        checked={formData.permisos.finanzas}
                        onCheckedChange={(checked) => handlePermisoChange("finanzas", checked as boolean)}
                      />
                      <Label htmlFor="finanzas">Finanzas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="configuracion"
                        checked={formData.permisos.configuracion}
                        onCheckedChange={(checked) => handlePermisoChange("configuracion", checked as boolean)}
                      />
                      <Label htmlFor="configuracion">Configuración</Label>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogoAbierto(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{empleadoEditando ? "Actualizar" : "Crear"} Empleado</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </PermissionGuard>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalEmpleados}</div>
            <p className="text-xs text-muted-foreground">Personal registrado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estadisticas.empleadosActivos}</div>
            <p className="text-xs text-muted-foreground">Trabajando actualmente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados Inactivos</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estadisticas.empleadosInactivos}</div>
            <p className="text-xs text-muted-foreground">Desactivados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salario Promedio</CardTitle>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estadisticas.salarioPromedio.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Por empleado activo</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empleados</CardTitle>
          <CardDescription>Gestiona la información y permisos de tu equipo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empleados..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filtroEstado} onValueChange={(value: any) => setFiltroEstado(value)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activos">Activos</SelectItem>
                <SelectItem value="inactivos">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Salario</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empleadosFiltrados.map((empleado) => (
                  <TableRow key={empleado.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder-user.jpg" />
                          <AvatarFallback>
                            {empleado.nombre[0]}
                            {empleado.apellido[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {empleado.nombre} {empleado.apellido}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Desde {new Date(empleado.fecha_ingreso).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{empleado.cargo}</TableCell>
                    <TableCell>{empleado.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(empleado.permisos).map(
                          ([permiso, activo]) =>
                            activo && (
                              <Badge key={permiso} variant="secondary" className="text-xs">
                                {permiso}
                              </Badge>
                            ),
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={empleado.activo ? "default" : "secondary"}>
                        {empleado.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {empleado.salario ? `$${empleado.salario.toLocaleString()}` : "No especificado"}
                    </TableCell>
                    <TableCell className="text-right">
                      <PermissionGuard requiredPermission="empleados">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(empleado)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {empleado.activo ? (
                              <DropdownMenuItem onClick={() => eliminarEmpleado(empleado.id)} className="text-red-600">
                                <UserX className="mr-2 h-4 w-4" />
                                Desactivar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => reactivarEmpleado(empleado.id)}
                                className="text-green-600"
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Reactivar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </PermissionGuard>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {empleadosFiltrados.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                No se encontraron empleados que coincidan con los filtros.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
