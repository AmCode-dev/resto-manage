-- Script para corregir constraints y estructura de empleados
-- Ejecutar este script para solucionar problemas de constraints

-- 1. Primero, verificar y corregir los valores de estado existentes
UPDATE empleados 
SET estado = 'activo' 
WHERE estado NOT IN ('activo', 'inactivo', 'vacaciones');

-- 2. Verificar y corregir los valores de cargo existentes
UPDATE empleados 
SET cargo = 'Dueño' 
WHERE cargo IN ('Dueno', 'DUEÑO', 'dueno', 'dueño');

UPDATE empleados 
SET cargo = 'Administrador' 
WHERE cargo IN ('Admin', 'ADMINISTRADOR', 'admin', 'administrador');

-- 3. Eliminar constraint existente si existe y recrearlo
DO $$ 
BEGIN
    -- Eliminar constraint de estado si existe
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'empleados_estado_check' 
               AND table_name = 'empleados') THEN
        ALTER TABLE empleados DROP CONSTRAINT empleados_estado_check;
    END IF;
    
    -- Eliminar constraint de cargo si existe
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'empleados_cargo_check' 
               AND table_name = 'empleados') THEN
        ALTER TABLE empleados DROP CONSTRAINT empleados_cargo_check;
    END IF;
END $$;

-- 4. Crear nuevos constraints con valores correctos
ALTER TABLE empleados 
ADD CONSTRAINT empleados_estado_check 
CHECK (estado IN ('activo', 'inactivo', 'vacaciones'));

ALTER TABLE empleados 
ADD CONSTRAINT empleados_cargo_check 
CHECK (cargo IN ('Dueño', 'Administrador', 'Gerente', 'Cajero', 'Mesero', 'Cocinero', 'Bartender', 'Limpieza'));

-- 5. Agregar columnas faltantes si no existen
DO $$ 
BEGIN
    -- Agregar user_id si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'empleados' AND column_name = 'user_id') THEN
        ALTER TABLE empleados ADD COLUMN user_id UUID REFERENCES auth.users(id);
        CREATE INDEX IF NOT EXISTS idx_empleados_user_id ON empleados(user_id);
    END IF;
    
    -- Agregar email si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'empleados' AND column_name = 'email') THEN
        ALTER TABLE empleados ADD COLUMN email VARCHAR(255);
    END IF;
    
    -- Agregar es_admin_principal si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'empleados' AND column_name = 'es_admin_principal') THEN
        ALTER TABLE empleados ADD COLUMN es_admin_principal BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Agregar fecha_ingreso si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'empleados' AND column_name = 'fecha_ingreso') THEN
        ALTER TABLE empleados ADD COLUMN fecha_ingreso DATE;
    END IF;
    
    -- Agregar salario si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'empleados' AND column_name = 'salario') THEN
        ALTER TABLE empleados ADD COLUMN salario DECIMAL(10,2);
    END IF;
END $$;

-- 6. Verificar y crear tabla de permisos_empleados si no existe
CREATE TABLE IF NOT EXISTS permisos_empleados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    seccion_id UUID NOT NULL REFERENCES secciones_sistema(id) ON DELETE CASCADE,
    puede_ver BOOLEAN DEFAULT FALSE,
    puede_crear BOOLEAN DEFAULT FALSE,
    puede_editar BOOLEAN DEFAULT FALSE,
    puede_eliminar BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(empleado_id, seccion_id)
);

-- 7. Agregar columnas de permisos si no existen
DO $$ 
BEGIN
    -- Agregar puede_ver si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'permisos_empleados' AND column_name = 'puede_ver') THEN
        ALTER TABLE permisos_empleados ADD COLUMN puede_ver BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Agregar puede_crear si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'permisos_empleados' AND column_name = 'puede_crear') THEN
        ALTER TABLE permisos_empleados ADD COLUMN puede_crear BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Agregar puede_editar si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'permisos_empleados' AND column_name = 'puede_editar') THEN
        ALTER TABLE permisos_empleados ADD COLUMN puede_editar BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Agregar puede_eliminar si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'permisos_empleados' AND column_name = 'puede_eliminar') THEN
        ALTER TABLE permisos_empleados ADD COLUMN puede_eliminar BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 8. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_permisos_empleados_empleado_id ON permisos_empleados(empleado_id);
CREATE INDEX IF NOT EXISTS idx_permisos_empleados_seccion_id ON permisos_empleados(seccion_id);
CREATE INDEX IF NOT EXISTS idx_empleados_restaurante_id ON empleados(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_empleados_estado ON empleados(estado);
CREATE INDEX IF NOT EXISTS idx_empleados_cargo ON empleados(cargo);

-- 9. Función para obtener columnas de una tabla (útil para verificaciones dinámicas)
CREATE OR REPLACE FUNCTION get_table_columns(table_name TEXT)
RETURNS TABLE(column_name TEXT, data_type TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT c.column_name::TEXT, c.data_type::TEXT
    FROM information_schema.columns c
    WHERE c.table_name = $1
    AND c.table_schema = 'public'
    ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql;

-- 10. Función para obtener valores de constraints (helper para el código)
CREATE OR REPLACE FUNCTION get_constraint_values(table_name TEXT, constraint_name TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Esta es una función helper que devuelve los valores permitidos
    -- En un caso real, esto podría parsear la definición del constraint
    result := json_build_object(
        'estados', json_build_array('activo', 'inactivo', 'vacaciones'),
        'cargos', json_build_array('Dueño', 'Administrador', 'Gerente', 'Cajero', 'Mesero', 'Cocinero', 'Bartender', 'Limpieza')
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 11. Actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para empleados si no existe
DROP TRIGGER IF EXISTS update_empleados_updated_at ON empleados;
CREATE TRIGGER update_empleados_updated_at
    BEFORE UPDATE ON empleados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Crear trigger para permisos_empleados si no existe
DROP TRIGGER IF EXISTS update_permisos_empleados_updated_at ON permisos_empleados;
CREATE TRIGGER update_permisos_empleados_updated_at
    BEFORE UPDATE ON permisos_empleados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. Mensaje de confirmación
DO $$ 
BEGIN
    RAISE NOTICE 'Script de corrección de empleados ejecutado exitosamente';
    RAISE NOTICE 'Constraints actualizados, columnas agregadas, índices creados';
    RAISE NOTICE 'Funciones helper creadas para verificaciones dinámicas';
END $$;
