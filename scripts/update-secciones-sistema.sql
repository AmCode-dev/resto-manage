-- Actualizar las secciones del sistema con todas las secciones disponibles
-- Este script asegura que todas las secciones estén correctamente configuradas

-- Insertar o actualizar las secciones del sistema
INSERT INTO secciones_sistema (nombre, descripcion, icono, activa) VALUES
('Dashboard', 'Panel principal del sistema', 'LayoutDashboard', true),
('Empleados', 'Gestión de empleados y permisos', 'Users', true),
('Fidelización', 'Gestión de clientes y programas de fidelización', 'Gift', true),
('Menús', 'Gestión de menús y productos', 'Utensils', true),
('Pedidos', 'Gestión de pedidos y órdenes', 'ClipboardList', true),
('Punto de Venta', 'Sistema de punto de venta y facturación', 'DollarSign', true),
('Inventario Comidas', 'Gestión de inventario de alimentos', 'ChefHat', true),
('Inventario Bebidas', 'Gestión de inventario de bebidas', 'Coffee', true),
('Bartending', 'Sistema de preparación de bebidas', 'Coffee', true),
('Reservas', 'Gestión de reservas y eventos', 'Calendar', true),
('Notificaciones', 'Centro de notificaciones del sistema', 'Package', true),
('Actividad', 'Registro de actividad del sistema', 'Activity', true),
('Finanzas', 'Reportes financieros y contabilidad', 'Package', true),
('Espacio', 'Gestión del espacio físico del restaurante', 'Package', true)
ON CONFLICT (nombre) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  icono = EXCLUDED.icono,
  activa = EXCLUDED.activa,
  updated_at = CURRENT_TIMESTAMP;

-- Agregar columna es_admin_principal a la tabla empleados si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'empleados' AND column_name = 'es_admin_principal') THEN
        ALTER TABLE empleados ADD COLUMN es_admin_principal BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Agregar columna propietario_id a la tabla restaurantes si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurantes' AND column_name = 'propietario_id') THEN
        ALTER TABLE restaurantes ADD COLUMN propietario_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_empleados_user_id ON empleados(user_id);
CREATE INDEX IF NOT EXISTS idx_empleados_restaurante_id ON empleados(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_empleados_cargo ON empleados(cargo);
CREATE INDEX IF NOT EXISTS idx_empleados_estado ON empleados(estado);
CREATE INDEX IF NOT EXISTS idx_permisos_empleados_empleado_id ON permisos_empleados(empleado_id);
CREATE INDEX IF NOT EXISTS idx_permisos_empleados_seccion_id ON permisos_empleados(seccion_id);
CREATE INDEX IF NOT EXISTS idx_restaurantes_propietario_id ON restaurantes(propietario_id);

-- Función para verificar si un usuario es propietario de un restaurante
CREATE OR REPLACE FUNCTION es_propietario_restaurante(user_id UUID, restaurante_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM restaurantes 
        WHERE id = restaurante_id AND propietario_id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario es administrador principal
CREATE OR REPLACE FUNCTION es_admin_principal(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM empleados 
        WHERE user_id = user_id 
        AND cargo = 'Administrador' 
        AND (es_admin_principal = true OR EXISTS (
            SELECT 1 FROM restaurantes 
            WHERE propietario_id = user_id 
            AND id = empleados.restaurante_id
        ))
        AND estado = 'activo'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener permisos completos de un usuario
CREATE OR REPLACE FUNCTION obtener_permisos_usuario(user_id UUID)
RETURNS TABLE (
    seccion_nombre TEXT,
    puede_ver BOOLEAN,
    puede_editar BOOLEAN,
    es_propietario BOOLEAN,
    es_admin_principal BOOLEAN
) AS $$
DECLARE
    empleado_record RECORD;
    restaurante_record RECORD;
BEGIN
    -- Obtener información del empleado
    SELECT * INTO empleado_record 
    FROM empleados 
    WHERE empleados.user_id = obtener_permisos_usuario.user_id 
    AND estado = 'activo';
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Obtener información del restaurante
    SELECT * INTO restaurante_record 
    FROM restaurantes 
    WHERE id = empleado_record.restaurante_id;
    
    -- Verificar si es propietario
    IF restaurante_record.propietario_id = obtener_permisos_usuario.user_id THEN
        -- Propietario: acceso completo a todo
        RETURN QUERY
        SELECT 
            s.nombre,
            true::BOOLEAN,
            true::BOOLEAN,
            true::BOOLEAN,
            false::BOOLEAN
        FROM secciones_sistema s
        WHERE s.activa = true;
        RETURN;
    END IF;
    
    -- Verificar si es administrador principal
    IF empleado_record.cargo = 'Administrador' AND empleado_record.es_admin_principal = true THEN
        -- Admin principal: acceso completo a todo
        RETURN QUERY
        SELECT 
            s.nombre,
            true::BOOLEAN,
            true::BOOLEAN,
            false::BOOLEAN,
            true::BOOLEAN
        FROM secciones_sistema s
        WHERE s.activa = true;
        RETURN;
    END IF;
    
    -- Verificar si es administrador regular
    IF empleado_record.cargo = 'Administrador' THEN
        -- Admin regular: acceso completo a todo
        RETURN QUERY
        SELECT 
            s.nombre,
            true::BOOLEAN,
            true::BOOLEAN,
            false::BOOLEAN,
            false::BOOLEAN
        FROM secciones_sistema s
        WHERE s.activa = true;
        RETURN;
    END IF;
    
    -- Para otros empleados: usar permisos específicos
    RETURN QUERY
    SELECT 
        s.nombre,
        COALESCE(p.puede_ver, false),
        COALESCE(p.puede_editar, false),
        false::BOOLEAN,
        false::BOOLEAN
    FROM secciones_sistema s
    LEFT JOIN permisos_empleados p ON s.id = p.seccion_id AND p.empleado_id = empleado_record.id
    WHERE s.activa = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear política de seguridad para empleados (RLS)
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver su propia información
CREATE POLICY "Los usuarios pueden ver su propia información de empleado" ON empleados
    FOR SELECT USING (auth.uid() = user_id);

-- Política para que los propietarios y admins puedan ver todos los empleados de su restaurante
CREATE POLICY "Propietarios y admins pueden ver empleados de su restaurante" ON empleados
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM empleados e
            WHERE e.user_id = auth.uid()
            AND e.restaurante_id = empleados.restaurante_id
            AND e.estado = 'activo'
            AND (
                e.cargo = 'Administrador' OR
                EXISTS (
                    SELECT 1 FROM restaurantes r
                    WHERE r.id = e.restaurante_id AND r.propietario_id = auth.uid()
                )
            )
        )
    );

-- Política para insertar empleados (solo propietarios y admins principales)
CREATE POLICY "Solo propietarios y admins principales pueden crear empleados" ON empleados
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM empleados e
            WHERE e.user_id = auth.uid()
            AND e.restaurante_id = empleados.restaurante_id
            AND e.estado = 'activo'
            AND (
                e.es_admin_principal = true OR
                EXISTS (
                    SELECT 1 FROM restaurantes r
                    WHERE r.id = e.restaurante_id AND r.propietario_id = auth.uid()
                )
            )
        )
    );

-- Política para actualizar empleados
CREATE POLICY "Propietarios y admins pueden actualizar empleados" ON empleados
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM empleados e
            WHERE e.user_id = auth.uid()
            AND e.restaurante_id = empleados.restaurante_id
            AND e.estado = 'activo'
            AND (
                e.cargo = 'Administrador' OR
                EXISTS (
                    SELECT 1 FROM restaurantes r
                    WHERE r.id = e.restaurante_id AND r.propietario_id = auth.uid()
                )
            )
        )
    );

-- Política para eliminar empleados (solo propietarios)
CREATE POLICY "Solo propietarios pueden eliminar empleados" ON empleados
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM restaurantes r
            JOIN empleados e ON e.restaurante_id = r.id
            WHERE r.propietario_id = auth.uid()
            AND e.id = empleados.id
        )
    );

-- Habilitar RLS en permisos_empleados
ALTER TABLE permisos_empleados ENABLE ROW LEVEL SECURITY;

-- Política para ver permisos
CREATE POLICY "Ver permisos según acceso a empleados" ON permisos_empleados
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM empleados e
            WHERE e.id = permisos_empleados.empleado_id
            AND (
                e.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM empleados admin
                    WHERE admin.user_id = auth.uid()
                    AND admin.restaurante_id = e.restaurante_id
                    AND admin.estado = 'activo'
                    AND (
                        admin.cargo = 'Administrador' OR
                        EXISTS (
                            SELECT 1 FROM restaurantes r
                            WHERE r.id = admin.restaurante_id AND r.propietario_id = auth.uid()
                        )
                    )
                )
            )
        )
    );

-- Política para gestionar permisos (solo propietarios y admins)
CREATE POLICY "Solo propietarios y admins pueden gestionar permisos" ON permisos_empleados
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM empleados e
            JOIN empleados admin ON admin.restaurante_id = e.restaurante_id
            WHERE e.id = permisos_empleados.empleado_id
            AND admin.user_id = auth.uid()
            AND admin.estado = 'activo'
            AND (
                admin.cargo = 'Administrador' OR
                EXISTS (
                    SELECT 1 FROM restaurantes r
                    WHERE r.id = admin.restaurante_id AND r.propietario_id = auth.uid()
                )
            )
        )
    );

-- Comentarios para documentación
COMMENT ON TABLE secciones_sistema IS 'Secciones disponibles en el sistema para control de permisos';
COMMENT ON COLUMN empleados.es_admin_principal IS 'Indica si el empleado es un administrador principal con privilegios especiales';
COMMENT ON COLUMN restaurantes.propietario_id IS 'ID del usuario propietario del restaurante con acceso completo';
COMMENT ON FUNCTION es_propietario_restaurante IS 'Verifica si un usuario es propietario de un restaurante específico';
COMMENT ON FUNCTION es_admin_principal IS 'Verifica si un usuario es administrador principal';
COMMENT ON FUNCTION obtener_permisos_usuario IS 'Obtiene todos los permisos de un usuario incluyendo nivel de acceso';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Sistema de permisos actualizado correctamente';
    RAISE NOTICE 'Secciones del sistema configuradas';
    RAISE NOTICE 'Políticas de seguridad aplicadas';
    RAISE NOTICE 'Funciones de verificación creadas';
END $$;
