"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface NewReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (newReservation: Omit<Reservation, "id">) => void
  selectedDate?: Date // Optional prop to pre-fill date from calendar view
}

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

export function NewReservationDialog({ open, onOpenChange, onSave, selectedDate }: NewReservationDialogProps) {
  const { toast } = useToast()
  const [cliente, setCliente] = useState("")
  const [hora, setHora] = useState("")
  const [personas, setPersonas] = useState<number>(1)
  const [mesa, setMesa] = useState("")
  const [contacto, setContacto] = useState("")
  const [estado, setEstado] = useState<Reservation["estado"]>("Pendiente")
  const [date, setDate] = useState<Date | undefined>(selectedDate || new Date())

  React.useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setCliente("")
      setHora("")
      setPersonas(1)
      setMesa("")
      setContacto("")
      setEstado("Pendiente")
      setDate(selectedDate || new Date())
    }
  }, [open, selectedDate])

  const handleSubmit = () => {
    if (!cliente || !hora || !personas || !mesa || !contacto || !date) {
      toast({
        title: "Error al guardar",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    if (isNaN(personas) || personas <= 0) {
      toast({
        title: "Error al guardar",
        description: "El número de personas debe ser un valor positivo.",
        variant: "destructive",
      })
      return
    }

    const newReservation: Omit<Reservation, "id"> = {
      cliente,
      hora,
      personas,
      mesa,
      contacto,
      estado,
      date,
    }
    onSave(newReservation)
    onOpenChange(false) // Close dialog on successful save
    toast({
      title: "Reserva creada",
      description: "La nueva reserva ha sido guardada exitosamente.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nueva Reserva</DialogTitle>
          <DialogDescription>Completa los detalles para añadir una nueva reserva.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cliente" className="text-right">
              Cliente
            </Label>
            <Input
              id="cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="col-span-3"
              placeholder="Nombre del cliente"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Fecha
            </Label>
            <div className="col-span-3">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="rounded-md border" />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hora" className="text-right">
              Hora
            </Label>
            <Input
              id="hora"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="personas" className="text-right">
              Personas
            </Label>
            <Input
              id="personas"
              type="number"
              value={personas}
              onChange={(e) => setPersonas(Number.parseInt(e.target.value) || 0)}
              className="col-span-3"
              min="1"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mesa" className="text-right">
              Mesa
            </Label>
            <Input
              id="mesa"
              value={mesa}
              onChange={(e) => setMesa(e.target.value)}
              className="col-span-3"
              placeholder="Ej: Mesa 5, Barra"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contacto" className="text-right">
              Contacto
            </Label>
            <Input
              id="contacto"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              className="col-span-3"
              placeholder="Teléfono o Email"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="estado" className="text-right">
              Estado
            </Label>
            <Select value={estado} onValueChange={(value: Reservation["estado"]) => setEstado(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Confirmada">Confirmada</SelectItem>
                <SelectItem value="Completada">Completada</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Guardar Reserva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
