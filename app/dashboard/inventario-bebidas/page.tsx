import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"

export default function InventarioBebidaPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inventario de Bebidas</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nueva Bebida
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar bebida..." className="pl-8" />
        </div>
      </div>
      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="alcoholicas">Alcohólicas</TabsTrigger>
          <TabsTrigger value="noalcoholicas">No Alcohólicas</TabsTrigger>
          <TabsTrigger value="vinos">Vinos</TabsTrigger>
          <TabsTrigger value="cervezas">Cervezas</TabsTrigger>
        </TabsList>
        <TabsContent value="todos" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Resumen de Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Total de Bebidas</div>
                  <div className="text-2xl font-bold">87</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Bebidas Bajas</div>
                  <div className="text-2xl font-bold text-yellow-600">12</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Agotadas</div>
                  <div className="text-2xl font-bold text-red-600">3</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Valor Total</div>
                  <div className="text-2xl font-bold">$3,845.75</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bebida</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Precio/Unidad</TableHead>
                    <TableHead>Fecha Caducidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventarioBebidas.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nombre}</TableCell>
                      <TableCell>{item.categoria}</TableCell>
                      <TableCell>{item.stock}</TableCell>
                      <TableCell>{item.unidad}</TableCell>
                      <TableCell>${item.precioUnidad.toFixed(2)}</TableCell>
                      <TableCell>{item.fechaCaducidad}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            item.estado === "Normal"
                              ? "bg-green-100 text-green-800"
                              : item.estado === "Bajo"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.estado}
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
        <TabsContent value="alcoholicas" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bebida</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Precio/Unidad</TableHead>
                    <TableHead>Fecha Caducidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventarioBebidas
                    .filter(
                      (item) =>
                        item.categoria === "Alcohólicas" || item.categoria === "Vinos" || item.categoria === "Cervezas",
                    )
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.nombre}</TableCell>
                        <TableCell>{item.categoria}</TableCell>
                        <TableCell>{item.stock}</TableCell>
                        <TableCell>{item.unidad}</TableCell>
                        <TableCell>${item.precioUnidad.toFixed(2)}</TableCell>
                        <TableCell>{item.fechaCaducidad}</TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              item.estado === "Normal"
                                ? "bg-green-100 text-green-800"
                                : item.estado === "Bajo"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.estado}
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
        {/* Contenido similar para las otras pestañas */}
      </Tabs>
    </div>
  )
}

const inventarioBebidas = [
  {
    id: 1,
    nombre: "Vino Tinto Reserva",
    categoria: "Vinos",
    stock: 15,
    unidad: "botella",
    precioUnidad: 24.99,
    fechaCaducidad: "2025-12-31",
    estado: "Normal",
  },
  {
    id: 2,
    nombre: "Cerveza Artesanal",
    categoria: "Cervezas",
    stock: 48,
    unidad: "botella",
    precioUnidad: 4.99,
    fechaCaducidad: "2023-09-15",
    estado: "Normal",
  },
  {
    id: 3,
    nombre: "Whisky Premium",
    categoria: "Alcohólicas",
    stock: 5,
    unidad: "botella",
    precioUnidad: 59.99,
    fechaCaducidad: "2030-01-01",
    estado: "Bajo",
  },
  {
    id: 4,
    nombre: "Agua Mineral",
    categoria: "No Alcohólicas",
    stock: 60,
    unidad: "botella",
    precioUnidad: 1.5,
    fechaCaducidad: "2024-06-30",
    estado: "Normal",
  },
  {
    id: 5,
    nombre: "Refresco Cola",
    categoria: "No Alcohólicas",
    stock: 24,
    unidad: "lata",
    precioUnidad: 1.25,
    fechaCaducidad: "2023-12-31",
    estado: "Normal",
  },
  {
    id: 6,
    nombre: "Jugo de Naranja",
    categoria: "No Alcohólicas",
    stock: 0,
    unidad: "litro",
    precioUnidad: 3.99,
    fechaCaducidad: "2023-06-10",
    estado: "Agotado",
  },
  {
    id: 7,
    nombre: "Champagne",
    categoria: "Vinos",
    stock: 8,
    unidad: "botella",
    precioUnidad: 34.99,
    fechaCaducidad: "2024-12-31",
    estado: "Bajo",
  },
]
