"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

export default function ConfiguracionPage() {
  const { toast } = useToast()

  // Placeholder data for user, payment, and subscription
  const [userName, setUserName] = useState("Admin User")
  const [userEmail, setUserEmail] = useState("admin@example.com")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const paymentProvider = "Stripe" // Example
  const subscriptionPlan = "Premium" // Example
  const subscriptionEndDate = "31/12/2025" // Example

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "Las nuevas contraseñas no coinciden.",
        variant: "destructive",
      })
      return
    }
    // Simulate API call
    console.log("Cambio de contraseña solicitado:", { currentPassword, newPassword })
    toast({
      title: "Contraseña Actualizada",
      description: "Tu contraseña ha sido cambiada exitosamente.",
    })
    setCurrentPassword("")
    setNewPassword("")
    setConfirmNewPassword("")
  }

  const handleTwoFactorToggle = (checked: boolean) => {
    setTwoFactorEnabled(checked)
    toast({
      title: "Autenticación de dos factores",
      description: checked ? "2FA habilitado." : "2FA deshabilitado.",
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configuración</h1>
      <p className="text-muted-foreground">Gestiona la configuración de tu cuenta y preferencias de RestoManage.</p>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
          <TabsTrigger value="suscripcion">Suscripción</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Usuario</CardTitle>
              <CardDescription>Actualiza la información de tu perfil.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  disabled
                />
              </div>
              <Button>Guardar Cambios</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguridad" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Contraseña Actual</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">Nueva Contraseña</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-new-password">Confirmar Nueva Contraseña</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">Cambiar Contraseña</Button>
              </form>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Autenticación de Dos Factores (2FA)</h3>
                  <p className="text-sm text-muted-foreground">Añade una capa extra de seguridad a tu cuenta.</p>
                </div>
                <Switch checked={twoFactorEnabled} onCheckedChange={handleTwoFactorToggle} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Proveedor de Pagos</CardTitle>
              <CardDescription>Información sobre tu proveedor de pagos conectado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Proveedor Conectado</Label>
                <Input value={paymentProvider} disabled />
              </div>
              <Button variant="outline">Gestionar Conexión</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suscripcion" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de Suscripción</CardTitle>
              <CardDescription>Información sobre tu plan de suscripción actual.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Plan Actual</Label>
                <Input value={subscriptionPlan} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Fecha de Vencimiento</Label>
                <Input value={subscriptionEndDate} disabled />
              </div>
              <Button>Gestionar Suscripción</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
