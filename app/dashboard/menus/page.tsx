import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Trash } from "lucide-react"

export default function MenusPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Menús</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Menú
        </Button>
      </div>
      <Tabs defaultValue="principal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="principal">Menú Principal</TabsTrigger>
          <TabsTrigger value="especial">Menú Especial</TabsTrigger>
          <TabsTrigger value="bebidas">Bebidas</TabsTrigger>
        </TabsList>
        <TabsContent value="principal" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {menuItems
              .filter((item) => item.categoria === "principal")
              .map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{item.nombre}</CardTitle>
                      <Badge variant={item.disponible ? "default" : "secondary"}>
                        {item.disponible ? "Disponible" : "No disponible"}
                      </Badge>
                    </div>
                    <CardDescription>{item.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video w-full bg-muted rounded-md overflow-hidden">
                      <img
                        src={item.imagen || "/placeholder.svg?height=200&width=300"}
                        alt={item.nombre}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="font-bold text-lg">${item.precio.toFixed(2)}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500">
                      <Trash className="mr-2 h-4 w-4" /> Eliminar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="especial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {menuItems
              .filter((item) => item.categoria === "especial")
              .map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{item.nombre}</CardTitle>
                      <Badge variant={item.disponible ? "default" : "secondary"}>
                        {item.disponible ? "Disponible" : "No disponible"}
                      </Badge>
                    </div>
                    <CardDescription>{item.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video w-full bg-muted rounded-md overflow-hidden">
                      <img
                        src={item.imagen || "/placeholder.svg?height=200&width=300"}
                        alt={item.nombre}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="font-bold text-lg">${item.precio.toFixed(2)}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500">
                      <Trash className="mr-2 h-4 w-4" /> Eliminar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="bebidas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {menuItems
              .filter((item) => item.categoria === "bebidas")
              .map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{item.nombre}</CardTitle>
                      <Badge variant={item.disponible ? "default" : "secondary"}>
                        {item.disponible ? "Disponible" : "No disponible"}
                      </Badge>
                    </div>
                    <CardDescription>{item.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video w-full bg-muted rounded-md overflow-hidden">
                      <img
                        src={item.imagen || "/placeholder.svg?height=200&width=300"}
                        alt={item.nombre}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="font-bold text-lg">${item.precio.toFixed(2)}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500">
                      <Trash className="mr-2 h-4 w-4" /> Eliminar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const menuItems = [
  {
    id: 1,
    nombre: "Pasta Carbonara",
    descripcion: "Pasta con salsa cremosa, panceta y queso parmesano",
    precio: 12.99,
    categoria: "principal",
    disponible: true,
    imagen: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    nombre: "Ensalada César",
    descripcion: "Lechuga romana, crutones, queso parmesano y aderezo César",
    precio: 8.99,
    categoria: "principal",
    disponible: true,
    imagen: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    nombre: "Filete de Salmón",
    descripcion: "Filete de salmón a la parrilla con verduras de temporada",
    precio: 18.99,
    categoria: "principal",
    disponible: false,
    imagen: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    nombre: "Postre del Chef",
    descripcion: "Postre especial del día preparado por nuestro chef pastelero",
    precio: 7.99,
    categoria: "especial",
    disponible: true,
    imagen: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    nombre: "Paella de Mariscos",
    descripcion: "Arroz con azafrán, camarones, mejillones y calamares",
    precio: 24.99,
    categoria: "especial",
    disponible: true,
    imagen: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 6,
    nombre: "Vino Tinto",
    descripcion: "Botella de vino tinto reserva",
    precio: 29.99,
    categoria: "bebidas",
    disponible: true,
    imagen: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 7,
    nombre: "Mojito",
    descripcion: "Cóctel refrescante con ron, lima, menta y azúcar",
    precio: 8.99,
    categoria: "bebidas",
    disponible: true,
    imagen: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 8,
    nombre: "Limonada Casera",
    descripcion: "Limonada fresca preparada con limones recién exprimidos",
    precio: 3.99,
    categoria: "bebidas",
    disponible: true,
    imagen: "/placeholder.svg?height=200&width=300",
  },
]
