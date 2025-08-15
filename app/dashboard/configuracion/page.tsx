"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building2, User, MapPin, Clock, Phone, Save, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRestaurantes } from "@/hooks/use-restaurantes"
import { useAuth } from "@/hooks/use-auth"

// Días de la semana
const DIAS_SEMANA = [
  { value: "lunes", label: "Lunes" },
  { value: "martes", label: "Martes" },
  { value: "miercoles", label: "Miércoles" },
  { value: "jueves", label: "Jueves" },
  { value: "viernes", label: "Viernes" },
  { value: "sabado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
]

// Provincias de Argentina
const PROVINCIAS = [
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
]

// Condiciones fiscales
const CONDICIONES_FISCALES = ["Responsable Inscripto", "Monotributo", "Exento", "No Responsable", "Consumidor Final"]

interface FormData {
  // Información básica
  nombre: string
  descripcion: string
  logo_url: string

  // Información del dueño
  dueno_nombre: string
  dueno_apellido: string
  dueno_email: string
  dueno_telefono: string
  dueno_dni: string

  // Información fiscal
  cuit: string
  razon_social: string
  condicion_fiscal: string

  // Ubicación
  direccion: string
  ciudad: string
  provincia: string
  codigo_postal: string
  pais: string

  // Información operativa
  capacidad_total: number
  numero_mesas: number
  horario_apertura: string
  horario_cierre: string
  dias_operacion: string[]

  // Configuración
  moneda: string
  zona_horaria: string
  idioma: string

  // Contacto
  telefono_restaurante: string
  email_restaurante: string
  sitio_web: string

  // Estado
  activo: boolean
  fecha_apertura: string
}

export default function ConfiguracionPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { restaurantes, restauranteActual, loading, crearRestaurante, actualizarRestaurante } = useRestaurantes()

  const [cargando, setCargando] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    // Información básica
    nombre: "",
    descripcion: "",
    logo_url: "",

    // Información del dueño
    dueno_nombre: "",
    dueno_apellido: "",
    dueno_email: user?.email || "",
    dueno_telefono: "",
    dueno_dni: "",

    // Información fiscal
    cuit: "",
    razon_social: "",
    condicion_fiscal: "",

    // Ubicación
    direccion: "",
    ciudad: "",
    provincia: "",
    codigo_postal: "",
    pais: "Argentina",

    // Información operativa
    capacidad_total: 0,
    numero_mesas: 0,
    horario_apertura: "08:00",
    horario_cierre: "22:00",
    dias_operacion: ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"],

    // Configuración
    moneda: "ARS",
    zona_horaria: "America/Argentina/Buenos_Aires",
    idioma: "es",

    // Contacto
    telefono_restaurante: "",
    email_restaurante: "",
    sitio_web: "",

    // Estado
    activo: true,
    fecha_apertura: "",
  })

  // Cargar datos del restaurante actual al formulario
  useEffect(() => {
    if (restauranteActual) {
      setFormData({
        nombre: restauranteActual.nombre || "",
        descripcion: restauranteActual.descripcion || "",
        logo_url: restauranteActual.logo_url || "",
        dueno_nombre: restauranteActual.dueno_nombre || "",
        dueno_apellido: restauranteActual.dueno_apellido || "",
        dueno_email: restauranteActual.dueno_email || "",
        dueno_telefono: restauranteActual.dueno_telefono || "",
        dueno_dni: restauranteActual.dueno_dni || "",
        cuit: restauranteActual.cuit || "",
        razon_social: restauranteActual.razon_social || "",
        condicion_fiscal: restauranteActual.condicion_fiscal || "",
        direccion: restauranteActual.direccion || "",
        ciudad: restauranteActual.ciudad || "",
        provincia: restauranteActual.provincia || "",
        codigo_postal: restauranteActual.codigo_postal || "",
        pais: restauranteActual.pais || "Argentina",
        capacidad_total: restauranteActual.capacidad_total || 0,
        numero_mesas: restauranteActual.numero_mesas || 0,
        horario_apertura: restauranteActual.horario_apertura || "08:00",
        horario_cierre: restauranteActual.horario_cierre || "22:00",
        dias_operacion: restauranteActual.dias_operacion || [],
        moneda: restauranteActual.moneda || "ARS",
        zona_horaria: restauranteActual.zona_horaria || "America/Argentina/Buenos_Aires",
        idioma: restauranteActual.idioma || "es",
        telefono_restaurante: restauranteActual.telefono_restaurante || "",
        email_restaurante: restauranteActual.email_restaurante || "",
        sitio_web: restauranteActual.sitio_web || "",
        activo: restauranteActual.activo ?? true,
        fecha_apertura: restauranteActual.fecha_apertura || "",
      })
      setModoEdicion(true)
    } else {
      setModoEdicion(false)
    }
  }, [restauranteActual])

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Manejar cambios en días de operación
  const handleDiaOperacionChange = (dia: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      dias_operacion: checked ? [...prev.dias_operacion, dia] : prev.dias_operacion.filter((d) => d !== dia),
    }))
  }

  // Validar formulario
  const validarFormulario = () => {
    const errores = []

    if (!formData.nombre.trim()) errores.push("El nombre del restaurante es obligatorio")
    if (!formData.dueno_nombre.trim()) errores.push("El nombre del dueño es obligatorio")
    if (!formData.dueno_apellido.trim()) errores.push("El apellido del dueño es obligatorio")
    if (!formData.dueno_email.trim()) errores.push("El email del dueño es obligatorio")
    if (!formData.cuit.trim()) errores.push("El CUIT es obligatorio")
    if (!formData.razon_social.trim()) errores.push("La razón social es obligatoria")
    if (!formData.direccion.trim()) errores.push("La dirección es obligatoria")
    if (!formData.ciudad.trim()) errores.push("La ciudad es obligatoria")
    if (!formData.provincia.trim()) errores.push("La provincia es obligatoria")

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.dueno_email && !emailRegex.test(formData.dueno_email)) {
      errores.push("El email del dueño no es válido")
    }
    if (formData.email_restaurante && !emailRegex.test(formData.email_restaurante)) {
      errores.push("El email del restaurante no es válido")
    }

    // Validar CUIT (formato básico)
    if (formData.cuit && !/^\d{2}-\d{8}-\d{1}$/.test(formData.cuit)) {
      errores.push("El CUIT debe tener el formato XX-XXXXXXXX-X")
    }

    return errores
  }

  // Guardar restaurante
  const handleGuardar = async () => {
    const errores = validarFormulario()
    if (errores.length > 0) {
      toast({
        title: "Errores en el formulario",
        description: errores.join(", "),
        variant: "destructive",
      })
      return
    }

    try {
      setCargando(true)

      const restauranteData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        logo_url: formData.logo_url.trim() || null,
        dueno_nombre: formData.dueno_nombre.trim(),
        dueno_apellido: formData.dueno_apellido.trim(),
        dueno_email: formData.dueno_email.trim(),
        dueno_telefono: formData.dueno_telefono.trim() || null,
        dueno_dni: formData.dueno_dni.trim() || null,
        cuit: formData.cuit.trim(),
        razon_social: formData.razon_social.trim(),
        condicion_fiscal: formData.condicion_fiscal || null,
        direccion: formData.direccion.trim(),
        ciudad: formData.ciudad.trim(),
        provincia: formData.provincia.trim(),
        codigo_postal: formData.codigo_postal.trim() || null,
        pais: formData.pais || "Argentina",
        capacidad_total: formData.capacidad_total || null,
        numero_mesas: formData.numero_mesas || null,
        horario_apertura: formData.horario_apertura || null,
        horario_cierre: formData.horario_cierre || null,
        dias_operacion: formData.dias_operacion.length > 0 ? formData.dias_operacion : null,
        moneda: formData.moneda || "ARS",
        zona_horaria: formData.zona_horaria || "America/Argentina/Buenos_Aires",
        idioma: formData.idioma || "es",
        telefono_restaurante: formData.telefono_restaurante.trim() || null,
        email_restaurante: formData.email_restaurante.trim() || null,
        sitio_web: formData.sitio_web.trim() || null,
        activo: formData.activo,
        fecha_apertura: formData.fecha_apertura || null,
      }

      if (modoEdicion && restauranteActual) {
        await actualizarRestaurante(restauranteActual.id, restauranteData)
        toast({
          title: "Restaurante actualizado",
          description: "La información del restaurante ha sido actualizada exitosamente",
        })
      } else {
        await crearRestaurante(restauranteData)
        toast({
          title: "Restaurante creado",
          description: "El restaurante ha sido creado exitosamente",
        })
      }
    } catch (error: any) {
      console.error("Error guardando restaurante:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el restaurante",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-gray-600">
            {modoEdicion ? "Editar información del restaurante" : "Configurar nuevo restaurante"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {restauranteActual && (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <Check className="h-3 w-3 mr-1" />
              Configurado
            </Badge>
          )}
          <Button onClick={handleGuardar} disabled={cargando}>
            <Save className="mr-2 h-4 w-4" />
            {cargando ? "Guardando..." : modoEdicion ? "Actualizar" : "Crear Restaurante"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basica" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basica">
            <Building2 className="h-4 w-4 mr-2" />
            Básica
          </TabsTrigger>
          <TabsTrigger value="dueno">
            <User className="h-4 w-4 mr-2" />
            Dueño
          </TabsTrigger>
          <TabsTrigger value="ubicacion">
            <MapPin className="h-4 w-4 mr-2" />
            Ubicación
          </TabsTrigger>
          <TabsTrigger value="operacion">
            <Clock className="h-4 w-4 mr-2" />
            Operación
          </TabsTrigger>
          <TabsTrigger value="contacto">
            <Phone className="h-4 w-4 mr-2" />
            Contacto
          </TabsTrigger>
        </TabsList>

        {/* Información Básica */}
        <TabsContent value="basica" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica del Restaurante</CardTitle>
              <CardDescription>Datos principales de identificación del restaurante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Restaurante *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    placeholder="Ej: La Parrilla del Chef"
                    disabled={cargando}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_url">URL del Logo</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => handleInputChange("logo_url", e.target.value)}
                    placeholder="https://ejemplo.com/logo.png"
                    disabled={cargando}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  placeholder="Describe tu restaurante, especialidades, ambiente, etc."
                  rows={3}
                  disabled={cargando}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cuit">CUIT *</Label>
                  <Input
                    id="cuit"
                    value={formData.cuit}
                    onChange={(e) => handleInputChange("cuit", e.target.value)}
                    placeholder="XX-XXXXXXXX-X"
                    disabled={cargando}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razon_social">Razón Social *</Label>
                  <Input
                    id="razon_social"
                    value={formData.razon_social}
                    onChange={(e) => handleInputChange("razon_social", e.target.value)}
                    placeholder="Nombre legal de la empresa"
                    disabled={cargando}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condicion_fiscal">Condición Fiscal</Label>
                <Select
                  value={formData.condicion_fiscal}
                  onValueChange={(value) => handleInputChange("condicion_fiscal", value)}
                  disabled={cargando}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar condición fiscal" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDICIONES_FISCALES.map((condicion) => (
                      <SelectItem key={condicion} value={condicion}>
                        {condicion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Información del Dueño */}
        <TabsContent value="dueno" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Propietario</CardTitle>
              <CardDescription>Datos personales del dueño del restaurante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueno_nombre">Nombre *</Label>
                  <Input
                    id="dueno_nombre"
                    value={formData.dueno_nombre}
                    onChange={(e) => handleInputChange("dueno_nombre", e.target.value)}
                    placeholder="Nombre del propietario"
                    disabled={cargando}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueno_apellido">Apellido *</Label>
                  <Input
                    id="dueno_apellido"
                    value={formData.dueno_apellido}
                    onChange={(e) => handleInputChange("dueno_apellido", e.target.value)}
                    placeholder="Apellido del propietario"
                    disabled={cargando}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueno_email">Email *</Label>
                  <Input
                    id="dueno_email"
                    type="email"
                    value={formData.dueno_email}
                    onChange={(e) => handleInputChange("dueno_email", e.target.value)}
                    placeholder="email@ejemplo.com"
                    disabled={cargando}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueno_telefono">Teléfono</Label>
                  <Input
                    id="dueno_telefono"
                    value={formData.dueno_telefono}
                    onChange={(e) => handleInputChange("dueno_telefono", e.target.value)}
                    placeholder="+54 11 1234-5678"
                    disabled={cargando}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueno_dni">DNI</Label>
                <Input
                  id="dueno_dni"
                  value={formData.dueno_dni}
                  onChange={(e) => handleInputChange("dueno_dni", e.target.value)}
                  placeholder="12345678"
                  disabled={cargando}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ubicación */}
        <TabsContent value="ubicacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ubicación del Restaurante</CardTitle>
              <CardDescription>Dirección y datos de ubicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección *</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange("direccion", e.target.value)}
                  placeholder="Av. Corrientes 1234"
                  disabled={cargando}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad *</Label>
                  <Input
                    id="ciudad"
                    value={formData.ciudad}
                    onChange={(e) => handleInputChange("ciudad", e.target.value)}
                    placeholder="Buenos Aires"
                    disabled={cargando}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provincia">Provincia *</Label>
                  <Select
                    value={formData.provincia}
                    onValueChange={(value) => handleInputChange("provincia", value)}
                    disabled={cargando}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCIAS.map((provincia) => (
                        <SelectItem key={provincia} value={provincia}>
                          {provincia}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo_postal">Código Postal</Label>
                  <Input
                    id="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={(e) => handleInputChange("codigo_postal", e.target.value)}
                    placeholder="1000"
                    disabled={cargando}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais">País</Label>
                <Input
                  id="pais"
                  value={formData.pais}
                  onChange={(e) => handleInputChange("pais", e.target.value)}
                  placeholder="Argentina"
                  disabled={cargando}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operación */}
        <TabsContent value="operacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Operativa</CardTitle>
              <CardDescription>Horarios, capacidad y configuración del restaurante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacidad_total">Capacidad Total</Label>
                  <Input
                    id="capacidad_total"
                    type="number"
                    value={formData.capacidad_total}
                    onChange={(e) => handleInputChange("capacidad_total", Number.parseInt(e.target.value) || 0)}
                    placeholder="50"
                    disabled={cargando}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_mesas">Número de Mesas</Label>
                  <Input
                    id="numero_mesas"
                    type="number"
                    value={formData.numero_mesas}
                    onChange={(e) => handleInputChange("numero_mesas", Number.parseInt(e.target.value) || 0)}
                    placeholder="12"
                    disabled={cargando}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horario_apertura">Horario de Apertura</Label>
                  <Input
                    id="horario_apertura"
                    type="time"
                    value={formData.horario_apertura}
                    onChange={(e) => handleInputChange("horario_apertura", e.target.value)}
                    disabled={cargando}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horario_cierre">Horario de Cierre</Label>
                  <Input
                    id="horario_cierre"
                    type="time"
                    value={formData.horario_cierre}
                    onChange={(e) => handleInputChange("horario_cierre", e.target.value)}
                    disabled={cargando}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Días de Operación</Label>
                <div className="grid grid-cols-4 gap-2">
                  {DIAS_SEMANA.map((dia) => (
                    <div key={dia.value} className="flex items-center space-x-2">
                      <Switch
                        id={dia.value}
                        checked={formData.dias_operacion.includes(dia.value)}
                        onCheckedChange={(checked) => handleDiaOperacionChange(dia.value, checked)}
                        disabled={cargando}
                      />
                      <Label htmlFor={dia.value} className="text-sm">
                        {dia.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_apertura">Fecha de Apertura</Label>
                <Input
                  id="fecha_apertura"
                  type="date"
                  value={formData.fecha_apertura}
                  onChange={(e) => handleInputChange("fecha_apertura", e.target.value)}
                  disabled={cargando}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moneda">Moneda</Label>
                  <Select
                    value={formData.moneda}
                    onValueChange={(value) => handleInputChange("moneda", value)}
                    disabled={cargando}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                      <SelectItem value="USD">Dólar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zona_horaria">Zona Horaria</Label>
                  <Select
                    value={formData.zona_horaria}
                    onValueChange={(value) => handleInputChange("zona_horaria", value)}
                    disabled={cargando}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires</SelectItem>
                      <SelectItem value="America/Argentina/Cordoba">Córdoba</SelectItem>
                      <SelectItem value="America/Argentina/Mendoza">Mendoza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idioma">Idioma</Label>
                  <Select
                    value={formData.idioma}
                    onValueChange={(value) => handleInputChange("idioma", value)}
                    disabled={cargando}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">Inglés</SelectItem>
                      <SelectItem value="pt">Portugués</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacto */}
        <TabsContent value="contacto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
              <CardDescription>Datos de contacto del restaurante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono_restaurante">Teléfono del Restaurante</Label>
                  <Input
                    id="telefono_restaurante"
                    value={formData.telefono_restaurante}
                    onChange={(e) => handleInputChange("telefono_restaurante", e.target.value)}
                    placeholder="+54 11 1234-5678"
                    disabled={cargando}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_restaurante">Email del Restaurante</Label>
                  <Input
                    id="email_restaurante"
                    type="email"
                    value={formData.email_restaurante}
                    onChange={(e) => handleInputChange("email_restaurante", e.target.value)}
                    placeholder="info@restaurante.com"
                    disabled={cargando}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sitio_web">Sitio Web</Label>
                <Input
                  id="sitio_web"
                  value={formData.sitio_web}
                  onChange={(e) => handleInputChange("sitio_web", e.target.value)}
                  placeholder="https://www.restaurante.com"
                  disabled={cargando}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => handleInputChange("activo", checked)}
                  disabled={cargando}
                />
                <Label htmlFor="activo">Restaurante activo</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
