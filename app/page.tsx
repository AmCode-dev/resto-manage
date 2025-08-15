import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MenuIcon as Restaurant,
  Users,
  ChefHat,
  Package,
  Calendar,
  ShoppingCart,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Shield,
  Clock,
  Zap,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Restaurant className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">RestoManage</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-orange-600 transition-colors">
                Características
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-orange-600 transition-colors">
                Precios
              </a>
              <a href="#contact" className="text-gray-600 hover:text-orange-600 transition-colors">
                Contacto
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-orange-600">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-orange-600 hover:bg-orange-700">Comenzar Gratis</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Contenido de texto */}
            <div className="space-y-8 lg:pr-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                  <Zap className="h-4 w-4" />
                  <span>Solución Todo-en-Uno</span>
                </div>

                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  <span className="text-orange-600">Gestión completa</span>
                  <br />
                  para tu restaurante
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed">
                  Encuentra la solución que se adapta a tu negocio. Administra empleados, inventario, menús, reservas y
                  más desde una sola plataforma.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg">
                    Comenzar Ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="px-8 py-4 text-lg bg-transparent">
                    Ver Demo
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-6">
                <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  85% Más Eficiente
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                  <Clock className="h-4 w-4 mr-1" />
                  24/7 Disponible
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-3 py-1">
                  <Shield className="h-4 w-4 mr-1" />
                  100% Seguro
                </Badge>
              </div>
            </div>

            {/* Laptop Mockup */}
            <div className="relative lg:pl-8">
              <div className="relative">
                {/* Laptop Frame */}
                <div className="bg-gray-800 rounded-t-2xl p-2 shadow-2xl">
                  {/* Laptop Screen Bezel */}
                  <div className="bg-black rounded-t-xl p-1">
                    {/* Window Controls */}
                    <div className="flex items-center space-x-2 px-4 py-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="bg-white rounded-lg p-6 min-h-[400px]">
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                          <div className="flex items-center space-x-2">
                            <Restaurant className="h-6 w-6 text-orange-600" />
                            <span className="font-semibold text-gray-700">Mi Restaurante</span>
                          </div>
                        </div>

                        {/* Modules Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 bg-blue-50">
                            <CardContent className="p-4 text-center">
                              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                              <h3 className="font-semibold text-blue-900">Empleados</h3>
                              <p className="text-sm text-blue-700">Gestión de personal</p>
                            </CardContent>
                          </Card>

                          <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 bg-green-50">
                            <CardContent className="p-4 text-center">
                              <ChefHat className="h-8 w-8 text-green-600 mx-auto mb-2" />
                              <h3 className="font-semibold text-green-900">Menús</h3>
                              <p className="text-sm text-green-700">Carta digital</p>
                            </CardContent>
                          </Card>

                          <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-200 bg-purple-50">
                            <CardContent className="p-4 text-center">
                              <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                              <h3 className="font-semibold text-purple-900">Inventario</h3>
                              <p className="text-sm text-purple-700">Control de stock</p>
                            </CardContent>
                          </Card>

                          <Card className="hover:shadow-md transition-shadow cursor-pointer border-orange-200 bg-orange-50">
                            <CardContent className="p-4 text-center">
                              <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                              <h3 className="font-semibold text-orange-900">Reservas</h3>
                              <p className="text-sm text-orange-700">Gestión de mesas</p>
                            </CardContent>
                          </Card>

                          <Card className="hover:shadow-md transition-shadow cursor-pointer border-red-200 bg-red-50">
                            <CardContent className="p-4 text-center">
                              <ShoppingCart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                              <h3 className="font-semibold text-red-900">POS</h3>
                              <p className="text-sm text-red-700">Punto de venta</p>
                            </CardContent>
                          </Card>

                          <Card className="hover:shadow-md transition-shadow cursor-pointer border-indigo-200 bg-indigo-50">
                            <CardContent className="p-4 text-center">
                              <BarChart3 className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                              <h3 className="font-semibold text-indigo-900">Reportes</h3>
                              <p className="text-sm text-indigo-700">Analytics</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Laptop Base */}
                <div className="bg-gray-700 h-4 rounded-b-2xl shadow-lg"></div>
                <div className="bg-gray-600 h-2 rounded-b-xl mx-8 shadow-inner"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para gestionar tu restaurante
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Una plataforma completa que simplifica la operación diaria de tu negocio gastronómico
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Gestión de Empleados",
                description: "Administra horarios, roles y permisos de tu equipo de trabajo",
                color: "blue",
              },
              {
                icon: ChefHat,
                title: "Menús Digitales",
                description: "Crea y actualiza tu carta con precios, ingredientes y fotos",
                color: "green",
              },
              {
                icon: Package,
                title: "Control de Inventario",
                description: "Monitorea stock, fechas de vencimiento y proveedores",
                color: "purple",
              },
              {
                icon: Calendar,
                title: "Sistema de Reservas",
                description: "Gestiona reservas de mesas y optimiza la ocupación",
                color: "orange",
              },
              {
                icon: ShoppingCart,
                title: "Punto de Venta",
                description: "Procesa órdenes, pagos y genera tickets automáticamente",
                color: "red",
              },
              {
                icon: BarChart3,
                title: "Reportes y Analytics",
                description: "Analiza ventas, costos y rendimiento del negocio",
                color: "indigo",
              },
            ].map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <feature.icon className={`h-12 w-12 text-${feature.color}-600 mb-4`} />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">¿Listo para transformar tu restaurante?</h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Únete a cientos de restaurantes que ya optimizaron sus operaciones con RestoManage
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 text-lg">
                Comenzar Prueba Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 text-lg bg-transparent"
              >
                Contactar Ventas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Restaurant className="h-8 w-8 text-orange-600" />
                <span className="text-2xl font-bold">RestoManage</span>
              </div>
              <p className="text-gray-400">La plataforma completa para la gestión de restaurantes.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white">
                    Características
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white">
                    Precios
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Demo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Documentación
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Ayuda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>info@restomanage.com</li>
                <li>+1 (555) 123-4567</li>
                <li>Buenos Aires, Argentina</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RestoManage. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
