/**
 * Servicio de base de datos para operaciones de empleados y restaurantes
 * Maneja la lógica de negocio para autenticación y permisos
 */

import { supabase } from "@/lib/supabase-client"
import { calculatePermissionsByCargo, shouldGrantAdminPermissions, suggestCargoFromEmail } from "./auth-utils"
import type { Empleado } from "@/hooks/use-auth"

export interface EmpleadoData {
  id: string
  nombre: string
  email: string
  cargo: string
  telefono?: string
  fecha_contratacion: string
  salario?: number
  activo: boolean
  restaurante_id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface RestauranteData {
  id: string
  nombre: string
  email_restaurante?: string
  dueno_email: string
  user_id: string
  activo: boolean
}

export interface CreateEmpleadoInput {
  nombre: string
  email: string
  cargo?: string
  telefono?: string
  salario?: number
  restaurante_id: string
  user_id: string
}

/**
 * Busca un empleado por user_id con datos completos de restaurante
 */
export async function findEmpleadoByUserId(userId: string): Promise<{
  empleado: Empleado | null
  restaurante: RestauranteData | null
  error?: string
}> {
  try {
    // Buscar empleado con información del restaurante
    const { data: empleadoData, error: empleadoError } = await supabase
      .from('empleados')
      .select(`
        *,
        restaurante:restaurantes(
          id,
          nombre,
          email_restaurante,
          dueno_email,
          user_id,
          activo
        )
      `)
      .eq('user_id', userId)
      .eq('estado', 'Activo')
      .maybeSingle()

    if (empleadoError) {
      console.error('Error fetching empleado:', empleadoError)
      return { empleado: null, restaurante: null, error: empleadoError.message }
    }

    if (!empleadoData) {
      return { empleado: null, restaurante: null }
    }

    // Obtener permisos del empleado desde la base de datos
    const { data: permisosData } = await supabase
      .from('permisos_empleados')
      .select(`
        seccion_id,
        ver,
        editar,
        seccion:secciones_sistema(id, nombre)
      `)
      .eq('empleado_id', empleadoData.id)

    // Convertir permisos de BD al formato esperado
    const permisos = convertPermisosFromDB(permisosData || [], empleadoData.cargo, empleadoData.email, empleadoData.restaurante?.email_restaurante || empleadoData.restaurante?.dueno_email)

    const empleado: Empleado = {
      id: empleadoData.id,
      nombre: empleadoData.nombre,
      email: empleadoData.email,
      cargo: empleadoData.cargo,
      telefono: empleadoData.contacto,
      fecha_contratacion: empleadoData.created_at,
      salario: empleadoData.salario,
      activo: empleadoData.estado === 'Activo',
      permisos,
      restaurante_id: empleadoData.restaurante_id,
      user_id: empleadoData.user_id,
      created_at: empleadoData.created_at,
      updated_at: empleadoData.updated_at
    }

    return {
      empleado,
      restaurante: empleadoData.restaurante as RestauranteData,
      error: undefined
    }

  } catch (error) {
    console.error('Error in findEmpleadoByUserId:', error)
    return { 
      empleado: null, 
      restaurante: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Busca empleados existentes por email
 */
export async function findEmpleadosByEmail(email: string): Promise<{
  empleados: EmpleadoData[]
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('email', email)
      .eq('estado', 'Activo')

    if (error) {
      console.error('Error finding empleados by email:', error)
      return { empleados: [], error: error.message }
    }

    return { empleados: data || [] }

  } catch (error) {
    console.error('Error in findEmpleadosByEmail:', error)
    return { 
      empleados: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Crea un nuevo empleado para un usuario registrado
 */
export async function createEmpleadoForUser(input: CreateEmpleadoInput): Promise<{
  empleado: Empleado | null
  error?: string
}> {
  try {
    // Obtener información del restaurante para determinar permisos
    const { data: restauranteData } = await supabase
      .from('restaurantes')
      .select('email_restaurante, dueno_email')
      .eq('id', input.restaurante_id)
      .single()

    const restaurantEmail = restauranteData?.email_restaurante || restauranteData?.dueno_email

    // Determinar cargo si no se proporciona
    const cargo = input.cargo || suggestCargoFromEmail(input.email, restaurantEmail)

    // Crear empleado en la base de datos
    const { data: empleadoData, error: createError } = await supabase
      .from('empleados')
      .insert({
        nombre: input.nombre,
        email: input.email,
        cargo,
        contacto: input.telefono || input.email,
        salario: input.salario,
        restaurante_id: input.restaurante_id,
        user_id: input.user_id,
        estado: 'Activo'
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating empleado:', createError)
      return { empleado: null, error: createError.message }
    }

    // Determinar permisos inteligentes
    const permissionResult = shouldGrantAdminPermissions(input.email, restaurantEmail || '', cargo)
    
    // Crear permisos en la base de datos
    await createPermisosForEmpleado(empleadoData.id, permissionResult.permissions)

    const empleado: Empleado = {
      id: empleadoData.id,
      nombre: empleadoData.nombre,
      email: empleadoData.email,
      cargo: empleadoData.cargo,
      telefono: empleadoData.contacto,
      fecha_contratacion: empleadoData.created_at,
      salario: empleadoData.salario,
      activo: true,
      permisos: permissionResult.permissions,
      restaurante_id: empleadoData.restaurante_id,
      user_id: empleadoData.user_id,
      created_at: empleadoData.created_at,
      updated_at: empleadoData.updated_at
    }

    console.log(`Created empleado with ${permissionResult.reason}`)

    return { empleado }

  } catch (error) {
    console.error('Error in createEmpleadoForUser:', error)
    return { 
      empleado: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Asocia un usuario existente con un empleado existente
 */
export async function associateUserWithEmpleado(userId: string, empleadoId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('empleados')
      .update({ user_id: userId })
      .eq('id', empleadoId)

    if (error) {
      console.error('Error associating user with empleado:', error)
      return { success: false, error: error.message }
    }

    return { success: true }

  } catch (error) {
    console.error('Error in associateUserWithEmpleado:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Busca restaurantes donde el usuario podría ser empleado
 */
export async function findPotentialRestaurantsForEmail(email: string): Promise<{
  restaurantes: RestauranteData[]
  error?: string
}> {
  try {
    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain) {
      return { restaurantes: [] }
    }

    // Buscar restaurantes con emails similares
    const { data, error } = await supabase
      .from('restaurantes')
      .select('id, nombre, email_restaurante, dueno_email, user_id, activo')
      .eq('activo', true)

    if (error) {
      console.error('Error finding potential restaurants:', error)
      return { restaurantes: [], error: error.message }
    }

    // Filtrar restaurantes con dominios similares
    const potentialRestaurants = (data || []).filter(restaurant => {
      const restaurantEmail = restaurant.email_restaurante || restaurant.dueno_email
      if (!restaurantEmail) return false
      
      const restaurantDomain = restaurantEmail.split('@')[1]?.toLowerCase()
      return restaurantDomain === domain
    })

    return { restaurantes: potentialRestaurants }

  } catch (error) {
    console.error('Error in findPotentialRestaurantsForEmail:', error)
    return { 
      restaurantes: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Convierte permisos de la base de datos al formato esperado por la aplicación
 */
function convertPermisosFromDB(
  permisosDB: any[], 
  cargo: string, 
  empleadoEmail: string, 
  restaurantEmail?: string
): Empleado['permisos'] {
  // Si no hay permisos en BD, usar lógica basada en cargo y email
  if (!permisosDB || permisosDB.length === 0) {
    const result = shouldGrantAdminPermissions(empleadoEmail, restaurantEmail || '', cargo)
    return result.permissions
  }

  // Convertir permisos de BD al formato de la aplicación
  const permisos: Empleado['permisos'] = {
    pos: false,
    inventario: false,
    empleados: false,
    reportes: false,
    configuracion: false,
    reservas: false,
    menus: false,
  }

  // Mapear secciones de BD a permisos de aplicación
  const sectionMapping: Record<string, keyof Empleado['permisos']> = {
    'pos': 'pos',
    'punto_venta': 'pos',
    'inventario': 'inventario',
    'inventario_comidas': 'inventario',
    'inventario_bebidas': 'inventario',
    'empleados': 'empleados',
    'reportes': 'reportes',
    'finanzas': 'reportes',
    'configuracion': 'configuracion',
    'reservas': 'reservas',
    'menus': 'menus',
  }

  permisosDB.forEach(permiso => {
    const appPermission = sectionMapping[permiso.seccion_id]
    if (appPermission && (permiso.ver || permiso.editar)) {
      permisos[appPermission] = true
    }
  })

  return permisos
}

/**
 * Crea permisos en la base de datos para un empleado
 */
async function createPermisosForEmpleado(empleadoId: string, permisos: Empleado['permisos']): Promise<void> {
  try {
    // Mapear permisos de aplicación a secciones de BD
    const permissionMapping: Array<{seccion: string, permission: keyof Empleado['permisos']}> = [
      { seccion: 'pos', permission: 'pos' },
      { seccion: 'inventario', permission: 'inventario' },
      { seccion: 'empleados', permission: 'empleados' },
      { seccion: 'reportes', permission: 'reportes' },
      { seccion: 'configuracion', permission: 'configuracion' },
      { seccion: 'reservas', permission: 'reservas' },
      { seccion: 'menus', permission: 'menus' },
    ]

    const permisosToInsert = permissionMapping
      .filter(mapping => permisos[mapping.permission])
      .map(mapping => ({
        empleado_id: empleadoId,
        seccion_id: mapping.seccion,
        ver: true,
        editar: true
      }))

    if (permisosToInsert.length > 0) {
      const { error } = await supabase
        .from('permisos_empleados')
        .insert(permisosToInsert)

      if (error) {
        console.error('Error creating permissions:', error)
      }
    }

  } catch (error) {
    console.error('Error in createPermisosForEmpleado:', error)
  }
}