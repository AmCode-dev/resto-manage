/**
 * Utilidades para autenticación y gestión de permisos
 * Proporciona funciones para detectar similitud de emails y asignar permisos
 */

import type { Empleado } from "@/hooks/use-auth"

/**
 * Detecta si dos emails pertenecen al mismo dominio o organización
 */
export function detectEmailSimilarity(userEmail: string, restaurantEmail: string): {
  isSimilar: boolean
  confidence: 'high' | 'medium' | 'low'
  reason: string
} {
  if (!userEmail || !restaurantEmail) {
    return { isSimilar: false, confidence: 'low', reason: 'Missing email data' }
  }

  const userDomain = userEmail.split('@')[1]?.toLowerCase()
  const restaurantDomain = restaurantEmail.split('@')[1]?.toLowerCase()

  if (!userDomain || !restaurantDomain) {
    return { isSimilar: false, confidence: 'low', reason: 'Invalid email format' }
  }

  // Exact domain match
  if (userDomain === restaurantDomain) {
    return { isSimilar: true, confidence: 'high', reason: 'Exact domain match' }
  }

  // Check for subdomain relationship
  if (userDomain.includes(restaurantDomain) || restaurantDomain.includes(userDomain)) {
    return { isSimilar: true, confidence: 'medium', reason: 'Subdomain relationship' }
  }

  // Check for similar base domains (e.g., company.com vs company.net)
  const userBaseDomain = userDomain.split('.')[0]
  const restaurantBaseDomain = restaurantDomain.split('.')[0]
  
  if (userBaseDomain === restaurantBaseDomain && userBaseDomain.length > 3) {
    return { isSimilar: true, confidence: 'medium', reason: 'Similar base domain' }
  }

  return { isSimilar: false, confidence: 'low', reason: 'No domain similarity detected' }
}

/**
 * Calcula permisos basados en el cargo del empleado
 */
export function calculatePermissionsByCargo(cargo: string): Empleado['permisos'] {
  const cargoLower = cargo.toLowerCase()

  // Permisos para Propietario/Dueño
  if (cargoLower.includes('propietario') || cargoLower.includes('dueño') || cargoLower.includes('owner')) {
    return {
      pos: true,
      inventario: true,
      empleados: true,
      reportes: true,
      configuracion: true,
      reservas: true,
      menus: true,
    }
  }

  // Permisos para Gerente/Manager
  if (cargoLower.includes('gerente') || cargoLower.includes('manager') || cargoLower.includes('supervisor')) {
    return {
      pos: true,
      inventario: true,
      empleados: false, // No puede gestionar empleados por defecto
      reportes: true,
      configuracion: false, // No puede cambiar configuración
      reservas: true,
      menus: true,
    }
  }

  // Permisos para Chef
  if (cargoLower.includes('chef') || cargoLower.includes('cocinero') || cargoLower.includes('cook')) {
    return {
      pos: false,
      inventario: true, // Puede ver inventario para cocinar
      empleados: false,
      reportes: false,
      configuracion: false,
      reservas: false,
      menus: true, // Puede gestionar menús
    }
  }

  // Permisos para Cajero/Cashier
  if (cargoLower.includes('cajero') || cargoLower.includes('cashier') || cargoLower.includes('pos')) {
    return {
      pos: true, // Su función principal
      inventario: false,
      empleados: false,
      reportes: false,
      configuracion: false,
      reservas: true, // Puede manejar reservas
      menus: false,
    }
  }

  // Permisos para Mesero/Waiter
  if (cargoLower.includes('mesero') || cargoLower.includes('waiter') || cargoLower.includes('server')) {
    return {
      pos: true, // Puede tomar pedidos
      inventario: false,
      empleados: false,
      reportes: false,
      configuracion: false,
      reservas: true,
      menus: false, // Solo puede ver menús, no editarlos
    }
  }

  // Permisos por defecto para empleados genéricos
  return {
    pos: false,
    inventario: false,
    empleados: false,
    reportes: false,
    configuracion: false,
    reservas: false,
    menus: false,
  }
}

/**
 * Determina si un usuario debe tener permisos de administrador
 * basado en la similitud de email con el restaurante
 */
export function shouldGrantAdminPermissions(
  userEmail: string, 
  restaurantEmail: string,
  cargo?: string
): {
  shouldGrant: boolean
  reason: string
  permissions: Empleado['permisos']
} {
  const emailSimilarity = detectEmailSimilarity(userEmail, restaurantEmail)
  
  // Si hay alta similitud de email, otorgar permisos de propietario
  if (emailSimilarity.isSimilar && emailSimilarity.confidence === 'high') {
    return {
      shouldGrant: true,
      reason: `Admin permissions granted due to ${emailSimilarity.reason}`,
      permissions: calculatePermissionsByCargo('Propietario')
    }
  }

  // Si hay similitud media y el cargo sugiere autoridad, otorgar permisos de gerente
  if (emailSimilarity.isSimilar && emailSimilarity.confidence === 'medium' && cargo) {
    const cargoLower = cargo.toLowerCase()
    if (cargoLower.includes('admin') || cargoLower.includes('gerente') || cargoLower.includes('supervisor')) {
      return {
        shouldGrant: true,
        reason: `Enhanced permissions granted due to ${emailSimilarity.reason} and ${cargo} role`,
        permissions: calculatePermissionsByCargo('Gerente')
      }
    }
  }

  // Por defecto, usar permisos basados en cargo
  const permissions = cargo ? calculatePermissionsByCargo(cargo) : calculatePermissionsByCargo('empleado')
  
  return {
    shouldGrant: false,
    reason: 'Standard permissions based on role',
    permissions
  }
}

/**
 * Valida si un email tiene un formato válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Genera un cargo sugerido basado en el email del usuario
 */
export function suggestCargoFromEmail(userEmail: string, restaurantEmail?: string): string {
  if (!userEmail) return 'Empleado'

  const emailLower = userEmail.toLowerCase()
  const localPart = emailLower.split('@')[0]

  // Detectar palabras clave en el email
  if (localPart.includes('admin') || localPart.includes('owner') || localPart.includes('ceo')) {
    return 'Propietario'
  }
  
  if (localPart.includes('manager') || localPart.includes('gerente')) {
    return 'Gerente'
  }
  
  if (localPart.includes('chef') || localPart.includes('cook')) {
    return 'Chef'
  }
  
  if (localPart.includes('cashier') || localPart.includes('cajero')) {
    return 'Cajero'
  }
  
  if (localPart.includes('waiter') || localPart.includes('mesero')) {
    return 'Mesero'
  }

  // Si hay similitud de email alta, sugerir propietario
  if (restaurantEmail) {
    const similarity = detectEmailSimilarity(userEmail, restaurantEmail)
    if (similarity.isSimilar && similarity.confidence === 'high') {
      return 'Propietario'
    }
  }

  return 'Empleado'
}