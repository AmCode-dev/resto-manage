import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Calendar, DollarSign, ShoppingBag, Users, Utensils } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$15,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% respecto al mes anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">+201 desde la semana pasada</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reservas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+89</div>
                <p className="text-xs text-muted-foreground">Para los próximos 7 días</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">3 en turno actual</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Resumen de Ventas</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] w-full bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground">
                  Gráfico de ventas
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimas 5 actividades en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`rounded-full p-2 ${activity.bgColor}`}>{activity.icon}</div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analíticas</CardTitle>
              <CardDescription>Visualiza el rendimiento de tu restaurante a lo largo del tiempo.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
              Contenido de analíticas (gráficos y estadísticas)
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes</CardTitle>
              <CardDescription>Genera y descarga reportes personalizados.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
              Contenido de reportes (formularios y listados)
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const recentActivities = [
  {
    icon: <Users className="h-4 w-4 text-white" />,
    title: "Nuevo empleado registrado",
    timestamp: "Hace 2 horas",
    bgColor: "bg-blue-500",
  },
  {
    icon: <ShoppingBag className="h-4 w-4 text-white" />,
    title: "Nuevo pedido recibido",
    timestamp: "Hace 3 horas",
    bgColor: "bg-green-500",
  },
  {
    icon: <Calendar className="h-4 w-4 text-white" />,
    title: "Reserva confirmada",
    timestamp: "Hace 5 horas",
    bgColor: "bg-purple-500",
  },
  {
    icon: <Utensils className="h-4 w-4 text-white" />,
    title: "Menú actualizado",
    timestamp: "Hace 1 día",
    bgColor: "bg-orange-500",
  },
  {
    icon: <BarChart3 className="h-4 w-4 text-white" />,
    title: "Reporte mensual generado",
    timestamp: "Hace 2 días",
    bgColor: "bg-red-500",
  },
]
