# Sistema de Autenticación Mejorado - RestoManage

## Resumen de Cambios

El sistema de autenticación ha sido completamente reescrito para eliminar dependencias de datos mock y implementar una autenticación real basada en la relación usuario-empleado-restaurante.

## Características Principales

### 1. Eliminación de Datos Mock
- ❌ Removido `empleadoMock` de `use-auth.tsx`
- ❌ Removido botón de "Acceso de Desarrollo" 
- ✅ Todo el sistema ahora usa datos reales de la base de datos

### 2. Autenticación Inteligente por Email
- **Detección de similitud de email**: Compara automáticamente el email del usuario con el email del restaurante
- **Asignación automática de permisos**: Otorga permisos de administrador si hay similitud alta de dominio
- **Sugerencias de cargo**: Analiza el email para sugerir el cargo apropiado

### 3. Gestión Automática de Empleados
- **Auto-asociación**: Si existe un empleado con el mismo email, se asocia automáticamente
- **Auto-creación**: Si no existe empleado pero hay restaurante con dominio similar, se crea automáticamente
- **Búsqueda inteligente**: Busca restaurantes por similitud de dominio

### 4. Sistema de Permisos Dinámico
- **Basado en cargo**: Calcula permisos según el cargo del empleado
- **Similitud de email**: Otorga permisos elevados por similitud de dominio
- **Tabla de permisos**: Integración con `permisos_empleados` para permisos granulares

## Archivos Principales

### `lib/auth-utils.ts`
Utilidades para lógica de autenticación:
- `detectEmailSimilarity()`: Detecta similitud entre emails
- `calculatePermissionsByCargo()`: Calcula permisos por cargo
- `shouldGrantAdminPermissions()`: Determina si otorgar permisos de admin
- `suggestCargoFromEmail()`: Sugiere cargo basado en email

### `lib/database-service.ts`
Operaciones de base de datos para empleados:
- `findEmpleadoByUserId()`: Busca empleado por ID de usuario
- `findEmpleadosByEmail()`: Busca empleados por email
- `createEmpleadoForUser()`: Crea empleado para usuario nuevo
- `associateUserWithEmpleado()`: Asocia usuario con empleado existente
- `findPotentialRestaurantsForEmail()`: Busca restaurantes por dominio

### `hooks/use-auth.tsx`
Hook principal de autenticación (actualizado):
- Función `fetchEmpleado()` completamente reescrita
- Eliminación completa de datos mock
- Integración con servicios de base de datos
- Mejor manejo de errores

### `app/register/page.tsx`
Página de registro mejorada:
- Campos adicionales: nombre, cargo, teléfono
- Sugerencia automática de cargo basada en email
- Mejor experiencia de usuario
- Mensajes informativos sobre el proceso

## Flujo de Autenticación

### Registro de Usuario
1. Usuario completa formulario con email, contraseña, nombre, cargo (opcional)
2. Se crea cuenta en Supabase Auth
3. Se envía email de confirmación
4. Al confirmar email, se ejecuta el flujo de empleado

### Proceso de Empleado (Login/Confirmación)
1. **Buscar empleado existente** por `user_id`
2. Si no existe, **buscar empleado por email**
3. Si encuentra empleado, **asociar** con usuario
4. Si no encuentra, **buscar restaurantes** con dominio similar
5. Si encuentra restaurante, **crear empleado** automáticamente
6. **Calcular permisos** basado en cargo y similitud de email

### Cálculo de Permisos
1. **Email similarity check**: ¿El email del usuario es similar al del restaurante?
2. **Cargo analysis**: ¿Qué permisos corresponden al cargo?
3. **Admin promotion**: ¿Debe otorgarse permisos de administrador?
4. **Database permissions**: Crear entradas en `permisos_empleados`

## Ejemplos de Funcionamiento

### Caso 1: Propietario del Restaurante
- Email usuario: `owner@restaurant.com`
- Email restaurante: `contact@restaurant.com`
- Resultado: **Admin completo** (similitud alta de dominio)

### Caso 2: Empleado Existente
- Email usuario: `chef@restaurant.com`
- Empleado existente en BD con mismo email
- Resultado: **Asociación automática** con permisos según cargo

### Caso 3: Nuevo Empleado
- Email usuario: `newstaff@restaurant.com`
- No hay empleado, pero existe restaurante con dominio `restaurant.com`
- Resultado: **Creación automática** de empleado con permisos inteligentes

### Caso 4: Usuario Externo
- Email usuario: `john@external.com`
- No hay empleado ni restaurante con dominio similar
- Resultado: **Sin acceso** hasta ser agregado manualmente

## Ventajas del Nuevo Sistema

1. **Eliminación de datos mock**: Sistema 100% real
2. **Onboarding automático**: Los usuarios se asocian/crean automáticamente
3. **Permisos inteligentes**: Asignación automática basada en contexto
4. **Seguridad mejorada**: Solo usuarios legítimos acceden
5. **Experiencia fluida**: Mínima intervención manual requerida
6. **Escalabilidad**: Funciona para múltiples restaurantes
7. **Flexibilidad**: Sistema de permisos granular

## Migración y Compatibilidad

- **Usuarios existentes**: Mantendrán su acceso actual
- **Empleados existentes**: Se asociarán automáticamente en próximo login
- **Permisos existentes**: Se respetan y complementan con nueva lógica
- **Base de datos**: No requiere cambios de schema

## Configuración Requerida

1. **Variables de entorno** de Supabase configuradas
2. **Emails de restaurantes** configurados en BD
3. **Secciones del sistema** creadas en `secciones_sistema`
4. **RLS policies** habilitadas en Supabase

El sistema está diseñado para ser robusto, seguro y proporcionar una experiencia de usuario fluida mientras mantiene la seguridad y los permisos apropiados.