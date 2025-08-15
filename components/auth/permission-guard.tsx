"use client"

import type React from "react"
import { useAuth } from "@/hooks/use-auth"

interface PermissionGuardProps {
  children: React.ReactNode
  requiredPermission?: string
  fallback?: React.ReactNode
}

export function PermissionGuard({ children, requiredPermission, fallback = null }: PermissionGuardProps) {
  const { empleado, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Si no se requiere permiso específico, mostrar contenido
  if (!requiredPermission) {
    return <>{children}</>
  }

  // Verificar si el empleado tiene el permiso requerido
  const hasPermission = empleado?.permisos?.[requiredPermission as keyof typeof empleado.permisos] === true

  if (!hasPermission) {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-muted-foreground">Acceso Restringido</h3>
              <p className="text-sm text-muted-foreground mt-2">No tienes permisos para acceder a esta sección.</p>
            </div>
          </div>
        )}
      </>
    )
  }

  return <>{children}</>
}
