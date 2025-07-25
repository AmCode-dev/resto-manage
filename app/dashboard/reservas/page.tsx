"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, CalendarDays, ListFilter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { NewReservationDialog } from "@/components/reservas/new-reservation-dialog" // Import the new dialog
import { useToast } from "@/components/ui/use-toast" // Import useToast

interface Reservation {
  id: number
  cliente: string
  hora: string
  personas: number
  mesa: string
  contacto: string
  estado: "Confirmada" | "Pendiente" | "Completada" | "Cancelada"
  date: Date
}

const initialMockReservations: Reservation[] = [
  {
    id: 1,
    cliente: "Juan Martínez",
    hora: "19:00",
    personas: 4,
    mesa: "Mesa 5",
    contacto: "555-1234",
    estado: "Confirmada",
    date: new Date(2025, 6, 25), // July 25, 2025
  },
  {
    id: 2,
    cliente: "María González",
    hora: "20:30",
    personas: 2,
    mesa: "Mesa 8",
    contacto: "555-5678",
    estado: "Pendiente",
    date: new Date(2025, 6, 25), // July 25, 2025
  },
  {
    id: 3,
    cliente: "Carlos Rodríguez",
    hora: "21:00",
    personas: 6,
    mesa: "Mesa 12",
    contacto: "555-9012",
    estado: "Confirmada",
    date: new Date(2025, 6, 26), // July 26, 2025
  },
  {
    id: 4,
    cliente: "Ana López",
    hora: "19:30",
    personas: 3,
    mesa: "Mesa 7",
    contacto: "555-3456",
    estado: "Completada",
    date: new Date(2025, 6, 27), // July 27, 2025
  },
  {
    id: 5,
    cliente: "Roberto Sánchez",
    hora: "20:00",
    personas: 2,
    mesa: "Mesa 3",
    contacto: "555-7890",
    estado: "Cancelada",
    date: new Date(2025, 6, 27), // July 27, 2025
  },
  {
    id: 6,
    cliente: "Laura Pérez",
    hora: "18:00",
    personas: 5,
    mesa: "Mesa 10",
    contacto: "555-1122",
    estado: "Confirmada",
    date: new Date(2025, 6, 28), // July 28, 2025
  },
  {
    id: 7,
    cliente: "Pedro Gómez",
    hora: "22:00",
    personas: 2,
    mesa: "Mesa 1",
    contacto: "555-3344",
    estado: "Pendiente",
    date: new Date(2025, 6, 28), // July 28, 2025
  },
]

export default function ReservasPage() {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState<string>("calendar") // 'calendar' or 'list'
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("todas")
  const [isNewReservationDialogOpen, setIsNewReservationDialogOpen] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>(initialMockReservations) // Use state for reservations

  const handleSaveNewReservation = (newReservation: Omit<Reservation, "id">) => {
    const newId = Math.max(...reservations.map((r) => r.id)) + 1
    setReservations((prev) => [...prev, { ...newReservation, id: newId }])
    setIsNewReservationDialogOpen(false)
    toast({
      title: "Reserva creada",
      description: "La nueva reserva ha sido guardada exitosamente.",
    })
  }

  const filteredReservations = useMemo(() => {
    let currentReservas = reservations // Use the state variable

    // Filter by selected date if in calendar view
    if (activeTab === "calendar" && selectedDate) {
      currentReservas = currentReservas.filter(
        (reserva) => format(reserva.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"),
      )
    }

    // Filter by status if in list view or general filter
    if (filterStatus !== "todas") {
      currentReservas = currentReservas.filter((reserva) => reserva.estado.toLowerCase() === filterStatus.toLowerCase())
    }

    // Filter by search term
    if (searchTerm) {
      currentReservas = currentReservas.filter(
        (reserva) =>
          reserva.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reserva.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reserva.mesa.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return currentReservas
  }, [selectedDate, activeTab, filterStatus, searchTerm, reservations]) // Add reservations to dependency array

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Reservas</h1>
        <Button onClick={() => setIsNewReservationDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Reserva
        </Button>
      </div>

      <Tabs defaultValue="calendar" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="calendar">
              <CalendarDays className="mr-2 h-4 w-4" /> Vista Calendario
            </TabsTrigger>
            <TabsTrigger value="list">
              <ListFilter className="mr-2 h-4 w-4" /> Vista Listado
            </TabsTrigger>
          </TabsList>
          {activeTab === "list" && (
            <div className="relative flex-1 max-w-sm ml-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar reserva..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        <TabsContent value="calendar" className="space-y-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Calendario de Reservas</CardTitle>
              <CardDescription>Selecciona una fecha para ver las reservas del día.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border w-full max-w-3xl"
                reservations={reservations} // Pass all reservations to highlight days
              />
              {selectedDate && (
                <div className="mt-6 w-full max-w-3xl">
                  <h2 className="text-2xl font-semibold mb-4">
                    Reservas para {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </h2>
                  {filteredReservations.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Hora</TableHead>
                          <TableHead>Personas</TableHead>
                          <TableHead>Mesa</TableHead>
                          <TableHead>Contacto</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReservations.map((reserva) => (
                          <TableRow key={reserva.id}>
                            <TableCell className="font-medium">{reserva.cliente}</TableCell>
                            <TableCell>{reserva.hora}</TableCell>
                            <TableCell>{reserva.personas}</TableCell>
                            <TableCell>{reserva.mesa}</TableCell>
                            <TableCell>{reserva.contacto}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  reserva.estado === "Confirmada"
                                    ? "default"
                                    : reserva.estado === "Pendiente"
                                      ? "outline"
                                      : reserva.estado === "Completada"
                                        ? "secondary"
                                        : "destructive"
                                }
                              >
                                {reserva.estado}
                              </Badge>
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
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No hay reservas para esta fecha.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-col gap-4">
            <Tabs defaultValue="todas" value={filterStatus} onValueChange={setFilterStatus} className="space-y-4">
              <TabsList>
                <TabsTrigger value="todas">Todas</TabsTrigger>
                <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
                <TabsTrigger value="confirmadas">Confirmadas</TabsTrigger>
                <TabsTrigger value="completadas">Completadas</TabsTrigger>
                <TabsTrigger value="canceladas">Canceladas</TabsTrigger>
              </TabsList>
              <TabsContent value={filterStatus} className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Listado de Reservas ({filterStatus === "todas" ? "Todas" : filterStatus})</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {filteredReservations.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Personas</TableHead>
                            <TableHead>Mesa</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredReservations.map((reserva) => (
                            <TableRow key={reserva.id}>
                              <TableCell className="font-medium">{reserva.cliente}</TableCell>
                              <TableCell>{format(reserva.date, "dd/MM/yyyy")}</TableCell>
                              <TableCell>{reserva.hora}</TableCell>
                              <TableCell>{reserva.personas}</TableCell>
                              <TableCell>{reserva.mesa}</TableCell>
                              <TableCell>{reserva.contacto}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    reserva.estado === "Confirmada"
                                      ? "default"
                                      : reserva.estado === "Pendiente"
                                        ? "outline"
                                        : reserva.estado === "Completada"
                                          ? "secondary"
                                          : "destructive"
                                  }
                                >
                                  {reserva.estado}
                                </Badge>
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
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No hay reservas que coincidan con los filtros.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>

      <NewReservationDialog
        open={isNewReservationDialogOpen}
        onOpenChange={setIsNewReservationDialogOpen}
        onSave={handleSaveNewReservation}
        selectedDate={selectedDate} // Pass the currently selected date to pre-fill
      />
    </div>
  )
}
