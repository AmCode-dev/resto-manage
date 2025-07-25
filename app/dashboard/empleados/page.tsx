"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Edit,
  ChefHat,
  Coffee,
  UserCircle,
  ClipboardList,
  DollarSign,
  Calendar,
  Package,
  Users,
  Utensils,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Tipos de roles disponibles
type RolEmpleado = "Administrador" | "Mesero" | "Cocinero" | "Bartender" | "Cajero" | "Recepcionista" | "Gerente"

// Secciones del sistema
interface SeccionSistema {
  id: string
  nombre: string
  descripcion: string
  icono: React.ReactNode
}

// Permisos por sección
interface Permiso {
  seccionId: string
  ver: boolean
  editar: boolean
}

// Interfaz para empleados
interface Empleado {
  id: number
  nombre: string
  cargo: RolEmpleado
  contacto: string
  estado: "Activo" | "Inactivo"
  horario: string
  permisos: Permiso[]
}

export default function EmpleadosPage() {
  const [filtro, setFiltro] = useState("")
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null)
  const [dialogoNuevoEmpleado, setDialogoNuevoEmpleado] = useState(false)
  const [dialogoPermisos, setDialogoPermisos] = useState(false)
  const [nuevoEmpleado, setNuevoEmpleado] = useState<Partial<Empleado>>({
    nombre: "",
    cargo: "Mesero",
    contacto: "",
    estado: "Activo",
    horario: "",
    permisos: [],
  })

  // Filtrar empleados según la búsqueda
  const empleadosFiltrados = empleados.filter(
    (empleado) =>
      empleado.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      empleado.cargo.toLowerCase().includes(filtro.toLowerCase()) ||
      empleado.contacto.toLowerCase().includes(filtro.toLowerCase()),
  )

  // Función para crear un nuevo empleado
  const crearEmpleado = () => {
    // En una aplicación real, aquí enviaríamos los datos al backend
    console.log("Nuevo empleado:", nuevoEmpleado)

    // Cerrar diálogo y resetear formulario
    setDialogoNuevoEmpleado(false)
    setNuevoEmpleado({
      nombre: "",
      cargo: "Mesero",
      contacto: "",
      estado: "Activo",
      horario: "",
      permisos: [],
    })
  }

  // Función para actualizar permisos
  const actualizarPermisos = () => {
    // En una aplicación real, aquí enviaríamos los datos al backend
    console.log("Permisos actualizados:", empleadoSeleccionado)

    // Cerrar diálogo
    setDialogoPermisos(false)
  }

  // Función para cambiar un permiso específico
  const cambiarPermiso = (seccionId: string, tipo: "ver" | "editar", valor: boolean) => {
    if (!empleadoSeleccionado) return

    setEmpleadoSeleccionado({
      ...empleadoSeleccionado,
      permisos: empleadoSeleccionado.permisos.map((permiso) =>
        permiso.seccionId === seccionId ? { ...permiso, [tipo]: valor } : permiso,
      ),
    })
  }

  // Función para obtener el ícono según el rol
  const getIconoRol = (rol: RolEmpleado) => {
    switch (rol) {
      case "Administrador":
        return <UserCircle className="h-4 w-4 text-purple-500" />
      case "Mesero":
        return <ClipboardList className="h-4 w-4 text-blue-500" />
      case "Cocinero":
        return <ChefHat className="h-4 w-4 text-yellow-500" />
      case "Bartender":
        return <Coffee className="h-4 w-4 text-red-500" />
      case "Cajero":
        return <DollarSign className="h-4 w-4 text-green-500" />
      case "Recepcionista":
        return <Calendar className="h-4 w-4 text-pink-500" />
      case "Gerente":
        return <Users className="h-4 w-4 text-indigo-500" />
      default:
        return <UserCircle className="h-4 w-4" />
    }
  }

  // Función para obtener el color de fondo según el rol
  const getColorRol = (rol: RolEmpleado) => {
    switch (rol) {
      case "Administrador":
        return "bg-purple-100 text-purple-800"
      case "Mesero":
        return "bg-blue-100 text-blue-800"
      case "Cocinero":
        return "bg-yellow-100 text-yellow-800"
      case "Bartender":
        return "bg-red-100 text-red-800"
      case "Cajero":
        return "bg-green-100 text-green-800"
      case "Recepcionista":
        return "bg-pink-100 text-pink-800"
      case "Gerente":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Función para obtener el número de secciones con acceso
  const getNumeroAccesos = (permisos: Permiso[]) => {
    return permisos.filter((p) => p.ver).length
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Empleados</h1>
        <Button onClick={() => setDialogoNuevoEmpleado(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Empleado
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-[350px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, cargo o contacto..."
            className="pl-8"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="activos">Activos</TabsTrigger>
          <TabsTrigger value="inactivos">Inactivos</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Accesos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empleadosFiltrados.map((empleado) => (
                    <TableRow key={empleado.id}>
                      <TableCell className="font-medium">{empleado.nombre}</TableCell>
                      <TableCell>
                        <Badge className={`${getColorRol(empleado.cargo)} flex w-fit items-center gap-1`}>
                          {getIconoRol(empleado.cargo)}
                          {empleado.cargo}
                        </Badge>
                      </TableCell>
                      <TableCell>{empleado.contacto}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            empleado.estado === "Activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {empleado.estado}
                        </div>
                      </TableCell>
                      <TableCell>{empleado.horario}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="bg-slate-50">
                            {getNumeroAccesos(empleado.permisos)}/{secciones.length} secciones
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEmpleadoSeleccionado(empleado)
                              setDialogoPermisos(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activos" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Accesos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empleadosFiltrados
                    .filter((empleado) => empleado.estado === "Activo")
                    .map((empleado) => (
                      <TableRow key={empleado.id}>
                        <TableCell className="font-medium">{empleado.nombre}</TableCell>
                        <TableCell>
                          <Badge className={`${getColorRol(empleado.cargo)} flex w-fit items-center gap-1`}>
                            {getIconoRol(empleado.cargo)}
                            {empleado.cargo}
                          </Badge>
                        </TableCell>
                        <TableCell>{empleado.contacto}</TableCell>
                        <TableCell>
                          <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                            {empleado.estado}
                          </div>
                        </TableCell>
                        <TableCell>{empleado.horario}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="bg-slate-50">
                              {getNumeroAccesos(empleado.permisos)}/{secciones.length} secciones
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEmpleadoSeleccionado(empleado)
                                setDialogoPermisos(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactivos" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Accesos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empleadosFiltrados
                    .filter((empleado) => empleado.estado === "Inactivo")
                    .map((empleado) => (
                      <TableRow key={empleado.id}>
                        <TableCell className="font-medium">{empleado.nombre}</TableCell>
                        <TableCell>
                          <Badge className={`${getColorRol(empleado.cargo)} flex w-fit items-center gap-1`}>
                            {getIconoRol(empleado.cargo)}
                            {empleado.cargo}
                          </Badge>
                        </TableCell>
                        <TableCell>{empleado.contacto}</TableCell>
                        <TableCell>
                          <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800">
                            {empleado.estado}
                          </div>
                        </TableCell>
                        <TableCell>{empleado.horario}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="bg-slate-50">
                              {getNumeroAccesos(empleado.permisos)}/{secciones.length} secciones
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEmpleadoSeleccionado(empleado)
                                setDialogoPermisos(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para nuevo empleado */}
      <Dialog open={dialogoNuevoEmpleado} onOpenChange={setDialogoNuevoEmpleado}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nuevo Empleado</DialogTitle>
            <DialogDescription>Complete la información para crear un nuevo empleado.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="nombre" className="text-right">
                Nombre
              </label>
              <Input
                id="nombre"
                value={nuevoEmpleado.nombre}
                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, nombre: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="cargo" className="text-right">
                Cargo
              </label>
              <Select
                value={nuevoEmpleado.cargo}
                onValueChange={(value) => setNuevoEmpleado({ ...nuevoEmpleado, cargo: value as RolEmpleado })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Mesero">Mesero</SelectItem>
                  <SelectItem value="Cocinero">Cocinero</SelectItem>
                  <SelectItem value="Bartender">Bartender</SelectItem>
                  <SelectItem value="Cajero">Cajero</SelectItem>
                  <SelectItem value="Recepcionista">Recepcionista</SelectItem>
                  <SelectItem value="Gerente">Gerente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="contacto" className="text-right">
                Contacto
              </label>
              <Input
                id="contacto"
                value={nuevoEmpleado.contacto}
                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, contacto: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="horario" className="text-right">
                Horario
              </label>
              <Input
                id="horario"
                value={nuevoEmpleado.horario}
                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, horario: e.target.value })}
                className="col-span-3"
                placeholder="Ej: Lun-Vie: 8am-4pm"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="estado" className="text-right">
                Estado
              </label>
              <Select
                value={nuevoEmpleado.estado}
                onValueChange={(value) =>
                  setNuevoEmpleado({ ...nuevoEmpleado, estado: value as "Activo" | "Inactivo" })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoNuevoEmpleado(false)}>
              Cancelar
            </Button>
            <Button onClick={crearEmpleado}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para gestionar permisos */}
      <Dialog open={dialogoPermisos} onOpenChange={setDialogoPermisos}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gestionar Permisos</DialogTitle>
            <DialogDescription>Configure los permisos de acceso para {empleadoSeleccionado?.nombre}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge
                  className={`${empleadoSeleccionado ? getColorRol(empleadoSeleccionado.cargo) : ""} flex items-center gap-1`}
                >
                  {empleadoSeleccionado && getIconoRol(empleadoSeleccionado.cargo)}
                  {empleadoSeleccionado?.cargo}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {getDescripcionRol(empleadoSeleccionado?.cargo || "Mesero")}
                </span>
              </div>
            </div>

            <div className="border rounded-md">
              <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 font-medium text-sm">
                <div className="col-span-2">Sección</div>
                <div className="text-center">Ver</div>
                <div className="text-center">Editar</div>
              </div>

              <ScrollArea className="h-[300px]">
                {secciones.map((seccion) => {
                  const permiso = empleadoSeleccionado?.permisos.find((p) => p.seccionId === seccion.id) || {
                    seccionId: seccion.id,
                    ver: false,
                    editar: false,
                  }

                  return (
                    <div key={seccion.id} className="grid grid-cols-4 gap-4 p-3 border-t items-center">
                      <div className="col-span-2 flex items-center gap-2">
                        <div className="flex-shrink-0">{seccion.icono}</div>
                        <div>
                          <div className="font-medium">{seccion.nombre}</div>
                          <div className="text-xs text-muted-foreground">{seccion.descripcion}</div>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Checkbox
                          checked={permiso.ver}
                          onCheckedChange={(checked) => cambiarPermiso(seccion.id, "ver", checked === true)}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Checkbox
                          checked={permiso.editar}
                          disabled={!permiso.ver}
                          onCheckedChange={(checked) => cambiarPermiso(seccion.id, "editar", checked === true)}
                        />
                      </div>
                    </div>
                  )
                })}
              </ScrollArea>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              <p>* Los permisos de edición solo están disponibles si el permiso de visualización está activado.</p>
              <p>* Los permisos se aplicarán la próxima vez que el empleado inicie sesión.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoPermisos(false)}>
              Cancelar
            </Button>
            <Button onClick={actualizarPermisos}>Guardar Permisos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Función para obtener la descripción del rol
function getDescripcionRol(rol: RolEmpleado): string {
  switch (rol) {
    case "Administrador":
      return "Acceso completo a todas las funciones del sistema"
    case "Mesero":
      return "Gestión de mesas, pedidos y atención al cliente"
    case "Cocinero":
      return "Gestión de pedidos de cocina y preparación de alimentos"
    case "Bartender":
      return "Gestión de pedidos de bebidas y preparación de cócteles"
    case "Cajero":
      return "Gestión de pagos, cierres de caja y facturación"
    case "Recepcionista":
      return "Gestión de reservas, eventos y recepción de clientes"
    case "Gerente":
      return "Supervisión de operaciones, reportes y gestión de personal"
    default:
      return ""
  }
}

// Secciones del sistema
const secciones: SeccionSistema[] = [
  {
    id: "dashboard",
    nombre: "Dashboard",
    descripcion: "Panel principal con resumen de actividades",
    icono: <UserCircle className="h-5 w-5 text-gray-500" />,
  },
  {
    id: "empleados",
    nombre: "Empleados",
    descripcion: "Gestión de personal y asignación de roles",
    icono: <Users className="h-5 w-5 text-blue-500" />,
  },
  {
    id: "menus",
    nombre: "Menús",
    descripcion: "Gestión de productos, categorías y precios",
    icono: <Utensils className="h-5 w-5 text-green-500" />,
  },
  {
    id: "inventario-comidas",
    nombre: "Inventario Comidas",
    descripcion: "Control de stock de ingredientes para cocina",
    icono: <Package className="h-5 w-5 text-amber-500" />,
  },
  {
    id: "inventario-bebidas",
    nombre: "Inventario Bebidas",
    descripcion: "Control de stock de bebidas y licores",
    icono: <Package className="h-5 w-5 text-purple-500" />,
  },
  {
    id: "horarios",
    nombre: "Horarios",
    descripcion: "Programación de turnos y disponibilidad",
    icono: <Calendar className="h-5 w-5 text-indigo-500" />,
  },
  {
    id: "pedidos",
    nombre: "Pedidos",
    descripcion: "Gestión de órdenes y seguimiento",
    icono: <ClipboardList className="h-5 w-5 text-blue-500" />,
  },
  {
    id: "cocina",
    nombre: "Cocina",
    descripcion: "Preparación de alimentos y gestión de pedidos",
    icono: <ChefHat className="h-5 w-5 text-yellow-500" />,
  },
  {
    id: "bartending",
    nombre: "Bartending",
    descripcion: "Preparación de bebidas y gestión de pedidos",
    icono: <Coffee className="h-5 w-5 text-red-500" />,
  },
  {
    id: "pos",
    nombre: "Punto de Venta",
    descripcion: "Procesamiento de ventas y pagos",
    icono: <DollarSign className="h-5 w-5 text-green-500" />,
  },
  {
    id: "reservas",
    nombre: "Reservas",
    descripcion: "Gestión de reservaciones y eventos",
    icono: <Calendar className="h-5 w-5 text-pink-500" />,
  },
  {
    id: "espacio",
    nombre: "Espacio",
    descripcion: "Gestión de mesas y distribución del local",
    icono: <Package className="h-5 w-5 text-gray-500" />,
  },
  {
    id: "finanzas",
    nombre: "Finanzas",
    descripcion: "Reportes financieros y contabilidad",
    icono: <DollarSign className="h-5 w-5 text-emerald-500" />,
  },
]

// Datos de ejemplo
const empleados: Empleado[] = [
  {
    id: 1,
    nombre: "Juan Pérez",
    cargo: "Cocinero",
    contacto: "juan@ejemplo.com",
    estado: "Activo",
    horario: "Lun-Vie: 8am-4pm",
    permisos: [
      { seccionId: "dashboard", ver: true, editar: false },
      { seccionId: "cocina", ver: true, editar: true },
      { seccionId: "pedidos", ver: true, editar: false },
      { seccionId: "inventario-comidas", ver: true, editar: true },
    ],
  },
  {
    id: 2,
    nombre: "María López",
    cargo: "Mesero",
    contacto: "maria@ejemplo.com",
    estado: "Activo",
    horario: "Lun-Vie: 4pm-12am",
    permisos: [
      { seccionId: "dashboard", ver: true, editar: false },
      { seccionId: "pedidos", ver: true, editar: true },
      { seccionId: "pos", ver: true, editar: true },
      { seccionId: "espacio", ver: true, editar: false },
    ],
  },
  {
    id: 3,
    nombre: "Carlos Rodríguez",
    cargo: "Bartender",
    contacto: "carlos@ejemplo.com",
    estado: "Activo",
    horario: "Vie-Dom: 6pm-2am",
    permisos: [
      { seccionId: "dashboard", ver: true, editar: false },
      { seccionId: "bartending", ver: true, editar: true },
      { seccionId: "pedidos", ver: true, editar: false },
      { seccionId: "inventario-bebidas", ver: true, editar: true },
    ],
  },
  {
    id: 4,
    nombre: "Ana Martínez",
    cargo: "Recepcionista",
    contacto: "ana@ejemplo.com",
    estado: "Activo",
    horario: "Lun-Vie: 10am-6pm",
    permisos: [
      { seccionId: "dashboard", ver: true, editar: false },
      { seccionId: "reservas", ver: true, editar: true },
      { seccionId: "espacio", ver: true, editar: false },
    ],
  },
  {
    id: 5,
    nombre: "Roberto Sánchez",
    cargo: "Administrador",
    contacto: "roberto@ejemplo.com",
    estado: "Inactivo",
    horario: "Lun-Vie: 8am-4pm",
    permisos: secciones.map((seccion) => ({
      seccionId: seccion.id,
      ver: true,
      editar: true,
    })),
  },
  {
    id: 6,
    nombre: "Laura Gómez",
    cargo: "Cajero",
    contacto: "laura@ejemplo.com",
    estado: "Inactivo",
    horario: "Sab-Dom: 12pm-8pm",
    permisos: [
      { seccionId: "dashboard", ver: true, editar: false },
      { seccionId: "pos", ver: true, editar: true },
      { seccionId: "finanzas", ver: true, editar: false },
    ],
  },
  {
    id: 7,
    nombre: "Miguel Torres",
    cargo: "Gerente",
    contacto: "miguel@ejemplo.com",
    estado: "Activo",
    horario: "Lun-Vie: 9am-5pm",
    permisos: [
      { seccionId: "dashboard", ver: true, editar: true },
      { seccionId: "empleados", ver: true, editar: true },
      { seccionId: "finanzas", ver: true, editar: true },
      { seccionId: "menus", ver: true, editar: true },
      { seccionId: "inventario-comidas", ver: true, editar: false },
      { seccionId: "inventario-bebidas", ver: true, editar: false },
      { seccionId: "horarios", ver: true, editar: true },
      { seccionId: "pedidos", ver: true, editar: false },
      { seccionId: "reservas", ver: true, editar: false },
      { seccionId: "espacio", ver: true, editar: true },
    ],
  },
]
