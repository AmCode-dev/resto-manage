"use client"

import React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Save, Trash2, X, Loader2, Check, Coffee, Trash } from "lucide-react"
import { Input } from "@/components/ui/input"
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
import { toast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

// Importamos Draggable de react-draggable
import Draggable from "react-draggable"

// Tipos para nuestros datos
type MesaEstado = "Disponible" | "Ocupada" | "Reservada" | "Sucia"

type Mesa = {
  id: number
  numero: number
  capacidad: number
  tamano: "Pequeña" | "Mediana" | "Grande"
  zona: string
  estado: MesaEstado
  posicion: { x: number; y: number }
  // Datos adicionales opcionales
  cliente?: string
  horaInicio?: string
  duracion?: string
  horaReserva?: string
}

type Zona = {
  id: string
  nombre: string
  descripcion: string
}

export default function EspacioPage() {
  // Estado para las mesas y zonas
  const [mesasState, setMesasState] = useState<Mesa[]>(mesas)
  const [zonas, setZonas] = useState<Zona[]>([
    { id: "salon", nombre: "Salón Principal", descripcion: "Área principal del restaurante" },
    { id: "terraza", nombre: "Terraza", descripcion: "Área exterior con vista" },
    { id: "privado", nombre: "Salón Privado", descripcion: "Área para eventos privados" },
  ])

  // Estado para la zona activa
  const [activeZone, setActiveZone] = useState<string>("salon")

  // Estado para la mesa seleccionada
  const [selectedTable, setSelectedTable] = useState<number | null>(null)

  // Estado para el modo de edición
  const [editMode, setEditMode] = useState(false)

  // Estado para el diálogo de nueva zona
  const [newZoneDialogOpen, setNewZoneDialogOpen] = useState(false)
  const [newZoneName, setNewZoneName] = useState("")
  const [newZoneDescription, setNewZoneDescription] = useState("")

  // Estado para el diálogo de nueva mesa
  const [newTableDialogOpen, setNewTableDialogOpen] = useState(false)
  const [newTableNumber, setNewTableNumber] = useState("")
  const [newTableCapacity, setNewTableCapacity] = useState("")
  const [newTableSize, setNewTableSize] = useState<"Pequeña" | "Mediana" | "Grande">("Mediana")

  // Mapa de referencias para el drag and drop
  const nodeRefs = useRef<{ [key: number]: React.RefObject<HTMLDivElement> }>({})

  // Inicializar referencias para cada mesa
  mesasState.forEach((mesa) => {
    if (!nodeRefs.current[mesa.id]) {
      nodeRefs.current[mesa.id] = React.createRef<HTMLDivElement>()
    }
  })

  // Función para manejar el arrastre de mesas
  const handleDrag = (id: number, e: any, data: { x: number; y: number }) => {
    setMesasState((prevMesas) =>
      prevMesas.map((mesa) =>
        mesa.id === id
          ? {
              ...mesa,
              posicion: {
                x: data.x,
                y: data.y,
              },
            }
          : mesa,
      ),
    )
  }

  // Función para guardar la distribución
  const saveLayout = () => {
    setEditMode(false)
    // Aquí se implementaría la lógica para guardar en la base de datos
    console.log("Nueva distribución guardada:", mesasState)
    toast({
      title: "Distribución guardada",
      description: "Los cambios en la distribución han sido guardados correctamente.",
    })
  }

  // Función para añadir una nueva zona
  const addNewZone = () => {
    if (!newZoneName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la zona no puede estar vacío.",
        variant: "destructive",
      })
      return
    }

    const newZoneId = newZoneName.toLowerCase().replace(/\s+/g, "-")

    // Verificar si ya existe una zona con ese ID
    if (zonas.some((zona) => zona.id === newZoneId)) {
      toast({
        title: "Error",
        description: "Ya existe una zona con un nombre similar.",
        variant: "destructive",
      })
      return
    }

    const newZone: Zona = {
      id: newZoneId,
      nombre: newZoneName,
      descripcion: newZoneDescription || `Área ${newZoneName}`,
    }

    setZonas([...zonas, newZone])
    setActiveZone(newZoneId)
    setNewZoneDialogOpen(false)
    setNewZoneName("")
    setNewZoneDescription("")

    toast({
      title: "Zona añadida",
      description: `La zona "${newZoneName}" ha sido añadida correctamente.`,
    })
  }

  // Función para eliminar una zona
  const deleteZone = (zoneId: string) => {
    // No permitir eliminar si solo queda una zona
    if (zonas.length <= 1) {
      toast({
        title: "Error",
        description: "Debe existir al menos una zona.",
        variant: "destructive",
      })
      return
    }

    // Preguntar confirmación
    if (!confirm(`¿Estás seguro de que deseas eliminar esta zona? Se eliminarán todas las mesas asociadas.`)) {
      return
    }

    // Eliminar la zona
    const updatedZonas = zonas.filter((zona) => zona.id !== zoneId)
    setZonas(updatedZonas)

    // Eliminar las mesas de esa zona
    const updatedMesas = mesasState.filter((mesa) => mesa.zona !== zonas.find((z) => z.id === zoneId)?.nombre)
    setMesasState(updatedMesas)

    // Cambiar a la primera zona disponible
    setActiveZone(updatedZonas[0].id)

    toast({
      title: "Zona eliminada",
      description: "La zona y sus mesas han sido eliminadas correctamente.",
    })
  }

  // Función para añadir una nueva mesa
  const addNewTable = () => {
    if (!newTableNumber || !newTableCapacity) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios.",
        variant: "destructive",
      })
      return
    }

    const tableNumber = Number.parseInt(newTableNumber)
    const capacity = Number.parseInt(newTableCapacity)

    if (isNaN(tableNumber) || isNaN(capacity) || tableNumber <= 0 || capacity <= 0) {
      toast({
        title: "Error",
        description: "El número de mesa y la capacidad deben ser números positivos.",
        variant: "destructive",
      })
      return
    }

    // Verificar si ya existe una mesa con ese número en la zona actual
    const currentZoneName = zonas.find((zona) => zona.id === activeZone)?.nombre
    if (mesasState.some((mesa) => mesa.numero === tableNumber && mesa.zona === currentZoneName)) {
      toast({
        title: "Error",
        description: `Ya existe una mesa con el número ${tableNumber} en esta zona.`,
        variant: "destructive",
      })
      return
    }

    // Crear nueva mesa
    const newMesa: Mesa = {
      id: Math.max(0, ...mesasState.map((m) => m.id)) + 1,
      numero: tableNumber,
      capacidad: capacity,
      tamano: newTableSize,
      zona: currentZoneName || "Salón Principal",
      estado: "Disponible",
      posicion: { x: 50, y: 50 }, // Posición inicial
    }

    // Crear una nueva referencia para esta mesa
    nodeRefs.current[newMesa.id] = React.createRef<HTMLDivElement>()

    setMesasState([...mesasState, newMesa])
    setNewTableDialogOpen(false)
    setNewTableNumber("")
    setNewTableCapacity("")
    setNewTableSize("Mediana")

    toast({
      title: "Mesa añadida",
      description: `La mesa ${tableNumber} ha sido añadida correctamente.`,
    })
  }

  // Función para eliminar una mesa
  const deleteTable = (tableId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta mesa?")) {
      return
    }

    setMesasState(mesasState.filter((mesa) => mesa.id !== tableId))
    setSelectedTable(null)

    toast({
      title: "Mesa eliminada",
      description: "La mesa ha sido eliminada correctamente.",
    })
  }

  // Función para cambiar el estado de una mesa
  const cambiarEstadoMesa = (mesaId: number, nuevoEstado: MesaEstado) => {
    setMesasState((prevMesas) =>
      prevMesas.map((mesa) =>
        mesa.id === mesaId
          ? {
              ...mesa,
              estado: nuevoEstado,
              // Actualizar datos adicionales según el estado
              ...(nuevoEstado === "Ocupada"
                ? {
                    horaInicio: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    cliente: "Cliente nuevo",
                  }
                : {}),
              ...(nuevoEstado === "Disponible"
                ? {
                    horaInicio: undefined,
                    duracion: undefined,
                    cliente: undefined,
                  }
                : {}),
            }
          : mesa,
      ),
    )

    const estadoTexto = {
      Disponible: "disponible",
      Ocupada: "ocupada",
      Reservada: "reservada",
      Sucia: "marcada como sucia",
    }

    toast({
      title: "Estado actualizado",
      description: `La mesa ha sido ${estadoTexto[nuevoEstado]} correctamente.`,
    })
  }

  // Función para obtener el color de fondo según el estado de la mesa
  const getTableBackgroundClass = (estado: MesaEstado) => {
    switch (estado) {
      case "Disponible":
        return "bg-green-100 border-green-300"
      case "Ocupada":
        return "bg-red-100 border-red-300"
      case "Reservada":
        return "bg-yellow-100 border-yellow-300"
      case "Sucia":
        return "bg-gray-200 border-gray-400"
      default:
        return "bg-green-100 border-green-300"
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Espacio</h1>
        <div className="flex gap-2">
          {editMode ? (
            <Button onClick={saveLayout}>
              <Save className="mr-2 h-4 w-4" /> Guardar Distribución
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setEditMode(true)}>
              <Edit className="mr-2 h-4 w-4" /> Editar Distribución
            </Button>
          )}
          <Dialog open={newTableDialogOpen} onOpenChange={setNewTableDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nueva Mesa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Nueva Mesa</DialogTitle>
                <DialogDescription>
                  Introduce los detalles de la nueva mesa para la zona{" "}
                  {zonas.find((zona) => zona.id === activeZone)?.nombre}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tableNumber" className="text-right">
                    Número
                  </Label>
                  <Input
                    id="tableNumber"
                    type="number"
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    className="col-span-3"
                    min="1"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tableCapacity" className="text-right">
                    Capacidad
                  </Label>
                  <Input
                    id="tableCapacity"
                    type="number"
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(e.target.value)}
                    className="col-span-3"
                    min="1"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tableSize" className="text-right">
                    Tamaño
                  </Label>
                  <select
                    id="tableSize"
                    value={newTableSize}
                    onChange={(e) => setNewTableSize(e.target.value as "Pequeña" | "Mediana" | "Grande")}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Pequeña">Pequeña</option>
                    <option value="Mediana">Mediana</option>
                    <option value="Grande">Grande</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewTableDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={addNewTable}>Añadir Mesa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={newZoneDialogOpen} onOpenChange={setNewZoneDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Plus className="mr-2 h-4 w-4" /> Nueva Zona
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Nueva Zona</DialogTitle>
                <DialogDescription>Introduce los detalles de la nueva zona para el restaurante.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="zoneName" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="zoneName"
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="zoneDescription" className="text-right">
                    Descripción
                  </Label>
                  <Input
                    id="zoneDescription"
                    value={newZoneDescription}
                    onChange={(e) => setNewZoneDescription(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewZoneDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={addNewZone}>Añadir Zona</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeZone} onValueChange={setActiveZone} className="space-y-4">
        <div className="flex justify-between items-center">
          <ScrollArea className="w-full max-w-[80%]">
            <TabsList className="inline-flex h-10">
              {zonas.map((zona) => (
                <TabsTrigger key={zona.id} value={zona.id} className="relative group">
                  {zona.nombre}
                  {editMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteZone(zona.id)
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar zona"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </div>

        {zonas.map((zona) => (
          <TabsContent key={zona.id} value={zona.id} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Mesas - {zona.nombre}</CardTitle>
                  <CardDescription>
                    {editMode ? "Arrastra las mesas para cambiar su posición" : zona.descripcion}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-[400px] border rounded-md bg-gray-50 p-4">
                    {/* Elementos decorativos específicos de cada zona */}
                    {zona.id === "salon" && (
                      <>
                        <div className="absolute top-10 left-10 w-40 h-8 bg-gray-300 rounded-md flex items-center justify-center text-xs">
                          Entrada
                        </div>
                        <div className="absolute bottom-10 right-10 w-40 h-20 bg-gray-300 rounded-md flex items-center justify-center text-xs">
                          Barra
                        </div>
                      </>
                    )}

                    {zona.id === "terraza" && (
                      <>
                        <div className="absolute top-10 left-10 w-40 h-8 bg-green-200 rounded-md flex items-center justify-center text-xs">
                          Jardín
                        </div>
                        <div className="absolute bottom-10 right-10 w-40 h-20 bg-blue-200 rounded-md flex items-center justify-center text-xs">
                          Fuente
                        </div>
                      </>
                    )}

                    {zona.id === "privado" && (
                      <>
                        <div className="absolute top-10 left-10 w-40 h-8 bg-purple-200 rounded-md flex items-center justify-center text-xs">
                          Entrada Privada
                        </div>
                        <div className="absolute bottom-10 right-10 w-40 h-20 bg-amber-200 rounded-md flex items-center justify-center text-xs">
                          Escenario
                        </div>
                      </>
                    )}

                    {/* Representación visual de las mesas con drag and drop */}
                    {mesasState
                      .filter((mesa) => mesa.zona === zona.nombre)
                      .map((mesa) => (
                        <Draggable
                          key={mesa.id}
                          nodeRef={nodeRefs.current[mesa.id]}
                          position={{ x: mesa.posicion.x, y: mesa.posicion.y }}
                          onStop={(e, data) => handleDrag(mesa.id, e, data)}
                          disabled={!editMode}
                          bounds="parent"
                        >
                          <div
                            ref={nodeRefs.current[mesa.id]}
                            className={`absolute cursor-pointer rounded-md border p-2 text-center ${
                              selectedTable === mesa.id ? "ring-2 ring-primary" : ""
                            } ${getTableBackgroundClass(mesa.estado)} ${editMode ? "cursor-move" : "cursor-pointer"}`}
                            style={{
                              width: `${mesa.tamano === "Grande" ? 100 : mesa.tamano === "Mediana" ? 80 : 60}px`,
                              height: `${mesa.tamano === "Grande" ? 100 : mesa.tamano === "Mediana" ? 80 : 60}px`,
                            }}
                            onClick={() => !editMode && setSelectedTable(mesa.id)}
                          >
                            <div className="font-medium">Mesa {mesa.numero}</div>
                            <div className="text-xs">{mesa.capacidad} pers.</div>
                            {mesa.estado === "Sucia" && (
                              <div className="absolute top-1 right-1">
                                <Trash className="h-3 w-3 text-gray-600" />
                              </div>
                            )}
                          </div>
                        </Draggable>
                      ))}
                  </div>
                  {editMode && (
                    <div className="mt-2 text-sm text-muted-foreground text-center">
                      Arrastra las mesas para reorganizar el espacio. Haz clic en "Guardar Distribución" cuando
                      termines.
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedTable
                      ? `Mesa ${mesasState.find((m) => m.id === selectedTable)?.numero}`
                      : "Información de Mesa"}
                  </CardTitle>
                  <CardDescription>
                    {selectedTable ? `Detalles de la mesa seleccionada` : "Selecciona una mesa para ver detalles"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedTable ? (
                    <div className="space-y-4">
                      {(() => {
                        const mesa = mesasState.find((m) => m.id === selectedTable)
                        if (!mesa) return null

                        return (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-muted-foreground">Número</div>
                                <div className="font-medium">{mesa.numero}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-muted-foreground">Capacidad</div>
                                <div className="font-medium">{mesa.capacidad} personas</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-muted-foreground">Tamaño</div>
                                <div className="font-medium">{mesa.tamano}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-muted-foreground">Zona</div>
                                <div className="font-medium">{mesa.zona}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-muted-foreground">Posición</div>
                                <div className="font-medium">
                                  X: {mesa.posicion.x}, Y: {mesa.posicion.y}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-muted-foreground">Estado</div>
                              <Badge
                                variant={
                                  mesa.estado === "Disponible"
                                    ? "outline"
                                    : mesa.estado === "Reservada"
                                      ? "secondary"
                                      : mesa.estado === "Sucia"
                                        ? "outline"
                                        : "destructive"
                                }
                                className={`mt-1 ${mesa.estado === "Sucia" ? "bg-gray-200 text-gray-800" : ""}`}
                              >
                                {mesa.estado}
                              </Badge>
                            </div>
                            {mesa.estado === "Ocupada" && (
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-muted-foreground">Ocupada desde</div>
                                <div className="font-medium">{mesa.horaInicio || "19:30"} (45 min)</div>
                                <div className="text-sm font-medium text-muted-foreground mt-2">Cliente</div>
                                <div className="font-medium">{mesa.cliente || "Familia Rodríguez"}</div>
                              </div>
                            )}
                            {mesa.estado === "Reservada" && (
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-muted-foreground">Reservada para</div>
                                <div className="font-medium">{mesa.horaReserva || "21:00"}</div>
                                <div className="text-sm font-medium text-muted-foreground mt-2">Cliente</div>
                                <div className="font-medium">{mesa.cliente || "María González"}</div>
                              </div>
                            )}
                            <div className="pt-2 space-y-2">
                              {/* Acciones según el estado actual de la mesa */}
                              {mesa.estado === "Disponible" && (
                                <Button className="w-full" onClick={() => cambiarEstadoMesa(mesa.id, "Ocupada")}>
                                  <Coffee className="mr-2 h-4 w-4" /> Ocupar Mesa
                                </Button>
                              )}
                              {mesa.estado === "Ocupada" && (
                                <Button
                                  className="w-full"
                                  variant="secondary"
                                  onClick={() => cambiarEstadoMesa(mesa.id, "Sucia")}
                                >
                                  <Trash className="mr-2 h-4 w-4" /> Marcar como Sucia
                                </Button>
                              )}
                              {mesa.estado === "Sucia" && (
                                <Button
                                  className="w-full bg-transparent"
                                  variant="outline"
                                  onClick={() => cambiarEstadoMesa(mesa.id, "Disponible")}
                                >
                                  <Check className="mr-2 h-4 w-4" /> Marcar como Limpia
                                </Button>
                              )}
                              {mesa.estado === "Reservada" && (
                                <Button
                                  className="w-full"
                                  variant="secondary"
                                  onClick={() => cambiarEstadoMesa(mesa.id, "Ocupada")}
                                >
                                  <Loader2 className="mr-2 h-4 w-4" /> Cliente Llegó
                                </Button>
                              )}
                              {/* Botón para liberar mesa (disponible para todos los estados excepto Disponible) */}
                              {mesa.estado !== "Disponible" && (
                                <Button
                                  className="w-full bg-transparent"
                                  variant="outline"
                                  onClick={() => cambiarEstadoMesa(mesa.id, "Disponible")}
                                >
                                  <Check className="mr-2 h-4 w-4" /> Liberar Mesa
                                </Button>
                              )}
                              {editMode && (
                                <Button
                                  variant="destructive"
                                  className="w-full"
                                  onClick={() => deleteTable(mesa.id)}
                                  title="Eliminar mesa"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar Mesa
                                </Button>
                              )}
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                      Selecciona una mesa del plano para ver sus detalles
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Ocupación - {zona.nombre}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-muted-foreground">Mesas Disponibles</div>
                    <div className="text-2xl font-bold text-green-600">
                      {mesasState.filter((m) => m.estado === "Disponible" && m.zona === zona.nombre).length}
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-muted-foreground">Mesas Reservadas</div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {mesasState.filter((m) => m.estado === "Reservada" && m.zona === zona.nombre).length}
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-muted-foreground">Mesas Ocupadas</div>
                    <div className="text-2xl font-bold text-red-600">
                      {mesasState.filter((m) => m.estado === "Ocupada" && m.zona === zona.nombre).length}
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-muted-foreground">Mesas Sucias</div>
                    <div className="text-2xl font-bold text-gray-600">
                      {mesasState.filter((m) => m.estado === "Sucia" && m.zona === zona.nombre).length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

const mesas = [
  {
    id: 1,
    numero: 1,
    capacidad: 4,
    tamano: "Mediana" as const,
    zona: "Salón Principal",
    estado: "Disponible" as const,
    posicion: { x: 50, y: 50 },
  },
  {
    id: 2,
    numero: 2,
    capacidad: 2,
    tamano: "Pequeña" as const,
    zona: "Salón Principal",
    estado: "Ocupada" as const,
    posicion: { x: 150, y: 50 },
    horaInicio: "19:30",
    cliente: "Familia Rodríguez",
  },
  {
    id: 3,
    numero: 3,
    capacidad: 6,
    tamano: "Grande" as const,
    zona: "Salón Principal",
    estado: "Reservada" as const,
    posicion: { x: 250, y: 50 },
    horaReserva: "21:00",
    cliente: "María González",
  },
  {
    id: 4,
    numero: 4,
    capacidad: 4,
    tamano: "Mediana" as const,
    zona: "Salón Principal",
    estado: "Disponible" as const,
    posicion: { x: 50, y: 170 },
  },
  {
    id: 5,
    numero: 5,
    capacidad: 4,
    tamano: "Mediana" as const,
    zona: "Salón Principal",
    estado: "Ocupada" as const,
    posicion: { x: 150, y: 170 },
    horaInicio: "20:15",
    cliente: "Familia López",
  },
  {
    id: 6,
    numero: 6,
    capacidad: 8,
    tamano: "Grande" as const,
    zona: "Salón Principal",
    estado: "Sucia" as const,
    posicion: { x: 250, y: 170 },
  },
  {
    id: 7,
    numero: 7,
    capacidad: 2,
    tamano: "Pequeña" as const,
    zona: "Salón Principal",
    estado: "Disponible" as const,
    posicion: { x: 50, y: 290 },
  },
  {
    id: 8,
    numero: 8,
    capacidad: 2,
    tamano: "Pequeña" as const,
    zona: "Salón Principal",
    estado: "Ocupada" as const,
    posicion: { x: 150, y: 290 },
    horaInicio: "20:30",
    cliente: "Pareja Martínez",
  },
  // Mesas para la terraza
  {
    id: 9,
    numero: 1,
    capacidad: 4,
    tamano: "Mediana" as const,
    zona: "Terraza",
    estado: "Disponible" as const,
    posicion: { x: 50, y: 50 },
  },
  {
    id: 10,
    numero: 2,
    capacidad: 2,
    tamano: "Pequeña" as const,
    zona: "Terraza",
    estado: "Ocupada" as const,
    posicion: { x: 150, y: 50 },
    horaInicio: "19:45",
    cliente: "Familia García",
  },
  {
    id: 12,
    numero: 3,
    capacidad: 6,
    tamano: "Grande" as const,
    zona: "Terraza",
    estado: "Sucia" as const,
    posicion: { x: 250, y: 50 },
  },
  // Mesas para el salón privado
  {
    id: 11,
    numero: 1,
    capacidad: 8,
    tamano: "Grande" as const,
    zona: "Salón Privado",
    estado: "Reservada" as const,
    posicion: { x: 100, y: 100 },
    horaReserva: "21:30",
    cliente: "Evento Corporativo",
  },
]
