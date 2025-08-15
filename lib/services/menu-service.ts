/**
 * Servicio híbrido para gestión de menús
 * Usa Prisma para operaciones CRUD y Supabase para funcionalidades específicas como auth y real-time
 */

import { prisma } from '@/lib/prisma'
import { getSupabaseClient } from '@/lib/supabase-client'
import type { Menu } from '@prisma/client'

export interface MenuInput {
  titulo: string
  descripcion?: string
  ingredientes?: string
  precio: number
  categoria: string
  stock?: number
  imagen_url?: string
  disponible?: boolean
  orden_menu?: number
}

export interface MenuUpdate extends Partial<MenuInput> {}

export class MenuService {
  private supabase = getSupabaseClient()

  /**
   * Obtener todos los menús de un restaurante usando Prisma
   */
  async getMenusByRestaurant(restauranteId: string): Promise<Menu[]> {
    try {
      return await prisma.menu.findMany({
        where: {
          restaurante_id: restauranteId,
        },
        orderBy: [
          { orden_menu: 'asc' },
          { titulo: 'asc' }
        ]
      })
    } catch (error) {
      console.error('Error fetching menus with Prisma:', error)
      throw error
    }
  }

  /**
   * Crear un nuevo menú usando Prisma
   */
  async createMenu(restauranteId: string, menuData: MenuInput): Promise<Menu> {
    try {
      const newMenu = await prisma.menu.create({
        data: {
          ...menuData,
          precio: Number(menuData.precio),
          restaurante_id: restauranteId,
        }
      })

      // Opcional: Emitir evento en tiempo real usando Supabase
      // Esto mantiene la funcionalidad de real-time para otros clientes conectados
      await this.supabase.channel('menu_changes').send({
        type: 'broadcast',
        event: 'menu_created',
        payload: { menu: newMenu, restaurante_id: restauranteId }
      })

      return newMenu
    } catch (error) {
      console.error('Error creating menu with Prisma:', error)
      throw error
    }
  }

  /**
   * Actualizar un menú usando Prisma
   */
  async updateMenu(menuId: string, menuData: MenuUpdate): Promise<Menu> {
    try {
      const updatedMenu = await prisma.menu.update({
        where: { id: menuId },
        data: {
          ...menuData,
          ...(menuData.precio && { precio: Number(menuData.precio) }),
          updated_at: new Date(),
        }
      })

      // Opcional: Emitir evento en tiempo real
      await this.supabase.channel('menu_changes').send({
        type: 'broadcast',
        event: 'menu_updated',
        payload: { menu: updatedMenu }
      })

      return updatedMenu
    } catch (error) {
      console.error('Error updating menu with Prisma:', error)
      throw error
    }
  }

  /**
   * Eliminar un menú usando Prisma
   */
  async deleteMenu(menuId: string): Promise<void> {
    try {
      await prisma.menu.delete({
        where: { id: menuId }
      })

      // Opcional: Emitir evento en tiempo real
      await this.supabase.channel('menu_changes').send({
        type: 'broadcast',
        event: 'menu_deleted',
        payload: { menu_id: menuId }
      })
    } catch (error) {
      console.error('Error deleting menu with Prisma:', error)
      throw error
    }
  }

  /**
   * Buscar menús con filtros avanzados usando Prisma
   */
  async searchMenus(restauranteId: string, filters: {
    categoria?: string
    disponible?: boolean
    search?: string
    priceRange?: { min: number; max: number }
  }): Promise<Menu[]> {
    try {
      return await prisma.menu.findMany({
        where: {
          restaurante_id: restauranteId,
          ...(filters.categoria && { categoria: filters.categoria }),
          ...(filters.disponible !== undefined && { disponible: filters.disponible }),
          ...(filters.search && {
            OR: [
              { titulo: { contains: filters.search, mode: 'insensitive' } },
              { descripcion: { contains: filters.search, mode: 'insensitive' } },
              { ingredientes: { contains: filters.search, mode: 'insensitive' } }
            ]
          }),
          ...(filters.priceRange && {
            precio: {
              gte: filters.priceRange.min,
              lte: filters.priceRange.max
            }
          })
        },
        orderBy: [
          { orden_menu: 'asc' },
          { titulo: 'asc' }
        ]
      })
    } catch (error) {
      console.error('Error searching menus with Prisma:', error)
      throw error
    }
  }

  /**
   * Obtener estadísticas de menús usando Prisma
   */
  async getMenuStats(restauranteId: string) {
    try {
      const [totalMenus, menusByCategory, avgPrice] = await Promise.all([
        // Total de menús
        prisma.menu.count({
          where: { restaurante_id: restauranteId }
        }),
        
        // Menús por categoría
        prisma.menu.groupBy({
          by: ['categoria'],
          where: { restaurante_id: restauranteId },
          _count: {
            categoria: true
          }
        }),
        
        // Precio promedio
        prisma.menu.aggregate({
          where: { restaurante_id: restauranteId },
          _avg: {
            precio: true
          }
        })
      ])

      return {
        totalMenus,
        menusByCategory: menusByCategory.map(item => ({
          categoria: item.categoria,
          count: item._count.categoria
        })),
        averagePrice: avgPrice._avg.precio || 0
      }
    } catch (error) {
      console.error('Error getting menu stats with Prisma:', error)
      throw error
    }
  }

  /**
   * Suscribirse a cambios en tiempo real usando Supabase
   * Esta función mantiene la funcionalidad de real-time que solo Supabase puede proporcionar
   */
  subscribeToMenuChanges(restauranteId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel('menu_changes')
      .on('broadcast', { event: 'menu_created' }, callback)
      .on('broadcast', { event: 'menu_updated' }, callback)
      .on('broadcast', { event: 'menu_deleted' }, callback)
      .subscribe()
  }
}

// Exportar instancia singleton del servicio
export const menuService = new MenuService()