"use client"

import React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Edit,
  Plus,
  Save,
  Trash2,
  X,
  Loader2,
  Check,
  Coffee,
  Trash,
  Receipt,
  Link,
  Unlink,
  Square,
  Circle,
  Triangle,
} from "lucide-react"
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
import { Separator } from "@/components/ui/separator"

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
  // Campos para fusión y cuenta
  esFusionada?: boolean
  mesasOriginales?: {
    id: number
    numero: number
    capacidad: number
    tamano: "Pequeña" | "Mediana" | "Grande"
    posicionOriginal: { x: number; y: number }
  }[]
  cuenta?: {
    items: { nombre: string; cantidad: number; precio: number }[]
    total: number
  }
}

type TipoEstructura = "pared" | "escenario" | "barra" | "entrada" | "decoracion" | "columna"

type Estructura = {
  id: number
  tipo: TipoEstructura
  nombre: string
  zona: string
  posicion: { x: number; y: number }
  tamano: { width: number; height: number }
  color: string
  descripcion?: string
}

type Zona = {
  id: string
  nombre: string
  descripcion: string
}

export default function EspacioPage() {
  // Estado para las mesas y zonas
  const [mesasState, setMesasState] = useState<Mesa[]>(mesas)
  const [estructuras, setEstructuras] = useState<Estructura[]>(estructurasIniciales)
  const [zonas, setZonas] = useState<Zona[]>([
    { id: "salon", nombre: "Salón Principal", descripcion: "Área principal del restaurante" },
    { id: "terraza", nombre: "Terraza", descripcion: "Área exterior con vista" },
    { id: "privado", nombre: "Salón Privado", descripcion: "Área para eventos privados" },
  ])

  // Estado para la zona activa
  const [activeZone, setActiveZone] = useState<string>("salon")

  // Estado para la mesa seleccionada
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [selectedTables, setSelectedTables] = useState<number[]>([])
  const [selectedStructure, setSelectedStructure] = useState<number | null>(null)

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

  // Estado para el diálogo de nueva estructura
  const [newStructureDialogOpen, setNewStructureDialogOpen] = useState(false)
  const [newStructureName, setNewStructureName] = useState("")
  const [newStructureType, setNewStructureType] = useState<TipoEstructura>("pared")
  const [newStructureColor, setNewStructureColor] = useState("#8B5CF6")
  const [newStructureWidth, setNewStructureWidth] = useState("100")
  const [newStructureHeight, setNewStructureHeight] = useState("20")
  const [newStructureDescription, setNewStructureDescription] = useState("")

  // Estado para el diálogo de cuenta
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)

  // Mapa de referencias para el drag and drop
  const nodeRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({})

  // Inicializar referencias para cada mesa y estructura
  mesasState.forEach((mesa) => {
    const key = `mesa-${mesa.id}`
    if (!nodeRefs.current[key]) {
      nodeRefs.current[key] = React.createRef<HTMLDivElement>()
    }
  })

  estructuras.forEach((estructura) => {
    const key = `estructura-${estructura.id}`
    if (!nodeRefs.current[key]) {
      nodeRefs.current[key] = React.createRef<HTMLDivElement>()
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

  // Función para manejar el arrastre de estructuras
  const handleStructureDrag = (id: number, e: any, data: { x: number; y: number }) => {
    setEstructuras((prevEstructuras) =>
      prevEstructuras.map((estructura) =>
        estructura.id === id
          ? {
              ...estructura,
              posicion: {
                x: data.x,
                y: data.y,
              },
            }
          : estructura,
      ),
    )
  }

  // Función para guardar la distribución
  const saveLayout = () => {
    setEditMode(false)
    setSelectedTables([])
    // Aquí se implementaría la lógica para guardar en la base de datos
    console.log("Nueva distribución guardada:", { mesas: mesasState, estructuras })
    toast({
      title: "Distribución guardada",
      description: "Los cambios en la distribución han sido guardados correctamente.",
    })
  }

  // Función para fusionar mesas seleccionadas
  const mergeTables = () => {
    if (selectedTables.length < 2) {
      toast({
        title: "Error",
        description: "Selecciona al menos 2 mesas para fusionar.",
        variant: "destructive",
      })
      return
    }

    const tablesToMerge = mesasState.filter((mesa) => selectedTables.includes(mesa.id))

    // Calcular posición central para la mesa fusionada
    const avgX = tablesToMerge.reduce((sum, mesa) => sum + mesa.posicion.x, 0) / tablesToMerge.length
    const avgY = tablesToMerge.reduce((sum, mesa) => sum + mesa.posicion.y, 0) / tablesToMerge.length

    // Crear nueva mesa fusionada
    const mergedTable: Mesa = {
      id: Math.max(...mesasState.map((m) => m.id)) + 1,
      numero: Math.min(...tablesToMerge.map((m) => m.numero)), // Usar el número más bajo
      capacidad: tablesToMerge.reduce((sum, mesa) => sum + mesa.capacidad, 0),
      tamano: "Grande" as const, // Las mesas fusionadas siempre son grandes
      zona: tablesToMerge[0].zona,
      estado: "Disponible" as const,
      posicion: { x: avgX, y: avgY },
      esFusionada: true,
      mesasOriginales: tablesToMerge.map((mesa) => ({
        id: mesa.id,
        numero: mesa.numero,
        capacidad: mesa.capacidad,
        tamano: mesa.tamano,
        posicionOriginal: mesa.posicion,
      })),
    }

    // Crear referencia para la nueva mesa fusionada
    nodeRefs.current[`mesa-${mergedTable.id}`] = React.createRef<HTMLDivElement>()

    // Actualizar estado: remover mesas originales y agregar mesa fusionada
    setMesasState((prevMesas) => [...prevMesas.filter((mesa) => !selectedTables.includes(mesa.id)), mergedTable])

    setSelectedTables([])
    setSelectedTable(mergedTable.id)

    toast({
      title: "Mesas fusionadas",
      description: `Se han fusionado ${tablesToMerge.length} mesas en la Mesa ${mergedTable.numero}.`,
    })
  }

  // Función para separar mesa fusionada
  const separateTables = (tableId: number) => {
    const mesaFusionada = mesasState.find((m) => m.id === tableId)
    if (!mesaFusionada || !mesaFusionada.esFusionada || !mesaFusionada.mesasOriginales) {
      toast({
        title: "Error",
        description: "Esta mesa no puede ser separada.",
        variant: "destructive",
      })
      return
    }

    // Recrear las mesas originales posicionándolas una al lado de la otra
    const mesasRecreadas: Mesa[] = mesaFusionada.mesasOriginales.map((mesaOriginal, index) => {
      // Posicionar las mesas en línea horizontal, una al lado de la otra
      const offsetX = index * 80 // Separación horizontal de 80px entre mesas
      const nuevaPosicion = {
        x: Math.max(10, mesaFusionada.posicion.x + offsetX), // Asegurar que no salga del área
        y: mesaFusionada.posicion.y,
      }

      const mesaRecreada: Mesa = {
        id: mesaOriginal.id,
        numero: mesaOriginal.numero,
        capacidad: mesaOriginal.capacidad,
        tamano: mesaOriginal.tamano,
        zona: mesaFusionada.zona,
        estado: "Disponible" as const,
        posicion: nuevaPosicion,
        esFusionada: false,
        mesasOriginales: undefined,
      }

      // Crear referencia para la mesa recreada
      if (!nodeRefs.current[`mesa-${mesaRecreada.id}`]) {
        nodeRefs.current[`mesa-${mesaRecreada.id}`] = React.createRef<HTMLDivElement>()
      }

      return mesaRecreada
    })

    // Actualizar estado: remover mesa fusionada y agregar mesas separadas
    setMesasState((prevMesas) => [...prevMesas.filter((mesa) => mesa.id !== tableId), ...mesasRecreadas])

    // Seleccionar la primera mesa separada
    setSelectedTable(mesasRecreadas[0].id)

    toast({
      title: "Mesas separadas",
      description: `La mesa fusionada ha sido separada en ${mesasRecreadas.length} mesas individuales.`,
    })
  }

  // Función para manejar selección múltiple de mesas
  const handleTableSelection = (tableId: number, ctrlKey = false) => {
    if (ctrlKey || selectedTables.length > 0) {
      // Selección múltiple
      setSelectedTables((prev) => (prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]))
      setSelectedTable(null)
      setSelectedStructure(null)
    } else {
      // Selección individual
      setSelectedTable(tableId)
      setSelectedTables([])
      setSelectedStructure(null)
    }
  }

  // Función para manejar selección de estructuras
  const handleStructureSelection = (structureId: number) => {
    setSelectedStructure(structureId)
    setSelectedTable(null)
    setSelectedTables([])
  }

  // Función para limpiar selecciones
  const clearSelections = () => {
    setSelectedTable(null)
    setSelectedTables([])
    setSelectedStructure(null)
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
    if (
      !confirm(`¿Estás seguro de que deseas eliminar esta zona? Se eliminarán todas las mesas y estructuras asociadas.`)
    ) {
      return
    }

    // Eliminar la zona
    const updatedZonas = zonas.filter((zona) => zona.id !== zoneId)
    setZonas(updatedZonas)

    // Eliminar las mesas y estructuras de esa zona
    const zoneName = zonas.find((z) => z.id === zoneId)?.nombre
    const updatedMesas = mesasState.filter((mesa) => mesa.zona !== zoneName)
    const updatedEstructuras = estructuras.filter((estructura) => estructura.zona !== zoneName)
    setMesasState(updatedMesas)
    setEstructuras(updatedEstructuras)

    // Cambiar a la primera zona disponible
    setActiveZone(updatedZonas[0].id)

    toast({
      title: "Zona eliminada",
      description: "La zona y sus elementos han sido eliminados correctamente.",
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
      esFusionada: false,
    }

    // Crear una nueva referencia para esta mesa
    nodeRefs.current[`mesa-${newMesa.id}`] = React.createRef<HTMLDivElement>()

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

  // Función para añadir una nueva estructura
  const addNewStructure = () => {
    if (!newStructureName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la estructura no puede estar vacío.",
        variant: "destructive",
      })
      return
    }

    const width = Number.parseInt(newStructureWidth)
    const height = Number.parseInt(newStructureHeight)

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      toast({
        title: "Error",
        description: "Las dimensiones deben ser números positivos.",
        variant: "destructive",
      })
      return
    }

    // Crear nueva estructura
    const newStructure: Estructura = {
      id: Math.max(0, ...estructuras.map((e) => e.id)) + 1,
      tipo: newStructureType,
      nombre: newStructureName,
      zona: zonas.find((zona) => zona.id === activeZone)?.nombre || "Salón Principal",
      posicion: { x: 100, y: 100 }, // Posición inicial
      tamano: { width, height },
      color: newStructureColor,
      descripcion: newStructureDescription,
    }

    // Crear una nueva referencia para esta estructura
    nodeRefs.current[`estructura-${newStructure.id}`] = React.createRef<HTMLDivElement>()

    setEstructuras([...estructuras, newStructure])
    setNewStructureDialogOpen(false)
    setNewStructureName("")
    setNewStructureDescription("")
    setNewStructureWidth("100")
    setNewStructureHeight("20")
    setNewStructureType("pared")
    setNewStructureColor("#8B5CF6")

    toast({
      title: "Estructura añadida",
      description: `La estructura "${newStructureName}" ha sido añadida correctamente.`,
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

  // Función para eliminar una estructura
  const deleteStructure = (structureId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta estructura?")) {
      return
    }

    setEstructuras(estructuras.filter((estructura) => estructura.id !== structureId))
    setSelectedStructure(null)

    toast({
      title: "Estructura eliminada",
      description: "La estructura ha sido eliminada correctamente.",
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
                    cuenta: {
                      items: [
                        { nombre: "Entrada del día", cantidad: 2, precio: 12.5 },
                        { nombre: "Plato principal", cantidad: 2, precio: 25.0 },
                        { nombre: "Bebidas", cantidad: 3, precio: 8.0 },
                      ],
                      total: 69.0,
                    },
                  }
                : {}),
              ...(nuevoEstado === "Disponible"
                ? {
                    horaInicio: undefined,
                    duracion: undefined,
                    cliente: undefined,
                    cuenta: undefined,
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
  const getTableBackgroundClass = (
    estado: MesaEstado,
    isSelected = false,
    isSelectedMultiple = false,
    esFusionada = false,
  ) => {
    let baseClass = ""

    switch (estado) {
      case "Disponible":
        baseClass = "bg-green-100 border-green-300"
        break
      case "Ocupada":
        baseClass = "bg-red-100 border-red-300"
        break
      case "Reservada":
        baseClass = "bg-yellow-100 border-yellow-300"
        break
      case "Sucia":
        baseClass = "bg-gray-200 border-gray-400"
        break
      default:
        baseClass = "bg-green-100 border-green-300"
    }

    // Estilo especial para mesas fusionadas
    if (esFusionada) {
      baseClass += " border-2 border-dashed border-blue-400"
    }

    if (isSelectedMultiple) {
      baseClass += " ring-2 ring-blue-500"
    } else if (isSelected) {
      baseClass += " ring-2 ring-primary"
    }

    return baseClass
  }

  // Función para obtener el icono según el tipo de estructura
  const getStructureIcon = (tipo: TipoEstructura) => {
    switch (tipo) {
      case "pared":
        return <Square className="h-3 w-3" />
      case "escenario":
        return <Triangle className="h-3 w-3" />
      case "barra":
        return <Square className="h-3 w-3" />
      case "entrada":
        return <Circle className="h-3 w-3" />
      case "decoracion":
        return <Circle className="h-3 w-3" />
      case "columna":
        return <Circle className="h-3 w-3" />
      default:
        return <Square className="h-3 w-3" />
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestión de Espacio</h1>
        <div className="flex gap-2 flex-wrap">
          {editMode ? (
            <>
              <Button onClick={saveLayout} size="sm">
                <Save className="mr-2 h-4 w-4" /> Guardar
              </Button>
              {selectedTables.length >= 2 && (
                <Button onClick={mergeTables} variant="secondary" size="sm">
                  <Link className="mr-2 h-4 w-4" /> Fusionar ({selectedTables.length})
                </Button>
              )}
              {selectedTables.length > 0 && (
                <Button onClick={clearSelections} variant="outline" size="sm">
                  Limpiar Selección
                </Button>
              )}
            </>
          ) : (
            <Button variant="outline" onClick={() => setEditMode(true)} size="sm">
              <Edit className="mr-2 h-4 w-4" /> Editar
            </Button>
          )}
          <Dialog open={newTableDialogOpen} onOpenChange={setNewTableDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Mesa
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
          <Dialog open={newStructureDialogOpen} onOpenChange={setNewStructureDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Estructura
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Nueva Estructura</DialogTitle>
                <DialogDescription>
                  Añade elementos como paredes, escenarios, barras, etc. a la zona{" "}
                  {zonas.find((zona) => zona.id === activeZone)?.nombre}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="structureName" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="structureName"
                    value={newStructureName}
                    onChange={(e) => setNewStructureName(e.target.value)}
                    className="col-span-3"
                    placeholder="Ej: Pared principal"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="structureType" className="text-right">
                    Tipo
                  </Label>
                  <select
                    id="structureType"
                    value={newStructureType}
                    onChange={(e) => setNewStructureType(e.target.value as TipoEstructura)}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="pared">Pared</option>
                    <option value="escenario">Escenario</option>
                    <option value="barra">Barra</option>
                    <option value="entrada">Entrada</option>
                    <option value="decoracion">Decoración</option>
                    <option value="columna">Columna</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="structureColor" className="text-right">
                    Color
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Input
                      id="structureColor"
                      type="color"
                      value={newStructureColor}
                      onChange={(e) => setNewStructureColor(e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={newStructureColor}
                      onChange={(e) => setNewStructureColor(e.target.value)}
                      className="flex-1"
                      placeholder="#8B5CF6"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="structureWidth" className="text-right">
                    Ancho (px)
                  </Label>
                  <Input
                    id="structureWidth"
                    type="number"
                    value={newStructureWidth}
                    onChange={(e) => setNewStructureWidth(e.target.value)}
                    className="col-span-3"
                    min="10"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="structureHeight" className="text-right">
                    Alto (px)
                  </Label>
                  <Input
                    id="structureHeight"
                    type="number"
                    value={newStructureHeight}
                    onChange={(e) => setNewStructureHeight(e.target.value)}
                    className="col-span-3"
                    min="10"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="structureDescription" className="text-right">
                    Descripción
                  </Label>
                  <Input
                    id="structureDescription"
                    value={newStructureDescription}
                    onChange={(e) => setNewStructureDescription(e.target.value)}
                    className="col-span-3"
                    placeholder="Descripción opcional"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewStructureDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={addNewStructure}>Añadir Estructura</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={newZoneDialogOpen} onOpenChange={setNewZoneDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Zona
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
            {/* Layout 70/30 para desktop, stack para mobile/tablet */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
              {/* Área de distribución - 70% en desktop */}
              <div className="lg:col-span-7">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Distribución de Espacio - {zona.nombre}</CardTitle>
                    <CardDescription>
                      {selectedTables.length > 0
                        ? `${selectedTables.length} mesa(s) seleccionada(s). Ctrl+Click para selección múltiple.`
                        : editMode
                          ? "Arrastra elementos para cambiar su posición. Ctrl+Click para seleccionar múltiples mesas."
                          : zona.descripcion}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="relative h-[400px] md:h-[500px] border rounded-md p-4 overflow-hidden"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: "20px 20px",
                        backgroundColor: "#fafafa",
                      }}
                      onClick={clearSelections}
                    >
                      {/* Estructuras */}
                      {estructuras
                        .filter((estructura) => estructura.zona === zona.nombre)
                        .map((estructura) => (
                          <Draggable
                            key={`estructura-${estructura.id}`}
                            nodeRef={nodeRefs.current[`estructura-${estructura.id}`]}
                            position={{ x: estructura.posicion.x, y: estructura.posicion.y }}
                            onStop={(e, data) => handleStructureDrag(estructura.id, e, data)}
                            disabled={!editMode}
                            bounds="parent"
                          >
                            <div
                              ref={nodeRefs.current[`estructura-${estructura.id}`]}
                              className={`absolute cursor-pointer rounded-md border-2 flex items-center justify-center text-center transition-all ${
                                selectedStructure === estructura.id ? "ring-2 ring-primary" : ""
                              } ${editMode ? "cursor-move" : "cursor-pointer"}`}
                              style={{
                                width: `${estructura.tamano.width}px`,
                                height: `${estructura.tamano.height}px`,
                                backgroundColor: estructura.color,
                                borderColor: estructura.color,
                                opacity: 0.8,
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStructureSelection(estructura.id)
                              }}
                            >
                              <div className="text-white text-xs font-medium flex items-center gap-1">
                                {getStructureIcon(estructura.tipo)}
                                <span className="truncate max-w-[80px]">{estructura.nombre}</span>
                              </div>
                            </div>
                          </Draggable>
                        ))}

                      {/* Mesas */}
                      {mesasState
                        .filter((mesa) => mesa.zona === zona.nombre)
                        .map((mesa) => (
                          <Draggable
                            key={`mesa-${mesa.id}`}
                            nodeRef={nodeRefs.current[`mesa-${mesa.id}`]}
                            position={{ x: mesa.posicion.x, y: mesa.posicion.y }}
                            onStop={(e, data) => handleDrag(mesa.id, e, data)}
                            disabled={!editMode}
                            bounds="parent"
                          >
                            <div
                              ref={nodeRefs.current[`mesa-${mesa.id}`]}
                              className={`absolute cursor-pointer rounded-md border p-2 text-center transition-all ${getTableBackgroundClass(
                                mesa.estado,
                                selectedTable === mesa.id,
                                selectedTables.includes(mesa.id),
                                mesa.esFusionada,
                              )} ${editMode ? "cursor-move" : "cursor-pointer"}`}
                              style={{
                                width: `${mesa.esFusionada ? 100 : mesa.tamano === "Grande" ? 80 : mesa.tamano === "Mediana" ? 60 : 50}px`,
                                height: `${mesa.esFusionada ? 100 : mesa.tamano === "Grande" ? 80 : mesa.tamano === "Mediana" ? 60 : 50}px`,
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTableSelection(mesa.id, e.ctrlKey || e.metaKey)
                              }}
                            >
                              <div className="font-medium text-xs md:text-sm">
                                Mesa {mesa.numero}
                                {mesa.esFusionada && <span className="text-xs text-blue-600 block">(Fusionada)</span>}
                              </div>
                              <div className="text-xs">{mesa.capacidad}p</div>
                              {mesa.esFusionada && (
                                <div className="absolute -top-1 -right-1">
                                  <Link className="h-4 w-4 text-blue-600" />
                                </div>
                              )}
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
                        {selectedTables.length > 0
                          ? `${selectedTables.length} mesa(s) seleccionada(s). ${selectedTables.length >= 2 ? "Puedes fusionarlas." : "Selecciona más para fusionar."}`
                          : "Arrastra elementos para reorganizar. Ctrl+Click en mesas para selección múltiple."}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Panel de detalles - 30% en desktop */}
              <div className="lg:col-span-3">
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {selectedTable
                        ? `Mesa ${mesasState.find((m) => m.id === selectedTable)?.numero}`
                        : selectedStructure
                          ? estructuras.find((e) => e.id === selectedStructure)?.nombre
                          : selectedTables.length > 0
                            ? `${selectedTables.length} Mesas Seleccionadas`
                            : "Información"}
                    </CardTitle>
                    <CardDescription>
                      {selectedTable
                        ? "Detalles de la mesa seleccionada"
                        : selectedStructure
                          ? "Detalles de la estructura seleccionada"
                          : selectedTables.length > 0
                            ? "Mesas seleccionadas para fusionar"
                            : "Selecciona un elemento para ver detalles"}
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
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">Número</div>
                                  <div className="font-medium">{mesa.numero}</div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">Capacidad</div>
                                  <div className="font-medium">{mesa.capacidad} pers.</div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">Tamaño</div>
                                  <div className="font-medium">{mesa.tamano}</div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">Zona</div>
                                  <div className="font-medium">{mesa.zona}</div>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground">Estado</div>
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

                              {mesa.esFusionada && mesa.mesasOriginales && (
                                <div className="space-y-2">
                                  <Separator />
                                  <div className="space-y-1">
                                    <div className="text-xs font-medium text-muted-foreground">Mesa Fusionada</div>
                                    <div className="text-sm">Compuesta por {mesa.mesasOriginales.length} mesas:</div>
                                    <div className="text-xs text-muted-foreground">
                                      {mesa.mesasOriginales.map((m) => `Mesa ${m.numero}`).join(", ")}
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => separateTables(mesa.id)}
                                      className="w-full mt-2"
                                    >
                                      <Unlink className="mr-2 h-3 w-3" /> Separar Mesas
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {mesa.estado === "Ocupada" && (
                                <div className="space-y-2">
                                  <Separator />
                                  <div className="space-y-1">
                                    <div className="text-xs font-medium text-muted-foreground">Ocupada desde</div>
                                    <div className="text-sm font-medium">{mesa.horaInicio || "19:30"} (45 min)</div>
                                    <div className="text-xs font-medium text-muted-foreground mt-2">Cliente</div>
                                    <div className="text-sm font-medium">{mesa.cliente || "Familia Rodríguez"}</div>
                                  </div>
                                  {mesa.cuenta && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setAccountDialogOpen(true)}
                                      className="w-full"
                                    >
                                      <Receipt className="mr-2 h-3 w-3" /> Ver Cuenta (${mesa.cuenta.total})
                                    </Button>
                                  )}
                                </div>
                              )}

                              {mesa.estado === "Reservada" && (
                                <div className="space-y-1">
                                  <Separator />
                                  <div className="text-xs font-medium text-muted-foreground">Reservada para</div>
                                  <div className="text-sm font-medium">{mesa.horaReserva || "21:00"}</div>
                                  <div className="text-xs font-medium text-muted-foreground mt-2">Cliente</div>
                                  <div className="text-sm font-medium">{mesa.cliente || "María González"}</div>
                                </div>
                              )}

                              <div className="pt-2 space-y-2">
                                {/* Acciones según el estado actual de la mesa */}
                                {mesa.estado === "Disponible" && (
                                  <Button
                                    className="w-full"
                                    size="sm"
                                    onClick={() => cambiarEstadoMesa(mesa.id, "Ocupada")}
                                  >
                                    <Coffee className="mr-2 h-4 w-4" /> Ocupar Mesa
                                  </Button>
                                )}
                                {mesa.estado === "Ocupada" && (
                                  <Button
                                    className="w-full"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => cambiarEstadoMesa(mesa.id, "Sucia")}
                                  >
                                    <Trash className="mr-2 h-4 w-4" /> Marcar como Sucia
                                  </Button>
                                )}
                                {mesa.estado === "Sucia" && (
                                  <Button
                                    className="w-full bg-transparent"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => cambiarEstadoMesa(mesa.id, "Disponible")}
                                  >
                                    <Check className="mr-2 h-4 w-4" /> Marcar como Limpia
                                  </Button>
                                )}
                                {mesa.estado === "Reservada" && (
                                  <Button
                                    className="w-full"
                                    variant="secondary"
                                    size="sm"
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
                                    size="sm"
                                    onClick={() => cambiarEstadoMesa(mesa.id, "Disponible")}
                                  >
                                    <Check className="mr-2 h-4 w-4" /> Liberar Mesa
                                  </Button>
                                )}
                                {editMode && (
                                  <Button
                                    variant="destructive"
                                    className="w-full"
                                    size="sm"
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
                    ) : selectedStructure ? (
                      <div className="space-y-4">
                        {(() => {
                          const estructura = estructuras.find((e) => e.id === selectedStructure)
                          if (!estructura) return null

                          return (
                            <>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">Tipo</div>
                                  <div className="font-medium capitalize">{estructura.tipo}</div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">Zona</div>
                                  <div className="font-medium">{estructura.zona}</div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">Dimensiones</div>
                                  <div className="font-medium">
                                    {estructura.tamano.width} x {estructura.tamano.height} px
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">Color</div>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-4 h-4 rounded border"
                                      style={{ backgroundColor: estructura.color }}
                                    />
                                    <span className="text-sm font-medium">{estructura.color}</span>
                                  </div>
                                </div>
                              </div>

                              {estructura.descripcion && (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">Descripción</div>
                                  <div className="text-sm">{estructura.descripcion}</div>
                                </div>
                              )}

                              {editMode && (
                                <div className="pt-2">
                                  <Button
                                    variant="destructive"
                                    className="w-full"
                                    size="sm"
                                    onClick={() => deleteStructure(estructura.id)}
                                    title="Eliminar estructura"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar Estructura
                                  </Button>
                                </div>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    ) : selectedTables.length > 0 ? (
                      <div className="space-y-4">
                        <div className="text-sm">
                          <div className="font-medium mb-2">Mesas seleccionadas:</div>
                          <div className="space-y-1">
                            {selectedTables.map((tableId) => {
                              const mesa = mesasState.find((m) => m.id === tableId)
                              return mesa ? (
                                <div key={tableId} className="flex justify-between text-xs">
                                  <span>Mesa {mesa.numero}</span>
                                  <span>{mesa.capacidad} pers.</span>
                                </div>
                              ) : null
                            })}
                          </div>
                        </div>
                        <Separator />
                        <div className="text-sm">
                          <div className="font-medium">Capacidad total:</div>
                          <div className="text-lg font-bold">
                            {selectedTables.reduce((total, tableId) => {
                              const mesa = mesasState.find((m) => m.id === tableId)
                              return total + (mesa?.capacidad || 0)
                            }, 0)}{" "}
                            personas
                          </div>
                        </div>
                        {selectedTables.length >= 2 && (
                          <Button onClick={mergeTables} className="w-full" size="sm">
                            <Link className="mr-2 h-4 w-4" /> Fusionar Mesas
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm text-center">
                        Selecciona un elemento del plano para ver sus detalles
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Resumen de ocupación */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen de Ocupación - {zona.nombre}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-lg border p-3">
                    <div className="text-xs md:text-sm font-medium text-muted-foreground">Disponibles</div>
                    <div className="text-xl md:text-2xl font-bold text-green-600">
                      {mesasState.filter((m) => m.estado === "Disponible" && m.zona === zona.nombre).length}
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs md:text-sm font-medium text-muted-foreground">Reservadas</div>
                    <div className="text-xl md:text-2xl font-bold text-yellow-600">
                      {mesasState.filter((m) => m.estado === "Reservada" && m.zona === zona.nombre).length}
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs md:text-sm font-medium text-muted-foreground">Ocupadas</div>
                    <div className="text-xl md:text-2xl font-bold text-red-600">
                      {mesasState.filter((m) => m.estado === "Ocupada" && m.zona === zona.nombre).length}
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs md:text-sm font-medium text-muted-foreground">Sucias</div>
                    <div className="text-xl md:text-2xl font-bold text-gray-600">
                      {mesasState.filter((m) => m.estado === "Sucia" && m.zona === zona.nombre).length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Diálogo para ver cuenta de la mesa */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Cuenta de Mesa {selectedTable ? mesasState.find((m) => m.id === selectedTable)?.numero : ""}
            </DialogTitle>
            <DialogDescription>Detalle de consumo actual</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTable &&
              (() => {
                const mesa = mesasState.find((m) => m.id === selectedTable)
                if (!mesa?.cuenta) return null

                return (
                  <>
                    <div className="space-y-2">
                      {mesa.cuenta.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                          <div>
                            <div className="font-medium text-sm">{item.nombre}</div>
                            <div className="text-xs text-muted-foreground">Cantidad: {item.cantidad}</div>
                          </div>
                          <div className="font-medium">${(item.cantidad * item.precio).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total:</span>
                      <span>${mesa.cuenta.total.toFixed(2)}</span>
                    </div>
                  </>
                )
              })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccountDialogOpen(false)}>
              Cerrar
            </Button>
            <Button>
              <Receipt className="mr-2 h-4 w-4" /> Imprimir Cuenta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
    esFusionada: false,
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
    esFusionada: false,
    cuenta: {
      items: [
        { nombre: "Entrada del día", cantidad: 2, precio: 12.5 },
        { nombre: "Plato principal", cantidad: 2, precio: 25.0 },
        { nombre: "Bebidas", cantidad: 3, precio: 8.0 },
      ],
      total: 69.0,
    },
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
    esFusionada: false,
  },
  {
    id: 4,
    numero: 4,
    capacidad: 4,
    tamano: "Mediana" as const,
    zona: "Salón Principal",
    estado: "Disponible" as const,
    posicion: { x: 50, y: 170 },
    esFusionada: false,
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
    esFusionada: false,
    cuenta: {
      items: [
        { nombre: "Parrillada familiar", cantidad: 1, precio: 45.0 },
        { nombre: "Ensalada mixta", cantidad: 2, precio: 8.5 },
        { nombre: "Bebidas", cantidad: 4, precio: 6.0 },
      ],
      total: 79.0,
    },
  },
  {
    id: 6,
    numero: 6,
    capacidad: 8,
    tamano: "Grande" as const,
    zona: "Salón Principal",
    estado: "Sucia" as const,
    posicion: { x: 250, y: 170 },
    esFusionada: false,
  },
  {
    id: 7,
    numero: 7,
    capacidad: 2,
    tamano: "Pequeña" as const,
    zona: "Salón Principal",
    estado: "Disponible" as const,
    posicion: { x: 50, y: 290 },
    esFusionada: false,
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
    esFusionada: false,
    cuenta: {
      items: [
        { nombre: "Cena romántica", cantidad: 1, precio: 55.0 },
        { nombre: "Vino tinto", cantidad: 1, precio: 25.0 },
        { nombre: "Postre", cantidad: 2, precio: 8.0 },
      ],
      total: 96.0,
    },
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
    esFusionada: false,
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
    esFusionada: false,
    cuenta: {
      items: [
        { nombre: "Tapas variadas", cantidad: 1, precio: 18.0 },
        { nombre: "Sangría", cantidad: 1, precio: 15.0 },
      ],
      total: 33.0,
    },
  },
  {
    id: 12,
    numero: 3,
    capacidad: 6,
    tamano: "Grande" as const,
    zona: "Terraza",
    estado: "Sucia" as const,
    posicion: { x: 250, y: 50 },
    esFusionada: false,
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
    esFusionada: false,
  },
]

const estructurasIniciales: Estructura[] = [
  {
    id: 1,
    tipo: "pared",
    nombre: "Pared Principal",
    zona: "Salón Principal",
    posicion: { x: 20, y: 20 },
    tamano: { width: 200, height: 15 },
    color: "#8B5CF6",
    descripcion: "Pared principal del salón",
  },
  {
    id: 2,
    tipo: "barra",
    nombre: "Barra Principal",
    zona: "Salón Principal",
    posicion: { x: 300, y: 350 },
    tamano: { width: 120, height: 40 },
    color: "#F59E0B",
    descripcion: "Barra de servicio principal",
  },
  {
    id: 3,
    tipo: "entrada",
    nombre: "Entrada Principal",
    zona: "Salón Principal",
    posicion: { x: 10, y: 200 },
    tamano: { width: 30, height: 60 },
    color: "#10B981",
    descripcion: "Entrada principal del restaurante",
  },
  {
    id: 4,
    tipo: "escenario",
    nombre: "Escenario",
    zona: "Salón Privado",
    posicion: { x: 200, y: 300 },
    tamano: { width: 150, height: 80 },
    color: "#EF4444",
    descripcion: "Escenario para eventos",
  },
  {
    id: 5,
    tipo: "decoracion",
    nombre: "Fuente",
    zona: "Terraza",
    posicion: { x: 180, y: 200 },
    tamano: { width: 60, height: 60 },
    color: "#3B82F6",
    descripcion: "Fuente decorativa",
  },
  {
    id: 6,
    tipo: "columna",
    nombre: "Columna Central",
    zona: "Salón Principal",
    posicion: { x: 200, y: 200 },
    tamano: { width: 25, height: 25 },
    color: "#6B7280",
    descripción: "Columna estructural",
  },
]
