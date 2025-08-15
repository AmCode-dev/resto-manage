-- Script para actualizar la estructura de la tabla empleados
-- Ejecutar este script para agregar las columnas necesarias

BEGIN;

-- Agregar columnas faltantes a la tabla empleados
ALTER TABLE public.empleados 
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS es_admin_principal BOOLEAN DEFAULT false;

-- Agregar la referencia a auth.users después de crear la columna
ALTER TABLE public.empleados 
ADD CONSTRAINT IF NOT EXISTS fk_empleados_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Actualizar el constraint del cargo para incluir "Dueño"
ALTER TABLE public.empleados 
DROP CONSTRAINT IF EXISTS empleados_cargo_check;

ALTER TABLE public.empleados 
ADD CONSTRAINT empleados_cargo_check 
CHECK (cargo IN ('Dueño', 'Administrador', 'Gerente', 'Mesero', 'Cocinero', 'Bartender', 'Cajero', 'Limpieza'));

-- Agregar columna activa a secciones_sistema si no existe
ALTER TABLE public.secciones_sistema 
ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT true;

-- Actualizar secciones existentes para que estén activas
UPDATE public.secciones_sistema 
SET activa = true 
WHERE activa IS NULL;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_empleados_user_id ON public.empleados(user_id);
CREATE INDEX IF NOT EXISTS idx_empleados_email ON public.empleados(email);
CREATE INDEX IF NOT EXISTS idx_empleados_es_admin_principal ON public.empleados(es_admin_principal);

-- Actualizar empleados existentes que sean propietarios de restaurantes
UPDATE public.empleados 
SET 
    cargo = 'Dueño',
    es_admin_principal = true,
    user_id = (
        SELECT r.user_id 
        FROM public.restaurantes r 
        WHERE r.id = empleados.restaurante_id
    ),
    email = (
        SELECT r.dueno_email 
        FROM public.restaurantes r 
        WHERE r.id = empleados.restaurante_id
    )
WHERE EXISTS (
    SELECT 1 
    FROM public.restaurantes r 
    WHERE r.id = empleados.restaurante_id 
    AND r.user_id IS NOT NULL
)
AND user_id IS NULL;

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

-- Actualizar políticas RLS
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

COMMIT;

-- Mensaje de confirmación
SELECT 'Estructura de empleados actualizada exitosamente' as mensaje;
