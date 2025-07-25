"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CoffeeIcon as Cocktail,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"

// Tipos
type EstadoBebida = "Pendiente" | "En preparación" | "Lista para servir" | "Entregada" | "Cancelada"
type TipoServicio = "Para llevar" | "Para servir en mesa"

interface Bebida {
  id: number
  nombre: string
  categoria: string
  tiempoPreparacion: string
  dificultad: "Fácil" | "Media" | "Difícil"
  ingredientes: string[]
  pasos: string[]
  imagen?: string
  presentacionFinal?: string
}

interface PedidoBebida {
  id: number
  numeroPedido: number
  mesa?: number
  cliente: string
  bebida: Bebida
  cantidad: number
  estado: EstadoBebida
  tipoServicio: TipoServicio
  horaCreacion: string
  tiempoTranscurrido: string
  bartenderAsignado?: string
  meseroAsignado?: string
  observaciones?: string
  prioridad: "Normal" | "Alta"
}

export default function PreparacionBebidaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [pedido, setPedido] = useState<PedidoBebida | null>(null)
  const [pasoActual, setPasoActual] = useState(0)
  const [ingredientesCompletados, setIngredientesCompletados] = useState<boolean[]>([])
  const [preparacionCompletada, setPreparacionCompletada] = useState(false)
  const [tiempoRestante, setTiempoRestante] = useState<number>(0)
  const [tiempoTotal, setTiempoTotal] = useState<number>(0)
  const [timerActivo, setTimerActivo] = useState(false)

  // Simular carga de datos del pedido
  useEffect(() => {
    // En una app real, aquí se haría una llamada a la API
    const pedidoId = Number.parseInt(params.id)
    const pedidoEncontrado = pedidosBebidas.find((p) => p.id === pedidoId) || null

    if (pedidoEncontrado) {
      setPedido(pedidoEncontrado)

      // Inicializar estado de ingredientes
      setIngredientesCompletados(new Array(pedidoEncontrado.bebida.ingredientes.length).fill(false))

      // Extraer tiempo de preparación y convertirlo a segundos
      const tiempoStr = pedidoEncontrado.bebida.tiempoPreparacion
      const minutos = Number.parseInt(tiempoStr.match(/\d+/)?.[0] || "5")
      const segundosTotal = minutos * 60
      setTiempoTotal(segundosTotal)
      setTiempoRestante(segundosTotal)
    } else {
      // Redirigir si no se encuentra el pedido
      router.push("/dashboard/bartending")
    }
  }, [params.id, router])

  // Timer para la preparación
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerActivo && tiempoRestante > 0) {
      interval = setInterval(() => {
        setTiempoRestante((prev) => prev - 1)
      }, 1000)
    } else if (tiempoRestante === 0 && timerActivo) {
      setTimerActivo(false)
      toast({
        title: "¡Tiempo completado!",
        description: "La bebida debería estar lista ahora.",
      })
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActivo, tiempoRestante, toast])

  // Formatear tiempo restante
  const formatTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60)
    const secs = segundos % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Manejar clic en ingrediente
  const toggleIngrediente = (index: number) => {
    const nuevosIngredientes = [...ingredientesCompletados]
    nuevosIngredientes[index] = !nuevosIngredientes[index]
    setIngredientesCompletados(nuevosIngredientes)
  }

  // Avanzar al siguiente paso
  const siguientePaso = () => {
    if (!pedido) return

    if (pasoActual < pedido.bebida.pasos.length - 1) {
      setPasoActual(pasoActual + 1)
    } else {
      setPreparacionCompletada(true)
      toast({
        title: "¡Preparación completada!",
        description: "La bebida está lista para ser servida.",
      })
    }
  }

  // Retroceder al paso anterior
  const pasoAnterior = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1)
    }
  }

  // Iniciar/pausar timer
  const toggleTimer = () => {
    setTimerActivo(!timerActivo)
  }

  // Reiniciar timer
  const reiniciarTimer = () => {
    setTiempoRestante(tiempoTotal)
    setTimerActivo(false)
  }

  // Completar preparación
  const completarPreparacion = () => {
    // En una app real, aquí se enviaría la actualización al backend
    toast({
      title: "Bebida completada",
      description: "La bebida ha sido marcada como lista para servir.",
    })

    // Redirigir a la lista de pedidos
    setTimeout(() => {
      router.push("/dashboard/bartending")
    }, 1500)
  }

  // Si no hay pedido, mostrar carga
  if (!pedido) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Cocktail className="h-16 w-16 animate-pulse text-muted-foreground" />
        <p className="mt-4 text-lg">Cargando detalles de la bebida...</p>
      </div>
    )
  }

  // Calcular progreso
  const progresoPasos = Math.round(((pasoActual + 1) / pedido.bebida.pasos.length) * 100)
  const progresoIngredientes = Math.round(
    (ingredientesCompletados.filter(Boolean).length / ingredientesCompletados.length) * 100,
  )
  const progresoTiempo = Math.round(((tiempoTotal - tiempoRestante) / tiempoTotal) * 100)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/dashboard/bartending")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la lista
        </Button>
        <Badge variant={pedido.prioridad === "Alta" ? "destructive" : "outline"} className="text-base py-1 px-4">
          {pedido.prioridad === "Alta" ? "Prioridad Alta" : "Prioridad Normal"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Panel de información del pedido */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cocktail className="h-5 w-5" />
              {pedido.bebida.nombre}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pedido #:</span>
              <span>{pedido.numeroPedido}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cliente:</span>
              <span>{pedido.cliente}</span>
            </div>
            {pedido.mesa && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mesa:</span>
                <span>{pedido.mesa}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cantidad:</span>
              <span>{pedido.cantidad}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tipo de servicio:</span>
              <span>{pedido.tipoServicio}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Bartender:</span>
              <span>{pedido.bartenderAsignado || "Sin asignar"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dificultad:</span>
              <Badge variant="outline">{pedido.bebida.dificultad}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tiempo estimado:</span>
              <span>{pedido.bebida.tiempoPreparacion}</span>
            </div>

            {pedido.observaciones && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Observaciones:</p>
                    <p className="text-sm text-muted-foreground">{pedido.observaciones}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tiempo restante:</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{formatTiempo(tiempoRestante)}</span>
                </div>
              </div>
              <Progress value={progresoTiempo} className="h-2" />
              <div className="flex justify-between mt-2">
                <Button variant="outline" size="sm" onClick={toggleTimer}>
                  {timerActivo ? "Pausar" : "Iniciar"}
                </Button>
                <Button variant="outline" size="sm" onClick={reiniciarTimer}>
                  Reiniciar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panel principal de preparación */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Preparación de {pedido.bebida.nombre}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="pasos" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="pasos">Pasos</TabsTrigger>
                <TabsTrigger value="ingredientes">Ingredientes</TabsTrigger>
                <TabsTrigger value="presentacion">Presentación</TabsTrigger>
              </TabsList>

              {/* Pestaña de pasos */}
              <TabsContent value="pasos" className="p-4 min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">
                    Paso {pasoActual + 1} de {pedido.bebida.pasos.length}
                  </span>
                  <Progress value={progresoPasos} className="w-1/2 h-2" />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="bg-muted/30 p-6 rounded-lg mb-4 flex-1 flex items-center justify-center text-center">
                    <div>
                      <div className="text-2xl font-bold mb-4">Paso {pasoActual + 1}</div>
                      <p className="text-lg">{pedido.bebida.pasos[pasoActual]}</p>
                    </div>
                  </div>

                  <div className="flex justify-between mt-auto">
                    <Button variant="outline" onClick={pasoAnterior} disabled={pasoActual === 0}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      onClick={siguientePaso}
                      disabled={pasoActual === pedido.bebida.pasos.length - 1 && preparacionCompletada}
                    >
                      {pasoActual === pedido.bebida.pasos.length - 1 ? "Finalizar" : "Siguiente"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Pestaña de ingredientes */}
              <TabsContent value="ingredientes" className="p-4 min-h-[400px]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">
                    {ingredientesCompletados.filter(Boolean).length} de {ingredientesCompletados.length} ingredientes
                  </span>
                  <Progress value={progresoIngredientes} className="w-1/2 h-2" />
                </div>

                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {pedido.bebida.ingredientes.map((ingrediente, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          ingredientesCompletados[index] ? "bg-green-50 border-green-200" : "hover:bg-muted/50"
                        }`}
                        onClick={() => toggleIngrediente(index)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              ingredientesCompletados[index]
                                ? "bg-green-500 text-white"
                                : "border border-muted-foreground"
                            }`}
                          >
                            {ingredientesCompletados[index] && <CheckCircle className="h-4 w-4" />}
                          </div>
                          <span className={ingredientesCompletados[index] ? "line-through text-muted-foreground" : ""}>
                            {ingrediente}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Pestaña de presentación */}
              <TabsContent value="presentacion" className="p-4 min-h-[400px]">
                <div className="flex flex-col items-center text-center">
                  <div className="w-full max-w-md aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <img
                      src={pedido.bebida.imagen || "/placeholder.svg?height=200&width=300"}
                      alt={pedido.bebida.nombre}
                      className="max-h-full max-w-full object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Presentación Final</h3>
                  <div className="bg-muted/30 p-4 rounded-lg w-full">
                    <p>
                      {pedido.bebida.presentacionFinal ||
                        "Servir en el vaso apropiado con la decoración correspondiente."}
                    </p>
                  </div>

                  <div className="mt-6 p-4 border border-amber-200 bg-amber-50 rounded-lg w-full">
                    <div className="flex gap-2">
                      <Info className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div className="text-left">
                        <p className="font-medium">Consejos para la presentación:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                          <li>Asegúrate de que el vaso esté limpio y sin marcas</li>
                          <li>La decoración debe ser fresca y atractiva</li>
                          <li>Coloca una servilleta o posavasos debajo</li>
                          <li>Sirve la bebida a la temperatura adecuada</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <div className="px-4 py-2 text-sm text-muted-foreground italic flex items-center gap-2">
            <Info className="h-4 w-4" />
            Los pasos de preparación son una guía. Puedes marcar la bebida como lista en cualquier momento.
          </div>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/dashboard/bartending")}>
              Cancelar
            </Button>
            <Button onClick={completarPreparacion} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              Marcar como lista
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

// Datos de ejemplo - Bebidas
const bebidas = [
  {
    id: 1,
    nombre: "Mojito",
    categoria: "Cócteles",
    tiempoPreparacion: "5 minutos",
    dificultad: "Fácil",
    ingredientes: [
      "60 ml de ron blanco",
      "30 ml de jugo de lima",
      "2 cucharadas de azúcar",
      "8-10 hojas de menta",
      "Agua con gas",
      "Hielo",
    ],
    pasos: [
      "Colocar las hojas de menta, el azúcar y el jugo de lima en un vaso alto",
      "Machacar suavemente para liberar los aceites de la menta",
      "Agregar hielo hasta 3/4 del vaso",
      "Verter el ron",
      "Completar con agua con gas",
      "Remover suavemente",
      "Decorar con hojas de menta y una rodaja de lima",
    ],
    imagen: "/placeholder.svg?height=100&width=100",
    presentacionFinal: "Servir en vaso alto con hielo, decorado con menta fresca y rodaja de lima",
  },
  {
    id: 2,
    nombre: "Margarita",
    categoria: "Cócteles",
    tiempoPreparacion: "3 minutos",
    dificultad: "Fácil",
    ingredientes: [
      "60 ml de tequila",
      "30 ml de licor de naranja",
      "30 ml de jugo de limón fresco",
      "Sal para el borde",
      "Hielo",
    ],
    pasos: [
      "Pasar un limón por el borde de la copa y sumergir en sal",
      "En una coctelera, agregar hielo, tequila, licor de naranja y jugo de limón",
      "Agitar vigorosamente durante 15 segundos",
      "Colar en la copa preparada",
      "Decorar con una rodaja de limón",
    ],
    imagen: "/placeholder.svg?height=100&width=100",
    presentacionFinal: "Servir en copa de margarita con borde escarchado con sal y rodaja de limón",
  },
  // Resto de bebidas...
]

// Datos de ejemplo - Pedidos de bebidas
const pedidosBebidas = [
  {
    id: 101,
    numeroPedido: 1001,
    mesa: 5,
    cliente: "Mesa 5",
    bebida: bebidas[0], // Mojito
    cantidad: 2,
    estado: "Pendiente",
    tipoServicio: "Para servir en mesa",
    horaCreacion: "19:30",
    tiempoTranscurrido: "5 min",
    observaciones: "Con poco azúcar",
    prioridad: "Normal",
  },
  {
    id: 102,
    numeroPedido: 1002,
    mesa: 8,
    cliente: "Mesa 8",
    bebida: bebidas[1], // Margarita
    cantidad: 3,
    estado: "En preparación",
    tipoServicio: "Para servir en mesa",
    horaCreacion: "19:25",
    tiempoTranscurrido: "10 min",
    bartenderAsignado: "Carlos Martínez",
    prioridad: "Alta",
  },
  // Resto de pedidos...
]
