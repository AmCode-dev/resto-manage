import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDownIcon, ArrowUpIcon, Download } from "lucide-react"

export default function FinanzasPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Finanzas</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" /> Exportar Reportes
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% respecto al mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,234.45</div>
            <p className="text-xs text-muted-foreground">+4.3% respecto al mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$32,997.44</div>
            <p className="text-xs text-muted-foreground">+28.5% respecto al mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$38.25</div>
            <p className="text-xs text-muted-foreground">+2.5% respecto al mes anterior</p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="resumen" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
          <TabsTrigger value="gastos">Gastos</TabsTrigger>
          <TabsTrigger value="proveedores">Pagos a Proveedores</TabsTrigger>
        </TabsList>
        <TabsContent value="resumen" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Ingresos vs Gastos</CardTitle>
                <CardDescription>Comparativa de los últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground">
                  Gráfico de ingresos vs gastos
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribución de Ingresos</CardTitle>
                <CardDescription>Por categoría de producto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground">
                  Gráfico de distribución de ingresos
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mes</TableHead>
                    <TableHead>Ingresos</TableHead>
                    <TableHead>Gastos</TableHead>
                    <TableHead>Beneficio</TableHead>
                    <TableHead>Margen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resumenMensual.map((mes) => (
                    <TableRow key={mes.mes}>
                      <TableCell className="font-medium">{mes.mes}</TableCell>
                      <TableCell>${mes.ingresos.toLocaleString()}</TableCell>
                      <TableCell>${mes.gastos.toLocaleString()}</TableCell>
                      <TableCell>${mes.beneficio.toLocaleString()}</TableCell>
                      <TableCell>{mes.margen}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ingresos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desglose de Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Porcentaje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Platos Principales</TableCell>
                    <TableCell>$22,450.75</TableCell>
                    <TableCell>49.6%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bebidas Alcohólicas</TableCell>
                    <TableCell>$10,234.50</TableCell>
                    <TableCell>22.6%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Postres</TableCell>
                    <TableCell>$5,678.25</TableCell>
                    <TableCell>12.6%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bebidas No Alcohólicas</TableCell>
                    <TableCell>$4,321.75</TableCell>
                    <TableCell>9.6%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Entradas</TableCell>
                    <TableCell>$2,546.64</TableCell>
                    <TableCell>5.6%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gastos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desglose de Gastos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Porcentaje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Compra de Alimentos</TableCell>
                    <TableCell>$5,234.75</TableCell>
                    <TableCell>42.8%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Salarios</TableCell>
                    <TableCell>$4,123.50</TableCell>
                    <TableCell>33.7%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Alquiler</TableCell>
                    <TableCell>$1,500.00</TableCell>
                    <TableCell>12.3%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Servicios</TableCell>
                    <TableCell>$876.20</TableCell>
                    <TableCell>7.2%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Otros</TableCell>
                    <TableCell>$500.00</TableCell>
                    <TableCell>4.1%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="proveedores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pagos a Proveedores</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Último Pago</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Distribuidora de Carnes S.A.</TableCell>
                    <TableCell>Carnes</TableCell>
                    <TableCell>15/05/2023</TableCell>
                    <TableCell>$1,234.56</TableCell>
                    <TableCell>
                      <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                        Pagado
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Verduras Frescas</TableCell>
                    <TableCell>Verduras</TableCell>
                    <TableCell>10/05/2023</TableCell>
                    <TableCell>$567.89</TableCell>
                    <TableCell>
                      <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                        Pagado
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bebidas Premium</TableCell>
                    <TableCell>Bebidas</TableCell>
                    <TableCell>05/05/2023</TableCell>
                    <TableCell>$890.12</TableCell>
                    <TableCell>
                      <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800">
                        Pendiente
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Lácteos del Valle</TableCell>
                    <TableCell>Lácteos</TableCell>
                    <TableCell>01/05/2023</TableCell>
                    <TableCell>$345.67</TableCell>
                    <TableCell>
                      <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                        Pagado
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const resumenMensual = [
  {
    mes: "Mayo 2023",
    ingresos: 45231.89,
    gastos: 12234.45,
    beneficio: 32997.44,
    margen: 73,
  },
  {
    mes: "Abril 2023",
    ingresos: 37654.32,
    gastos: 11730.21,
    beneficio: 25924.11,
    margen: 69,
  },
  {
    mes: "Marzo 2023",
    ingresos: 42123.45,
    gastos: 13456.78,
    beneficio: 28666.67,
    margen: 68,
  },
  {
    mes: "Febrero 2023",
    ingresos: 35678.9,
    gastos: 10987.65,
    beneficio: 24691.25,
    margen: 69,
  },
  {
    mes: "Enero 2023",
    ingresos: 38765.43,
    gastos: 12345.67,
    beneficio: 26419.76,
    margen: 68,
  },
  {
    mes: "Diciembre 2022",
    ingresos: 52345.67,
    gastos: 15678.9,
    beneficio: 36666.77,
    margen: 70,
  },
]
