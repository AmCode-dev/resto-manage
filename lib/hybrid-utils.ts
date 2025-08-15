/**
 * Utilidades para coordinar Supabase y Prisma
 * Este archivo proporciona funciones helper para trabajar con ambos sistemas
 */

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase'
import { getSupabaseClient } from '@/lib/supabase-client'

/**
 * Obtener cliente de Supabase (browser)
 */
export const getSupabaseBrowserClient = () => {
  return getSupabaseClient()
}

/**
 * Obtener cliente de Supabase (server)
 */
export const getSupabaseServerClient = async () => {
  return await createClient()
}

/**
 * Obtener cliente de Prisma
 */
export const getPrismaClient = () => {
  return prisma
}

/**
 * Verificar si un usuario existe tanto en Supabase Auth como en la tabla empleados
 */
export async function validateUserExists(userId: string) {
  try {
    // Verificar en Supabase Auth
    const supabase = await getSupabaseServerClient()
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
    
    if (authError || !authUser) {
      return { exists: false, reason: 'Usuario no encontrado en Supabase Auth' }
    }

    // Verificar en tabla empleados usando Prisma
    const empleado = await prisma.empleado.findFirst({
      where: { user_id: userId },
      include: {
        restaurante: true,
        permisos: {
          include: {
            seccion: true
          }
        }
      }
    })

    if (!empleado) {
      return { exists: false, reason: 'Usuario no encontrado en tabla empleados' }
    }

    return {
      exists: true,
      authUser,
      empleado,
      restaurante: empleado.restaurante
    }
  } catch (error) {
    console.error('Error validating user:', error)
    return { exists: false, reason: 'Error interno', error }
  }
}

/**
 * Sincronizar datos entre Supabase y Prisma
 * Útil para asegurar consistencia de datos
 */
export async function syncUserData(userId: string) {
  try {
    const supabase = await getSupabaseServerClient()
    
    // Obtener datos del usuario de Supabase
    const { data: authUser } = await supabase.auth.admin.getUserById(userId)
    
    if (!authUser) {
      throw new Error('Usuario no encontrado en Supabase')
    }

    // Buscar empleado en Prisma
    const empleado = await prisma.empleado.findFirst({
      where: { user_id: userId }
    })

    if (!empleado) {
      // Si no existe el empleado, podríamos crearlo aquí
      console.log('Empleado no encontrado en Prisma para el usuario:', userId)
      return { synced: false, reason: 'Empleado no existe en Prisma' }
    }

    // Actualizar email si es diferente
    if (empleado.email !== authUser.user.email) {
      await prisma.empleado.update({
        where: { id: empleado.id },
        data: { email: authUser.user.email }
      })
    }

    return { synced: true, empleado }
  } catch (error) {
    console.error('Error syncing user data:', error)
    return { synced: false, error }
  }
}

/**
 * Ejecutar transacción que involucra tanto Prisma como Supabase
 */
export async function executeHybridTransaction<T>(
  prismaOperations: (prisma: typeof import('@/lib/prisma').prisma) => Promise<T>,
  supabaseOperations?: (supabase: any) => Promise<void>
) {
  try {
    // Ejecutar operaciones de Prisma en transacción
    const result = await prisma.$transaction(async (tx) => {
      return await prismaOperations(tx)
    })

    // Si hay operaciones de Supabase, ejecutarlas después
    if (supabaseOperations) {
      const supabase = getSupabaseBrowserClient()
      await supabaseOperations(supabase)
    }

    return { success: true, result }
  } catch (error) {
    console.error('Error in hybrid transaction:', error)
    return { success: false, error }
  }
}

/**
 * Obtener configuración de conexión actual
 */
export function getConnectionInfo() {
  return {
    prisma: {
      connected: !!prisma,
      databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Not configured'
    },
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Not configured',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured' : 'Not configured'
    }
  }
}

/**
 * Tipo helper para operaciones híbridas
 */
export type HybridOperationResult<T> = {
  success: boolean
  data?: T
  error?: any
  source: 'prisma' | 'supabase' | 'hybrid'
}

/**
 * Wrapper para operaciones que pueden fallar y necesitan fallback
 */
export async function withFallback<T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation: () => Promise<T>,
  operationName: string
): Promise<HybridOperationResult<T>> {
  try {
    const result = await primaryOperation()
    return {
      success: true,
      data: result,
      source: 'prisma'
    }
  } catch (primaryError) {
    console.warn(`Primary operation failed for ${operationName}, trying fallback:`, primaryError)
    
    try {
      const fallbackResult = await fallbackOperation()
      return {
        success: true,
        data: fallbackResult,
        source: 'supabase'
      }
    } catch (fallbackError) {
      console.error(`Both operations failed for ${operationName}:`, {
        primaryError,
        fallbackError
      })
      
      return {
        success: false,
        error: { primaryError, fallbackError },
        source: 'hybrid'
      }
    }
  }
}