export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      empleados: {
        Row: {
          id: string
          nombre: string
          cargo: "Dueño" | "Administrador" | "Gerente" | "Mesero" | "Cocinero" | "Bartender" | "Cajero" | "Limpieza"
          contacto: string
          estado: "activo" | "inactivo" | "vacaciones"
          horario: string | null
          restaurante_id: string
          user_id: string | null
          fecha_ingreso: string | null
          salario: number | null
          notas: string | null
          es_admin_principal: boolean | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          cargo?: "Dueño" | "Administrador" | "Gerente" | "Mesero" | "Cocinero" | "Bartender" | "Cajero" | "Limpieza"
          contacto: string
          estado?: "activo" | "inactivo" | "vacaciones"
          horario?: string | null
          restaurante_id: string
          user_id?: string | null
          fecha_ingreso?: string | null
          salario?: number | null
          notas?: string | null
          es_admin_principal?: boolean | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          cargo?: "Dueño" | "Administrador" | "Gerente" | "Mesero" | "Cocinero" | "Bartender" | "Cajero" | "Limpieza"
          contacto?: string
          estado?: "activo" | "inactivo" | "vacaciones"
          horario?: string | null
          restaurante_id?: string
          user_id?: string | null
          fecha_ingreso?: string | null
          salario?: number | null
          notas?: string | null
          es_admin_principal?: boolean | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      restaurantes: {
        Row: {
          id: string
          user_id: string
          nombre: string
          descripcion: string | null
          logo_url: string | null
          dueno_nombre: string
          dueno_apellido: string
          dueno_email: string
          dueno_telefono: string | null
          dueno_dni: string | null
          cuit: string
          razon_social: string
          condicion_fiscal: string | null
          direccion: string
          ciudad: string
          provincia: string
          codigo_postal: string | null
          pais: string | null
          latitud: number | null
          longitud: number | null
          capacidad_total: number | null
          numero_mesas: number | null
          horario_apertura: string | null
          horario_cierre: string | null
          dias_operacion: string[] | null
          moneda: string | null
          zona_horaria: string | null
          idioma: string | null
          telefono_restaurante: string | null
          email_restaurante: string | null
          sitio_web: string | null
          redes_sociales: Json | null
          activo: boolean | null
          fecha_apertura: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nombre: string
          descripcion?: string | null
          logo_url?: string | null
          dueno_nombre: string
          dueno_apellido: string
          dueno_email: string
          dueno_telefono?: string | null
          dueno_dni?: string | null
          cuit: string
          razon_social: string
          condicion_fiscal?: string | null
          direccion: string
          ciudad: string
          provincia: string
          codigo_postal?: string | null
          pais?: string | null
          latitud?: number | null
          longitud?: number | null
          capacidad_total?: number | null
          numero_mesas?: number | null
          horario_apertura?: string | null
          horario_cierre?: string | null
          dias_operacion?: string[] | null
          moneda?: string | null
          zona_horaria?: string | null
          idioma?: string | null
          telefono_restaurante?: string | null
          email_restaurante?: string | null
          sitio_web?: string | null
          redes_sociales?: Json | null
          activo?: boolean | null
          fecha_apertura?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nombre?: string
          descripcion?: string | null
          logo_url?: string | null
          dueno_nombre?: string
          dueno_apellido?: string
          dueno_email?: string
          dueno_telefono?: string | null
          dueno_dni?: string | null
          cuit?: string
          razon_social?: string
          condicion_fiscal?: string | null
          direccion?: string
          ciudad?: string
          provincia?: string
          codigo_postal?: string | null
          pais?: string | null
          latitud?: number | null
          longitud?: number | null
          capacidad_total?: number | null
          numero_mesas?: number | null
          horario_apertura?: string | null
          horario_cierre?: string | null
          dias_operacion?: string[] | null
          moneda?: string | null
          zona_horaria?: string | null
          idioma?: string | null
          telefono_restaurante?: string | null
          email_restaurante?: string | null
          sitio_web?: string | null
          redes_sociales?: Json | null
          activo?: boolean | null
          fecha_apertura?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      menus: {
        Row: {
          id: string
          restaurante_id: string
          titulo: string
          descripcion: string | null
          ingredientes: string | null
          precio: number
          categoria: string
          stock: number | null
          imagen_url: string | null
          disponible: boolean | null
          orden_menu: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurante_id: string
          titulo: string
          descripcion?: string | null
          ingredientes?: string | null
          precio: number
          categoria: string
          stock?: number | null
          imagen_url?: string | null
          disponible?: boolean | null
          orden_menu?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurante_id?: string
          titulo?: string
          descripcion?: string | null
          ingredientes?: string | null
          precio?: number
          categoria?: string
          stock?: number | null
          imagen_url?: string | null
          disponible?: boolean | null
          orden_menu?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      inventario_comidas: {
        Row: {
          id: string
          restaurante_id: string
          nombre: string
          categoria: string
          stock: number
          unidad: string
          precio_unidad: number
          fecha_caducidad: string | null
          estado: "normal" | "bajo" | "agotado" | "vencido"
          codigo_barras: string | null
          alerta_stock: number | null
          proveedor: string | null
          descripcion: string | null
          ubicacion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurante_id: string
          nombre: string
          categoria: string
          stock?: number
          unidad: string
          precio_unidad: number
          fecha_caducidad?: string | null
          estado?: "normal" | "bajo" | "agotado" | "vencido"
          codigo_barras?: string | null
          alerta_stock?: number | null
          proveedor?: string | null
          descripcion?: string | null
          ubicacion?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurante_id?: string
          nombre?: string
          categoria?: string
          stock?: number
          unidad?: string
          precio_unidad?: number
          fecha_caducidad?: string | null
          estado?: "normal" | "bajo" | "agotado" | "vencido"
          codigo_barras?: string | null
          alerta_stock?: number | null
          proveedor?: string | null
          descripcion?: string | null
          ubicacion?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inventario_bebidas: {
        Row: {
          id: string
          restaurante_id: string
          nombre: string
          categoria: string
          stock: number
          unidad: string
          precio_unidad: number
          fecha_caducidad: string | null
          estado: "normal" | "bajo" | "agotado" | "vencido"
          codigo_barras: string | null
          alerta_stock: number | null
          proveedor: string | null
          descripcion: string | null
          graduacion_alcoholica: number | null
          volumen: number | null
          ubicacion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurante_id: string
          nombre: string
          categoria: string
          stock?: number
          unidad: string
          precio_unidad: number
          fecha_caducidad?: string | null
          estado?: "normal" | "bajo" | "agotado" | "vencido"
          codigo_barras?: string | null
          alerta_stock?: number | null
          proveedor?: string | null
          descripcion?: string | null
          graduacion_alcoholica?: number | null
          volumen?: number | null
          ubicacion?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurante_id?: string
          nombre?: string
          categoria?: string
          stock?: number
          unidad?: string
          precio_unidad?: number
          fecha_caducidad?: string | null
          estado?: "normal" | "bajo" | "agotado" | "vencido"
          codigo_barras?: string | null
          alerta_stock?: number | null
          proveedor?: string | null
          descripcion?: string | null
          graduacion_alcoholica?: number | null
          volumen?: number | null
          ubicacion?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cajas: {
        Row: {
          id: string
          restaurante_id: string
          empleado_id: string
          fecha_apertura: string
          hora_apertura: string
          caja_inicial: number
          fecha_cierre: string | null
          hora_cierre: string | null
          caja_final: number | null
          efectivo_esperado: number
          tarjeta_esperado: number
          otros_esperado: number
          efectivo_real: number | null
          tarjeta_real: number | null
          otros_real: number | null
          diferencia: number | null
          total_ventas: number
          total_pedidos: number
          total_personas: number
          estado: "abierto" | "cerrado"
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurante_id: string
          empleado_id: string
          fecha_apertura?: string
          hora_apertura?: string
          caja_inicial: number
          fecha_cierre?: string | null
          hora_cierre?: string | null
          caja_final?: number | null
          efectivo_esperado?: number
          tarjeta_esperado?: number
          otros_esperado?: number
          efectivo_real?: number | null
          tarjeta_real?: number | null
          otros_real?: number | null
          diferencia?: number | null
          total_ventas?: number
          total_pedidos?: number
          total_personas?: number
          estado?: "abierto" | "cerrado"
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurante_id?: string
          empleado_id?: string
          fecha_apertura?: string
          hora_apertura?: string
          caja_inicial?: number
          fecha_cierre?: string | null
          hora_cierre?: string | null
          caja_final?: number | null
          efectivo_esperado?: number
          tarjeta_esperado?: number
          otros_esperado?: number
          efectivo_real?: number | null
          tarjeta_real?: number | null
          otros_real?: number | null
          diferencia?: number | null
          total_ventas?: number
          total_pedidos?: number
          total_personas?: number
          estado?: "abierto" | "cerrado"
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pedidos: {
        Row: {
          id: string
          restaurante_id: string
          caja_id: string
          numero_pedido: number
          mesa: number
          personas: number
          items: Json
          subtotal: number
          descuentos: number
          impuestos: number
          total: number
          estado: "abierto" | "pagado" | "cancelado"
          fecha: string
          hora: string
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurante_id: string
          caja_id: string
          numero_pedido?: number
          mesa: number
          personas?: number
          items: Json
          subtotal: number
          descuentos?: number
          impuestos?: number
          total: number
          estado?: "abierto" | "pagado" | "cancelado"
          fecha?: string
          hora?: string
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurante_id?: string
          caja_id?: string
          numero_pedido?: number
          mesa?: number
          personas?: number
          items?: Json
          subtotal?: number
          descuentos?: number
          impuestos?: number
          total?: number
          estado?: "abierto" | "pagado" | "cancelado"
          fecha?: string
          hora?: string
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transacciones: {
        Row: {
          id: string
          restaurante_id: string
          pedido_id: string
          caja_id: string
          metodo_pago: "efectivo" | "tarjeta" | "transferencia" | "otro"
          monto: number
          referencia: string | null
          notas: string | null
          fecha: string
          hora: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurante_id: string
          pedido_id: string
          caja_id: string
          metodo_pago: "efectivo" | "tarjeta" | "transferencia" | "otro"
          monto: number
          referencia?: string | null
          notas?: string | null
          fecha?: string
          hora?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurante_id?: string
          pedido_id?: string
          caja_id?: string
          metodo_pago?: "efectivo" | "tarjeta" | "transferencia" | "otro"
          monto?: number
          referencia?: string | null
          notas?: string | null
          fecha?: string
          hora?: string
          created_at?: string
          updated_at?: string
        }
      }
      permisos_empleados: {
        Row: {
          id: string
          empleado_id: string
          seccion_id: string
          puede_ver: boolean
          puede_crear: boolean
          puede_editar: boolean
          puede_eliminar: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empleado_id: string
          seccion_id: string
          puede_ver?: boolean
          puede_crear?: boolean
          puede_editar?: boolean
          puede_eliminar?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          empleado_id?: string
          seccion_id?: string
          puede_ver?: boolean
          puede_crear?: boolean
          puede_editar?: boolean
          puede_eliminar?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      secciones_sistema: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          icono: string | null
          activa: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nombre: string
          descripcion?: string | null
          icono?: string | null
          activa?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          icono?: string | null
          activa?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos de conveniencia
export type Empleado = Database["public"]["Tables"]["empleados"]["Row"]
export type EmpleadoInsert = Database["public"]["Tables"]["empleados"]["Insert"]
export type EmpleadoUpdate = Database["public"]["Tables"]["empleados"]["Update"]

export type Restaurante = Database["public"]["Tables"]["restaurantes"]["Row"]
export type RestauranteInsert = Database["public"]["Tables"]["restaurantes"]["Insert"]
export type RestauranteUpdate = Database["public"]["Tables"]["restaurantes"]["Update"]

export type Menu = Database["public"]["Tables"]["menus"]["Row"]
export type MenuInsert = Database["public"]["Tables"]["menus"]["Insert"]
export type MenuUpdate = Database["public"]["Tables"]["menus"]["Update"]

export type InventarioComida = Database["public"]["Tables"]["inventario_comidas"]["Row"]
export type InventarioComidaInsert = Database["public"]["Tables"]["inventario_comidas"]["Insert"]
export type InventarioComidaUpdate = Database["public"]["Tables"]["inventario_comidas"]["Update"]

export type InventarioBebida = Database["public"]["Tables"]["inventario_bebidas"]["Row"]
export type InventarioBebidaInsert = Database["public"]["Tables"]["inventario_bebidas"]["Insert"]
export type InventarioBebidaUpdate = Database["public"]["Tables"]["inventario_bebidas"]["Update"]

export type Caja = Database["public"]["Tables"]["cajas"]["Row"]
export type CajaInsert = Database["public"]["Tables"]["cajas"]["Insert"]
export type CajaUpdate = Database["public"]["Tables"]["cajas"]["Update"]

export type Pedido = Database["public"]["Tables"]["pedidos"]["Row"]
export type PedidoInsert = Database["public"]["Tables"]["pedidos"]["Insert"]
export type PedidoUpdate = Database["public"]["Tables"]["pedidos"]["Update"]

export type Transaccion = Database["public"]["Tables"]["transacciones"]["Row"]
export type TransaccionInsert = Database["public"]["Tables"]["transacciones"]["Insert"]
export type TransaccionUpdate = Database["public"]["Tables"]["transacciones"]["Update"]

export type PermisoEmpleado = Database["public"]["Tables"]["permisos_empleados"]["Row"]
export type PermisoEmpleadoInsert = Database["public"]["Tables"]["permisos_empleados"]["Insert"]
export type PermisoEmpleadoUpdate = Database["public"]["Tables"]["permisos_empleados"]["Update"]

export type SeccionSistema = Database["public"]["Tables"]["secciones_sistema"]["Row"]

// Tipos adicionales para el POS
export interface ItemPedido {
  id: string
  nombre: string
  precio: number
  cantidad: number
  categoria?: string
  notas?: string
}

export interface ResumenCaja {
  caja: Caja
  empleado: Empleado
  pedidos: Pedido[]
  transacciones: Transaccion[]
}
