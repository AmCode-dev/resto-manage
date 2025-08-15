-- Crear tabla de secciones del sistema
CREATE TABLE IF NOT EXISTS public.secciones_sistema (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(100),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insertar secciones predeterminadas
INSERT INTO public.secciones_sistema (id, nombre, descripcion, icono, activa) VALUES
('dashboard', 'Dashboard', 'Panel principal con estadísticas', 'BarChart3', true),
('pedidos', 'Pedidos', 'Gestión de pedidos del restaurante', 'ShoppingCart', true),
('menus', 'Menús', 'Gestión del menú del restaurante', 'Menu', true),
('inventario-comidas', 'Inventario Comidas', 'Control de inventario de comidas', 'Package', true),
('inventario-bebidas', 'Inventario Bebidas', 'Control de inventario de bebidas', 'Coffee', true),
('empleados', 'Empleados', 'Gestión de empleados', 'Users', true),
('clientes', 'Clientes', 'Gestión de clientes', 'UserCheck', true),
('reservas', 'Reservas', 'Sistema de reservas', 'Calendar', true),
('pos', 'Punto de Venta', 'Sistema de punto de venta', 'CreditCard', true),
('espacio', 'Gestión de Espacio', 'Distribución de mesas y espacios', 'Layout', true),
('bartending', 'Bartending', 'Gestión de bar y cócteles', 'Wine', true),
('finanzas', 'Finanzas', 'Reportes financieros', 'DollarSign', true),
('notificaciones', 'Notificaciones', 'Centro de notificaciones', 'Bell', true),
('actividad', 'Registro de Actividad', 'Historial de actividades', 'Activity', true),
('configuracion', 'Configuración', 'Configuración del sistema', 'Settings', true)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    icono = EXCLUDED.icono,
    activa = EXCLUDED.activa,
    updated_at = TIMEZONE('utc'::text, NOW());

-- Crear tabla de empleados
CREATE TABLE IF NOT EXISTS public.empleados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cargo VARCHAR(255) NOT NULL CHECK (cargo IN ('Dueño', 'Administrador', 'Gerente', 'Mesero', 'Cocinero', 'Bartender', 'Cajero', 'Limpieza')),
    contacto VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'vacaciones')),
    horario TEXT,
    restaurante_id UUID NOT NULL REFERENCES public.restaurantes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fecha_ingreso DATE,
    salario DECIMAL(10,2),
    notas TEXT,
    es_admin_principal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de permisos de empleados
CREATE TABLE IF NOT EXISTS public.permisos_empleados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empleado_id UUID NOT NULL REFERENCES public.empleados(id) ON DELETE CASCADE,
    seccion_id VARCHAR(50) NOT NULL REFERENCES public.secciones_sistema(id) ON DELETE CASCADE,
    puede_ver BOOLEAN DEFAULT false,
    puede_crear BOOLEAN DEFAULT false,
    puede_editar BOOLEAN DEFAULT false,
    puede_eliminar BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(empleado_id, seccion_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_empleados_restaurante_id ON public.empleados(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_empleados_estado ON public.empleados(estado);
CREATE INDEX IF NOT EXISTS idx_empleados_user_id ON public.empleados(user_id);
CREATE INDEX IF NOT EXISTS idx_empleados_email ON public.empleados(email);
CREATE INDEX IF NOT EXISTS idx_empleados_es_admin_principal ON public.empleados(es_admin_principal);
CREATE INDEX IF NOT EXISTS idx_permisos_empleados_empleado_id ON public.permisos_empleados(empleado_id);
CREATE INDEX IF NOT EXISTS idx_permisos_empleados_seccion_id ON public.permisos_empleados(seccion_id);
CREATE INDEX IF NOT EXISTS idx_secciones_sistema_activa ON public.secciones_sistema(activa);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_empleados_updated_at ON public.empleados;
CREATE TRIGGER update_empleados_updated_at
    BEFORE UPDATE ON public.empleados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_permisos_empleados_updated_at ON public.permisos_empleados;
CREATE TRIGGER update_permisos_empleados_updated_at
    BEFORE UPDATE ON public.permisos_empleados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_secciones_sistema_updated_at ON public.secciones_sistema;
CREATE TRIGGER update_secciones_sistema_updated_at
    BEFORE UPDATE ON public.secciones_sistema
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permisos_empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secciones_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas para empleados
DROP POLICY IF EXISTS "Users can view employees from their restaurants" ON public.empleados;
CREATE POLICY "Users can view employees from their restaurants" ON public.empleados
    FOR SELECT USING (
        restaurante_id IN (
            SELECT id FROM public.restaurantes WHERE user_id = auth.uid()
        )
        OR user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can insert employees in their restaurants" ON public.empleados;
CREATE POLICY "Users can insert employees in their restaurants" ON public.empleados
    FOR INSERT WITH CHECK (
        restaurante_id IN (
            SELECT id FROM public.restaurantes WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update employees from their restaurants" ON public.empleados;
CREATE POLICY "Users can update employees from their restaurants" ON public.empleados
    FOR UPDATE USING (
        restaurante_id IN (
            SELECT id FROM public.restaurantes WHERE user_id = auth.uid()
        )
        OR user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can delete employees from their restaurants" ON public.empleados;
CREATE POLICY "Users can delete employees from their restaurants" ON public.empleados
    FOR DELETE USING (
        restaurante_id IN (
            SELECT id FROM public.restaurantes WHERE user_id = auth.uid()
        )
        AND cargo != 'Dueño'
    );

-- Políticas para permisos de empleados
DROP POLICY IF EXISTS "Users can view permissions from their restaurant employees" ON public.permisos_empleados;
CREATE POLICY "Users can view permissions from their restaurant employees" ON public.permisos_empleados
    FOR SELECT USING (
        empleado_id IN (
            SELECT e.id FROM public.empleados e
            JOIN public.restaurantes r ON e.restaurante_id = r.id
            WHERE r.user_id = auth.uid() OR e.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert permissions for their restaurant employees" ON public.permisos_empleados;
CREATE POLICY "Users can insert permissions for their restaurant employees" ON public.permisos_empleados
    FOR INSERT WITH CHECK (
        empleado_id IN (
            SELECT e.id FROM public.empleados e
            JOIN public.restaurantes r ON e.restaurante_id = r.id
            WHERE r.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update permissions from their restaurant employees" ON public.permisos_empleados;
CREATE POLICY "Users can update permissions from their restaurant employees" ON public.permisos_empleados
    FOR UPDATE USING (
        empleado_id IN (
            SELECT e.id FROM public.empleados e
            JOIN public.restaurantes r ON e.restaurante_id = r.id
            WHERE r.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete permissions from their restaurant employees" ON public.permisos_empleados;
CREATE POLICY "Users can delete permissions from their restaurant employees" ON public.permisos_empleados
    FOR DELETE USING (
        empleado_id IN (
            SELECT e.id FROM public.empleados e
            JOIN public.restaurantes r ON e.restaurante_id = r.id
            WHERE r.user_id = auth.uid()
        )
    );

-- Política para secciones del sistema (solo lectura para todos los usuarios autenticados)
DROP POLICY IF EXISTS "Authenticated users can view system sections" ON public.secciones_sistema;
CREATE POLICY "Authenticated users can view system sections" ON public.secciones_sistema
    FOR SELECT USING (auth.role() = 'authenticated');

-- Función para crear empleado automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    restaurante_id UUID;
BEGIN
    -- Verificar si ya existe un empleado para este usuario
    IF EXISTS (SELECT 1 FROM public.empleados WHERE user_id = NEW.id) THEN
        RETURN NEW;
    END IF;

    -- Buscar si ya existe un restaurante para este usuario
    SELECT id INTO restaurante_id 
    FROM public.restaurantes 
    WHERE user_id = NEW.id 
    LIMIT 1;

    -- Si no existe restaurante, crear uno básico
    IF restaurante_id IS NULL THEN
        INSERT INTO public.restaurantes (
            user_id,
            nombre,
            dueno_nombre,
            dueno_apellido,
            dueno_email,
            cuit,
            razon_social,
            direccion,
            ciudad,
            provincia,
            activo
        ) VALUES (
            NEW.id,
            'Mi Restaurante',
            'Propietario',
            'Principal',
            NEW.email,
            '00-00000000-0',
            'Mi Restaurante S.A.',
            'Dirección pendiente',
            'Ciudad',
            'Provincia',
            true
        ) RETURNING id INTO restaurante_id;
    END IF;

    -- Crear empleado con cargo "Dueño"
    INSERT INTO public.empleados (
        user_id,
        restaurante_id,
        nombre,
        cargo,
        contacto,
        email,
        estado,
        es_admin_principal,
        fecha_ingreso
    ) VALUES (
        NEW.id,
        restaurante_id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Propietario Principal'),
        'Dueño',
        COALESCE(NEW.phone, NEW.email),
        NEW.email,
        'activo',
        true,
        CURRENT_DATE
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para ejecutar la función cuando se crea un nuevo usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comentarios para documentar las tablas
COMMENT ON TABLE public.empleados IS 'Tabla para almacenar información de empleados de cada restaurante';
COMMENT ON TABLE public.permisos_empleados IS 'Tabla para almacenar permisos granulares de empleados por sección';
COMMENT ON TABLE public.secciones_sistema IS 'Tabla para definir las secciones del sistema disponibles';

COMMENT ON COLUMN public.empleados.restaurante_id IS 'ID del restaurante al que pertenece el empleado';
COMMENT ON COLUMN public.empleados.user_id IS 'ID del usuario de Supabase Auth (para empleados con acceso al sistema)';
COMMENT ON COLUMN public.empleados.email IS 'Email del empleado (puede ser diferente al de contacto)';
COMMENT ON COLUMN public.empleados.es_admin_principal IS 'Indica si es el administrador principal del restaurante';
COMMENT ON COLUMN public.permisos_empleados.puede_ver IS 'Permiso para ver la sección';
COMMENT ON COLUMN public.permisos_empleados.puede_crear IS 'Permiso para crear elementos en la sección';
COMMENT ON COLUMN public.permisos_empleados.puede_editar IS 'Permiso para editar elementos en la sección';
COMMENT ON COLUMN public.permisos_empleados.puede_eliminar IS 'Permiso para eliminar elementos en la sección';
COMMENT ON COLUMN public.secciones_sistema.activa IS 'Indica si la sección está activa y disponible';
