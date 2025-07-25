"use client"

import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Star } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const [featuresVisible, setFeaturesVisible] = useState(false)
  const [pricingVisible, setPricingVisible] = useState(false)

  // Redirect to dashboard if user is logged in
  // This is just a placeholder - you would implement actual auth check
  const isLoggedIn = false
  if (isLoggedIn) {
    redirect("/dashboard")
  }

  useEffect(() => {
    // Trigger hero animation
    setIsVisible(true)

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.id === "features") {
              setFeaturesVisible(true)
            }
            if (entry.target.id === "pricing") {
              setPricingVisible(true)
            }
          }
        })
      },
      { threshold: 0.1 },
    )

    const featuresSection = document.getElementById("features")
    const pricingSection = document.getElementById("pricing")

    if (featuresSection) observer.observe(featuresSection)
    if (pricingSection) observer.observe(pricingSection)

    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50 animate-slide-down">
        <div className="container flex h-16 items-center justify-between px-4 md:px:6">
          <div className="flex items-center gap-2 font-bold text-xl group cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent group-hover:from-orange-700 group-hover:to-red-700 transition-all duration-300">
              Resto
            </span>
            <span className="text-gray-900 group-hover:text-gray-700 transition-colors duration-300">Manage</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="outline"
                className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:scale-105 transition-all duration-300 hover:shadow-md"
              >
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 hover:scale-105 transition-all duration-300 hover:shadow-lg">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50"></div>
          <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-100 to-transparent transform rotate-12 scale-150 animate-float"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-red-100 to-transparent transform -rotate-12 scale-150 animate-float-delayed"></div>
          </div>

          <div className="container relative px-4 md:px:6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 xl:grid-cols-2 items-center">
              <div
                className={`flex flex-col justify-center space-y-8 transition-all duration-1000 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0 translate-y-10"}`}
              >
                <div className="space-y-6">
                  <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-orange-700 animate-bounce-subtle hover:scale-105 transition-transform duration-300">
                    <Star className="mr-2 h-4 w-4 fill-current animate-pulse" />
                    Plataforma #1 para restaurantes
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent animate-gradient">
                      Gestión completa
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent animate-gradient-delayed">
                      para tu restaurante
                    </span>
                  </h1>
                  <p className="max-w-[600px] text-xl text-gray-600 leading-relaxed animate-fade-in-delayed">
                    Controla empleados, menús, inventario, reservas, finanzas y más en una sola plataforma. Optimiza tu
                    negocio y aumenta tus ganancias.
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row animate-slide-up-delayed">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-lg px-8 py-6 gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 group"
                    >
                      Comenzar ahora
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 py-6 border-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:scale-105 transition-all duration-300 hover:shadow-md"
                    >
                      Ver demo
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-8 text-sm text-gray-600 animate-fade-in-delayed-2">
                  {["Sin configuración compleja", "Soporte 24/7", "Prueba gratuita"].map((text, index) => (
                    <div
                      key={text}
                      className={`flex items-center gap-2 animate-slide-up`}
                      style={{ animationDelay: `${1.5 + index * 0.2}s` }}
                    >
                      <Check
                        className="h-4 w-4 text-green-600 animate-check-mark"
                        style={{ animationDelay: `${2 + index * 0.2}s` }}
                      />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
              <div
                className={`flex items-center justify-center lg:justify-end transition-all duration-1000 delay-500 ${isVisible ? "animate-slide-up opacity-100" : "opacity-0 translate-y-10"}`}
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl blur-3xl opacity-20 scale-110 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <img
                    src="/placeholder.svg?height=600&width=600"
                    alt="Dashboard Preview"
                    width={600}
                    height={600}
                    className="relative rounded-2xl object-cover border shadow-2xl bg-white group-hover:scale-105 transition-transform duration-500 hover:shadow-3xl"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32 bg-white">
          <div className="container px-4 md:px:6">
            <div
              className={`flex flex-col items-center justify-center space-y-4 text-center mb-16 transition-all duration-1000 ${featuresVisible ? "animate-slide-up opacity-100" : "opacity-0 translate-y-10"}`}
            >
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Todo lo que necesitas para tu restaurante
                  </span>
                </h2>
                <p className="max-w-[900px] text-xl text-gray-600 leading-relaxed">
                  Gestiona todos los aspectos de tu restaurante desde una única plataforma intuitiva y poderosa.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`group relative flex flex-col items-center space-y-4 rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-white cursor-pointer ${
                    featuresVisible ? "animate-slide-up opacity-100" : "opacity-0 translate-y-10"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 group-hover:from-orange-200 group-hover:to-red-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <div className="text-orange-600 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-center text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-20 md:py-32 bg-gradient-to-br from-gray-50 to-orange-50">
          <div className="container px-4 md:px:6">
            <div
              className={`flex flex-col items-center justify-center space-y-4 text-center mb-16 transition-all duration-1000 ${pricingVisible ? "animate-slide-up opacity-100" : "opacity-0 translate-y-10"}`}
            >
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Planes que se adaptan a tu negocio
                  </span>
                </h2>
                <p className="max-w-[700px] text-xl text-gray-600 leading-relaxed">
                  Elige el plan perfecto para tu restaurante. Todos incluyen soporte completo y actualizaciones
                  gratuitas.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
              {pricingPlans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl border-2 p-8 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 cursor-pointer group ${
                    plan.popular
                      ? "border-orange-500 bg-white scale-105 animate-pulse-border"
                      : "border-gray-200 bg-white hover:border-orange-200"
                  } ${pricingVisible ? "animate-slide-up opacity-100" : "opacity-0 translate-y-10"}`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-bounce-subtle">
                      <span className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                        Más Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center space-y-4 mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                      {plan.name}
                    </h3>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-300">
                        <span className="animate-number-count">${plan.price}</span>
                        <span className="text-lg font-normal text-gray-600">/mes</span>
                      </div>
                      <p className="text-gray-600">{plan.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className={`flex items-start gap-3 animate-slide-right`}
                        style={{ animationDelay: `${index * 0.2 + featureIndex * 0.1}s` }}
                      >
                        <Check
                          className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0 animate-check-mark"
                          style={{ animationDelay: `${(index * 0.2) + (featureIndex * 0.1) + 0.5}s` }}
                        />
                        <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="w-full">
                    <Button
                      className={`w-full py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg group/button ${
                        plan.popular
                          ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                      }`}
                    >
                      <span className="group-hover/button:scale-105 transition-transform duration-300">
                        {plan.buttonText}
                      </span>
                    </Button>
                  </Link>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
            <div
              className={`text-center mt-12 transition-all duration-1000 delay-700 ${pricingVisible ? "animate-fade-in opacity-100" : "opacity-0"}`}
            >
              <p className="text-gray-600 mb-4">¿Necesitas un plan personalizado para tu cadena de restaurantes?</p>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:scale-105 transition-all duration-300 hover:shadow-md"
                >
                  Contactar ventas
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-r from-orange-600 to-red-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-red-600/90"></div>
          <div className="absolute inset-0 animate-pulse-slow">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
          </div>
          <div className="container relative px-4 md:px:6">
            <div className="flex flex-col items-center justify-center space-y-8 text-center text-white animate-slide-up">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl animate-fade-in">
                  ¿Listo para transformar tu restaurante?
                </h2>
                <p className="max-w-[600px] text-xl text-orange-100 leading-relaxed animate-fade-in-delayed">
                  Únete a miles de restaurantes que ya confían en RestoManage para optimizar sus operaciones.
                </p>
              </div>
              <div className="flex flex-col gap-4 min-[400px]:flex-row animate-slide-up-delayed">
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-6 gap-2 shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-xl group"
                  >
                    Comenzar prueba gratuita
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-orange-600 text-lg px-8 py-6 hover:scale-105 transition-all duration-300"
                  >
                    Ver demo en vivo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-gray-900 text-white animate-slide-up">
        <div className="container flex flex-col gap-8 py-12 md:flex-row md:gap-12 md:py-16">
          <div className="flex-1 space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-xl group cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Resto</span>
              <span className="text-white">Manage</span>
            </div>
            <p className="text-gray-400 max-w-md">
              La plataforma completa para la gestión de restaurantes. Optimiza tu negocio y aumenta tus ganancias.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            {[
              {
                title: "Producto",
                links: ["Características", "Precios", "Demo"],
              },
              {
                title: "Empresa",
                links: ["Acerca de", "Blog", "Contacto"],
              },
              {
                title: "Legal",
                links: ["Términos de Servicio", "Política de Privacidad"],
              },
            ].map((section, index) => (
              <div
                key={section.title}
                className={`space-y-4 animate-slide-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="font-semibold text-white">{section.title}</div>
                <nav className="flex flex-col gap-2 text-sm text-gray-400">
                  {section.links.map((link, linkIndex) => (
                    <Link
                      key={link}
                      href="#"
                      className="hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
                    >
                      {link}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-400 animate-fade-in-delayed">
          © {new Date().getFullYear()} RestoManage. Todos los derechos reservados.
        </div>
      </footer>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-right {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(12deg) scale(1.5);
          }
          50% {
            transform: translateY(-20px) rotate(12deg) scale(1.5);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px) rotate(-12deg) scale(1.5);
          }
          50% {
            transform: translateY(-15px) rotate(-12deg) scale(1.5);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }

        @keyframes pulse-border {
          0%, 100% {
            border-color: rgb(249 115 22);
            box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4);
          }
          50% {
            border-color: rgb(239 68 68);
            box-shadow: 0 0 0 10px rgba(249, 115, 22, 0);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes check-mark {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes number-count {
          from {
            transform: scale(0.8);
          }
          to {
            transform: scale(1);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
          animation-fill-mode: both;
        }

        .animate-slide-up-delayed {
          animation: slide-up 0.8s ease-out 0.3s;
          animation-fill-mode: both;
        }

        .animate-slide-right {
          animation: slide-right 0.6s ease-out;
          animation-fill-mode: both;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
          animation-fill-mode: both;
        }

        .animate-fade-in-delayed {
          animation: fade-in 1s ease-out 0.5s;
          animation-fill-mode: both;
        }

        .animate-fade-in-delayed-2 {
          animation: fade-in 1s ease-out 1s;
          animation-fill-mode: both;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-gradient {
          background: linear-gradient(-45deg, #1f2937, #374151, #1f2937, #111827);
          background-size: 400% 400%;
          animation: gradient 3s ease infinite;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .animate-gradient-delayed {
          background: linear-gradient(-45deg, #ea580c, #dc2626, #ea580c, #b91c1c);
          background-size: 400% 400%;
          animation: gradient 3s ease infinite 0.5s;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-check-mark {
          animation: check-mark 0.6s ease-out;
          animation-fill-mode: both;
        }

        .animate-number-count {
          animation: number-count 0.8s ease-out;
        }
      `}</style>
    </div>
  )
}

const features = [
  {
    title: "Gestión de Empleados",
    description: "Controla horarios, tareas y rendimiento de tu personal con herramientas avanzadas.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
  },
  {
    title: "Gestión de Menús",
    description: "Crea y actualiza menús dinámicos basados en tu inventario disponible en tiempo real.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
        <path d="M7 2v20"></path>
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
      </svg>
    ),
  },
  {
    title: "Control de Inventario",
    description: "Gestiona tu inventario de alimentos y bebidas con alertas automáticas de stock bajo.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 5H8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"></path>
        <path d="M4 12V7a2 2 0 0 1 2-2"></path>
        <path d="M10 2v3"></path>
        <path d="M18 2v3"></path>
        <path d="M14 14v-4"></path>
        <path d="M14 14h-4"></path>
      </svg>
    ),
  },
  {
    title: "Reservas y Mesas",
    description: "Administra reservas y visualiza el estado de tus mesas en tiempo real con mapas interactivos.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
        <line x1="3" x2="21" y1="9" y2="9"></line>
        <line x1="9" x2="9" y1="21" y2="9"></line>
      </svg>
    ),
  },
  {
    title: "Punto de Venta",
    description: "Sistema POS completo con procesamiento de pagos y gestión de pedidos integrada.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
        <path d="M3 6h18"></path>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
    ),
  },
  {
    title: "Reportes Financieros",
    description: "Analiza ganancias, gastos y tendencias con reportes detallados y dashboards interactivos.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18"></path>
        <path d="m19 9-5 5-4-4-3 3"></path>
      </svg>
    ),
  },
]

const pricingPlans = [
  {
    name: "Básico",
    price: 50,
    description: "Perfecto para restaurantes pequeños",
    popular: false,
    buttonText: "Comenzar ahora",
    features: [
      "Hasta 5 empleados",
      "Gestión básica de inventario",
      "Sistema POS básico",
      "Reportes mensuales",
      "Soporte por email",
      "1 ubicación",
      "Gestión de menús",
      "Reservas básicas",
    ],
  },
  {
    name: "Profesional",
    price: 60,
    description: "Ideal para restaurantes en crecimiento",
    popular: true,
    buttonText: "Comenzar ahora",
    features: [
      "Hasta 15 empleados",
      "Inventario avanzado con alertas",
      "POS completo con pagos",
      "Reportes semanales y mensuales",
      "Soporte prioritario",
      "Hasta 3 ubicaciones",
      "Gestión avanzada de menús",
      "Sistema de reservas completo",
      "Fidelización de clientes",
      "Análisis de ventas",
    ],
  },
  {
    name: "Empresarial",
    price: 120,
    description: "Para cadenas y restaurantes grandes",
    popular: false,
    buttonText: "Comenzar ahora",
    features: [
      "Empleados ilimitados",
      "Inventario multi-ubicación",
      "POS avanzado con integraciones",
      "Reportes en tiempo real",
      "Soporte 24/7 dedicado",
      "Ubicaciones ilimitadas",
      "Menús dinámicos automáticos",
      "Reservas con IA",
      "CRM completo de clientes",
      "Analytics avanzados",
      "API personalizada",
      "Capacitación incluida",
    ],
  },
]
