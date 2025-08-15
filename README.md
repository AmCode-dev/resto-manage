# RestoManage - Sistema de Gestión de Restaurantes

*Plataforma completa para la gestión de restaurantes con integración híbrida Supabase + Prisma ORM*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/info-amcodecomas-projects/v0-resto-manage-platform)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/KO9gIRFo2SQ)

## 🚀 Características Principales

- **Gestión completa de restaurantes**: Menús, inventario, empleados, pedidos y más
- **Arquitectura híbrida**: Supabase para autenticación y tiempo real + Prisma ORM para operaciones de base de datos
- **TypeScript**: Tipado completo y seguridad en el desarrollo
- **Real-time**: Actualizaciones en tiempo real usando Supabase subscriptions
- **Responsive**: Diseño adaptable para móviles y escritorio

## 🏗️ Arquitectura Tecnológica

### Frontend
- **Next.js 14** - Framework de React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Radix UI** - Componentes accesibles
- **React Hook Form** - Gestión de formularios

### Backend & Base de Datos
- **Supabase** - BaaS para autenticación, storage y real-time
- **Prisma ORM** - ORM moderno para PostgreSQL con tipado completo
- **PostgreSQL** - Base de datos principal (hospedada en Supabase)

### Integración Híbrida
- **Supabase**: Autenticación, storage, subscripciones en tiempo real
- **Prisma**: Operaciones CRUD, consultas complejas, migraciones, tipado TypeScript

## 📦 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/AmCode-dev/resto-manage.git
cd resto-manage
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear un archivo `.env` basado en `.env.example`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="tu-url-de-supabase"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-clave-anonima-de-supabase"

# Database Configuration for Prisma
# Usar la URL de conexión directa de PostgreSQL de Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?schema=public"
```

### 4. Configurar Prisma

#### Generar el esquema desde la base de datos existente:
```bash
npm run prisma:pull
```

#### Generar el cliente de Prisma:
```bash
npm run prisma:generate
```

#### (Opcional) Explorar la base de datos con Prisma Studio:
```bash
npm run prisma:studio
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

## 🛠️ Scripts Disponibles

### Desarrollo
- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Iniciar servidor de producción
- `npm run lint` - Ejecutar linter

### Prisma
- `npm run prisma:generate` - Generar cliente de Prisma
- `npm run prisma:studio` - Abrir Prisma Studio
- `npm run prisma:push` - Sincronizar esquema con BD (desarrollo)
- `npm run prisma:pull` - Generar esquema desde BD existente
- `npm run prisma:migrate` - Crear y aplicar migraciones
- `npm run prisma:reset` - Resetear base de datos

## 🔧 Uso de la Arquitectura Híbrida

### Patrón de Implementación

#### 1. Servicios (Prisma para CRUD)
```typescript
// lib/services/menu-service.ts
import { prisma } from '@/lib/prisma'

export class MenuService {
  async getMenusByRestaurant(restauranteId: string) {
    return await prisma.menu.findMany({
      where: { restaurante_id: restauranteId },
      orderBy: { titulo: 'asc' }
    })
  }
  
  async createMenu(restauranteId: string, menuData: MenuInput) {
    return await prisma.menu.create({
      data: { ...menuData, restaurante_id: restauranteId }
    })
  }
}
```

#### 2. Hooks Híbridos (Prisma + Supabase)
```typescript
// hooks/use-menus-hybrid.tsx
import { menuService } from '@/lib/services/menu-service'
import { getSupabaseClient } from '@/lib/supabase-client'

export function useMenusHybrid(restauranteId: string) {
  // Usar Prisma para operaciones CRUD
  const loadMenus = async () => {
    const menus = await menuService.getMenusByRestaurant(restauranteId)
    setMenus(menus)
  }
  
  // Usar Supabase para real-time subscriptions
  useEffect(() => {
    const subscription = supabase
      .channel('menu_changes')
      .on('broadcast', { event: 'menu_updated' }, () => {
        loadMenus() // Recargar cuando hay cambios
      })
      .subscribe()
      
    return () => subscription.unsubscribe()
  }, [])
}
```

### Cuándo usar cada tecnología

#### Usar Prisma para:
- ✅ Operaciones CRUD complejas
- ✅ Consultas con joins y agregaciones
- ✅ Migraciones de esquema
- ✅ Tipado TypeScript automático
- ✅ Transacciones de base de datos

#### Usar Supabase para:
- ✅ Autenticación de usuarios
- ✅ Subscripciones en tiempo real
- ✅ Storage de archivos
- ✅ Row Level Security (RLS)
- ✅ Funciones Edge

## 📊 Estructura de la Base de Datos

### Tablas Principales
- `restaurantes` - Información de restaurantes
- `empleados` - Gestión de empleados
- `menus` - Menús y platos
- `inventario_comidas` - Inventario de comidas
- `inventario_bebidas` - Inventario de bebidas
- `pedidos` - Gestión de pedidos
- `cajas` - Control de cajas
- `transacciones` - Registro de transacciones
- `secciones_sistema` - Secciones del sistema
- `permisos_empleados` - Permisos por empleado

### Relaciones
```prisma
model Restaurante {
  empleados             Empleado[]
  menus                 Menu[]
  inventario_comidas    InventarioComida[]
  // ... más relaciones
}

model Empleado {
  restaurante           Restaurante @relation(fields: [restaurante_id], references: [id])
  permisos              PermisoEmpleado[]
}
```

## 🔐 Autenticación y Permisos

La autenticación se maneja completamente con Supabase:

```typescript
// hooks/use-auth.tsx
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
```

Los permisos se gestionan a nivel de base de datos usando Prisma:

```typescript
// Verificar permisos con Prisma
const empleado = await prisma.empleado.findFirst({
  where: { user_id: userId },
  include: { permisos: true }
})
```

## 🌐 Deployment

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Variables de Entorno en Producción
```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-publica
DATABASE_URL=postgresql://user:pass@host:port/db
```

## 🚧 Migración Gradual

Si tienes código existente que usa solo Supabase, puedes migrar gradualmente:

### 1. Mantener código existente
```typescript
// Código existente sigue funcionando
const { data } = await supabase.from('menus').select('*')
```

### 2. Introducir servicios Prisma
```typescript
// Nuevo código usa servicios híbridos
const menus = await menuService.getMenusByRestaurant(restauranteId)
```

### 3. Migrar gradualmente
- Empieza con nuevas funcionalidades
- Migra hooks existentes cuando sea conveniente
- Mantén compatibilidad durante la transición

## 📚 Recursos y Documentación

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript](https://www.typescriptlang.org/docs/)

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request
