-- Script mejorado para corregir constraints de empleados
-- Versión 2: Manejo más robusto de constraints

-- 1. Verificar la estructura actual de la tabla empleados
DO $$ 
DECLARE
    constraint_def TEXT;
    table_exists BOOLEAN;
BEGIN
    -- Verificar si la tabla existe
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'empleados'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE 'Tabla empleados no existe, será creada';
    ELSE
        RAISE NOTICE 'Tabla empleados existe, verificando constraints';
        
        -- Mostrar constraints actuales
        FOR constraint_def IN 
            SELECT conname || ': ' || pg_get_constraintdef(oid)
            FROM pg_constraint 
            WHERE conrelid = 'empleados'::regclass
            AND contype = 'c'
        LOOP
            RAISE NOTICE 'Constraint actual: %', constraint_def;
        END LOOP;
    END IF;
END $$;

-- 2. Eliminar TODOS los constraints de check existentes
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
    -- Eliminar todos los constraints de check en empleados
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'empleados'::regclass 
        AND contype = 'c'
    LOOP
        EXECUTE 'ALTER TABLE empleados DROP CONSTRAINT IF EXISTS ' || constraint_name;
        RAISE NOTICE 'Eliminado constraint: %', constraint_name;
    END LOOP;
END $$;

-- 3. Crear la tabla empleados si no existe
CREATE TABLE IF NOT EXISTS empleados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    contacto VARCHAR(100) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    horario TEXT,
    restaurante_id UUID NOT NULL,
    user_id UUID,
    email VARCHAR(255),
    es_admin_principal BOOLEAN DEFAULT FALSE,
    fecha_ingreso DATE,
    salario DECIMAL(10,2),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Agregar columnas faltantes si no existen
DO $$ 
BEGIN
    -- user_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'empleados' AND column_name = 'user_id') THEN
        ALTER TABLE empleados ADD COLUMN user_id UUID;
        RAISE NOTICE 'Agregada columna user_id';
    END IF;
    
    -- email
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'empleados' AND column_name = 'email') THEN
        ALTER TABLE empleados ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Agregada columna email';
    END IF;
    
    -- es_admin_principal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'empleados' AND column_name = 'es_admin_principal') THEN
        ALTER TABLE empleados ADD COLUMN es_admin_principal BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Agregada columna es_admin_principal';
    END IF;
    
    -- fecha_ingreso
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'empleados' AND column_name = 'fecha_ingreso') THEN
        ALTER TABLE empleados ADD COLUMN fecha_ingreso DATE;
        RAISE NOTICE 'Agregada columna fecha_ingreso';
    END IF;
    
    -- salario
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'empleados' AND column_name = 'salario') THEN
        ALTER TABLE empleados ADD COLUMN salario DECIMAL(10,2);
        RAISE NOTICE 'Agregada columna salario';
    END IF;
    
    -- notas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'empleados' AND column_name = 'notas') THEN
        ALTER TABLE empleados ADD COLUMN notas TEXT;
        RAISE NOTICE 'Agregada columna notas';
    END IF;
END $$;

-- 5. Limpiar datos existentes que no cumplan con los nuevos constraints
UPDATE empleados SET estado = 'activo' WHERE estado IS NULL OR estado = '';
UPDATE empleados SET cargo = 'Mesero' WHERE cargo IS NULL OR cargo = '';

-- Normalizar valores de estado
UPDATE empleados SET estado = 'activo' WHERE LOWER(estado) IN ('active', 'activo', 'habilitado', 'enabled');
UPDATE empleados SET estado = 'inactivo' WHERE LOWER(estado) IN ('inactive', 'inactivo', 'deshabilitado', 'disabled');
UPDATE empleados SET estado = 'vacaciones' WHERE LOWER(estado) IN ('vacation', 'vacaciones', 'holidays');

-- Normalizar valores de cargo
UPDATE empleados SET cargo = 'Dueño' WHERE LOWER(cargo) IN ('dueño', 'dueno', 'owner', 'propietario');
UPDATE empleados SET cargo = 'Administrador' WHERE LOWER(cargo) IN ('administrador', 'admin', 'administrator');
UPDATE empleados SET cargo = 'Gerente' WHERE LOWER(cargo) IN ('gerente', 'manager');
UPDATE empleados SET cargo = 'Mesero' WHERE LOWER(cargo) IN ('mesero', 'waiter', 'camarero');
UPDATE empleados SET cargo = 'Cocinero' WHERE LOWER(cargo) IN ('cocinero', 'chef', 'cook');
UPDATE empleados SET cargo = 'Bartender' WHERE LOWER(cargo) IN ('bartender', 'barman');
UPDATE empleados SET cargo = 'Cajero' WHERE LOWER(cargo) IN ('cajero', 'cashier');
UPDATE empleados SET cargo = 'Limpieza' WHERE LOWER(cargo) IN ('limpieza', 'cleaning', 'cleaner');

-- 6. Crear nuevos constraints con nombres únicos
ALTER TABLE empleados 
ADD CONSTRAINT chk_empleados_estado_v2 
CHECK (estado IN ('activo', 'inactivo', 'vacaciones'));

ALTER TABLE empleados 
ADD CONSTRAINT chk_empleados_cargo_v2 
CHECK (cargo IN ('Dueño', 'Administrador', 'Gerente', 'Mesero', 'Cocinero', 'Bartender', 'Cajero', 'Limpieza'));

-- 7. Agregar foreign key constraints si no existen
DO $$
BEGIN
    -- Foreign key a restaurantes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_empleados_restaurante' 
        AND table_name = 'empleados'
    ) THEN
        ALTER TABLE empleados 
        ADD CONSTRAINT fk_empleados_restaurante 
        FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id) ON DELETE CASCADE;
        RAISE NOTICE 'Agregado foreign key a restaurantes';
    END IF;
    
    -- Foreign key a auth.users (si existe la tabla)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_empleados_user' 
            AND table_name = 'empleados'
        ) THEN
            ALTER TABLE empleados 
            ADD CONSTRAINT fk_empleados_user 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
            RAISE NOTICE 'Agregado foreign key a auth.users';
        END IF;
    END IF;
END $$;

-- 8. Crear tabla de secciones_sistema si no existe
CREATE TABLE IF NOT EXISTS secciones_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50),
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Insertar secciones básicas si no existen
INSERT INTO secciones_sistema (id, nombre, descripcion, icono, activa) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Dashboard', 'Panel principal del sistema', 'dashboard', true),
    ('22222222-2222-2222-2222-222222222222', 'Empleados', 'Gestión de empleados y permisos', 'users', true),
    ('33333333-3333-3333-3333-333333333333', 'Inventario', 'Control de inventario y stock', 'package', true),
    ('44444444-4444-4444-4444-444444444444', 'Menús', 'Gestión de menús y productos', 'menu', true),
    ('55555555-5555-5555-5555-555555555555', 'POS', 'Punto de venta y cajas', 'cash-register', true),
    ('66666666-6666-6666-6666-666666666666', 'Reservas', 'Sistema de reservas', 'calendar', true),
    ('77777777-7777-7777-7777-777777777777', 'Configuración', 'Configuración del restaurante', 'settings', true)
ON CONFLICT (nombre) DO NOTHING;

-- 10. Crear tabla de permisos_empleados si no existe
CREATE TABLE IF NOT EXISTS permisos_empleados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empleado_id UUID NOT NULL,
    seccion_id UUID NOT NULL,
    puede_ver BOOLEAN DEFAULT FALSE,
    puede_crear BOOLEAN DEFAULT FALSE,
    puede_editar BOOLEAN DEFAULT FALSE,
    puede_eliminar BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(empleado_id, seccion_id)
);

-- 11. Agregar foreign keys a permisos_empleados
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_permisos_empleado' 
        AND table_name = 'permisos_empleados'
    ) THEN
        ALTER TABLE permisos_empleados 
        ADD CONSTRAINT fk_permisos_empleado 
        FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_permisos_seccion' 
        AND table_name = 'permisos_empleados'
    ) THEN
        ALTER TABLE permisos_empleados 
        ADD CONSTRAINT fk_permisos_seccion 
        FOREIGN KEY (seccion_id) REFERENCES secciones_sistema(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 12. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_empleados_user_id ON empleados(user_id);
CREATE INDEX IF NOT EXISTS idx_empleados_restaurante_id ON empleados(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_empleados_estado ON empleados(estado);
CREATE INDEX IF NOT EXISTS idx_empleados_cargo ON empleados(cargo);
CREATE INDEX IF NOT EXISTS idx_empleados_email ON empleados(email);
CREATE INDEX IF NOT EXISTS idx_permisos_empleados_empleado_id ON permisos_empleados(empleado_id);
CREATE INDEX IF NOT EXISTS idx_permisos_empleados_seccion_id ON permisos_empleados(seccion_id);

-- 13. Crear función para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. Crear triggers para actualizar timestamps
DROP TRIGGER IF EXISTS update_empleados_updated_at ON empleados;
CREATE TRIGGER update_empleados_updated_at
    BEFORE UPDATE ON empleados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_permisos_empleados_updated_at ON permisos_empleados;
CREATE TRIGGER update_permisos_empleados_updated_at
    BEFORE UPDATE ON permisos_empleados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_secciones_sistema_updated_at ON secciones_sistema;
CREATE TRIGGER update_secciones_sistema_updated_at
    BEFORE UPDATE ON secciones_sistema
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 15. Función helper para obtener valores de constraints
CREATE OR REPLACE FUNCTION get_constraint_values(table_name TEXT, constraint_name TEXT)
RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        'estados', json_build_array('activo', 'inactivo', 'vacaciones'),
        'cargos', json_build_array('Dueño', 'Administrador', 'Gerente', 'Mesero', 'Cocinero', 'Bartender', 'Cajero', 'Limpieza')
    );
END;
$$ LANGUAGE plpgsql;

-- 16. Función para verificar estructura de tabla
CREATE OR REPLACE FUNCTION get_table_columns(table_name TEXT)
RETURNS TABLE(column_name TEXT, data_type TEXT, is_nullable TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT c.column_name::TEXT, c.data_type::TEXT, c.is_nullable::TEXT
    FROM information_schema.columns c
    WHERE c.table_name = $1
    AND c.table_schema = 'public'
    ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql;

-- 17. Verificar que todo esté correcto
DO $$ 
DECLARE
    constraint_count INTEGER;
    column_count INTEGER;
BEGIN
    -- Contar constraints
    SELECT COUNT(*) INTO constraint_count
    FROM pg_constraint 
    WHERE conrelid = 'empleados'::regclass 
    AND contype = 'c';
    
    -- Contar columnas
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_name = 'empleados'
    AND table_schema = 'public';
    
    RAISE NOTICE 'Script completado exitosamente';
    RAISE NOTICE 'Constraints de check creados: %', constraint_count;
    RAISE NOTICE 'Columnas en tabla empleados: %', column_count;
    RAISE NOTICE 'Valores permitidos para estado: activo, inactivo, vacaciones';
    RAISE NOTICE 'Valores permitidos para cargo: Dueño, Administrador, Gerente, Mesero, Cocinero, Bartender, Cajero, Limpieza';
END $$;
