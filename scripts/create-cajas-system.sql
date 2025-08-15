-- Crear tabla de cajas (turnos de trabajo)
CREATE TABLE IF NOT EXISTS cajas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurante_id UUID NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE RESTRICT,
    fecha_apertura DATE DEFAULT CURRENT_DATE,
    hora_apertura TIME DEFAULT CURRENT_TIME,
    caja_inicial DECIMAL(10,2) NOT NULL DEFAULT 0,
    fecha_cierre DATE NULL,
    hora_cierre TIME NULL,
    caja_final DECIMAL(10,2) NULL,
    efectivo_esperado DECIMAL(10,2) DEFAULT 0,
    tarjeta_esperado DECIMAL(10,2) DEFAULT 0,
    otros_esperado DECIMAL(10,2) DEFAULT 0,
    efectivo_real DECIMAL(10,2) NULL,
    tarjeta_real DECIMAL(10,2) NULL,
    otros_real DECIMAL(10,2) NULL,
    diferencia DECIMAL(10,2) NULL,
    total_ventas DECIMAL(10,2) DEFAULT 0,
    total_pedidos INTEGER DEFAULT 0,
    total_personas INTEGER DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado')),
    notas TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurante_id UUID NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
    caja_id UUID NOT NULL REFERENCES cajas(id) ON DELETE RESTRICT,
    numero_pedido INTEGER NOT NULL,
    mesa INTEGER NOT NULL,
    personas INTEGER DEFAULT 1,
    items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    descuentos DECIMAL(10,2) DEFAULT 0,
    impuestos DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'abierto' CHECK (estado IN ('abierto', 'pagado', 'cancelado')),
    fecha DATE DEFAULT CURRENT_DATE,
    hora TIME DEFAULT CURRENT_TIME,
    notas TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurante_id, fecha, numero_pedido)
);

-- Crear tabla de transacciones (pagos)
CREATE TABLE IF NOT EXISTS transacciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurante_id UUID NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    caja_id UUID NOT NULL REFERENCES cajas(id) ON DELETE RESTRICT,
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'otro')),
    monto DECIMAL(10,2) NOT NULL,
    referencia VARCHAR(100) NULL,
    notas TEXT NULL,
    fecha DATE DEFAULT CURRENT_DATE,
    hora TIME DEFAULT CURRENT_TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_cajas_restaurante_estado ON cajas(restaurante_id, estado);
CREATE INDEX IF NOT EXISTS idx_cajas_empleado ON cajas(empleado_id);
CREATE INDEX IF NOT EXISTS idx_cajas_fecha_apertura ON cajas(fecha_apertura);

CREATE INDEX IF NOT EXISTS idx_pedidos_caja ON pedidos(caja_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_restaurante_fecha ON pedidos(restaurante_id, fecha);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_mesa ON pedidos(mesa);

CREATE INDEX IF NOT EXISTS idx_transacciones_pedido ON transacciones(pedido_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_caja ON transacciones(caja_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_metodo_pago ON transacciones(metodo_pago);
CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones(fecha);

-- Función para generar número de pedido secuencial por día
CREATE OR REPLACE FUNCTION generar_numero_pedido(p_restaurante_id UUID, p_fecha DATE)
RETURNS INTEGER AS $$
DECLARE
    nuevo_numero INTEGER;
BEGIN
    -- Obtener el siguiente número de pedido para el día
    SELECT COALESCE(MAX(numero_pedido), 0) + 1
    INTO nuevo_numero
    FROM pedidos
    WHERE restaurante_id = p_restaurante_id
    AND fecha = p_fecha;
    
    RETURN nuevo_numero;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers a las tablas
DROP TRIGGER IF EXISTS update_cajas_updated_at ON cajas;
CREATE TRIGGER update_cajas_updated_at
    BEFORE UPDATE ON cajas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pedidos_updated_at ON pedidos;
CREATE TRIGGER update_pedidos_updated_at
    BEFORE UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transacciones_updated_at ON transacciones;
CREATE TRIGGER update_transacciones_updated_at
    BEFORE UPDATE ON transacciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar la sección de punto de venta en secciones_sistema si no existe
INSERT INTO secciones_sistema (id, nombre, descripcion, icono)
VALUES ('pos', 'Punto de Venta', 'Gestión de ventas, pedidos y cajas', 'shopping-cart')
ON CONFLICT (id) DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE cajas IS 'Tabla para gestionar turnos de trabajo y cajas registradoras';
COMMENT ON TABLE pedidos IS 'Tabla para almacenar pedidos realizados durante los turnos';
COMMENT ON TABLE transacciones IS 'Tabla para registrar pagos y transacciones de los pedidos';

COMMENT ON COLUMN cajas.caja_inicial IS 'Monto inicial con el que se abre la caja para dar cambio';
COMMENT ON COLUMN cajas.diferencia IS 'Diferencia entre el dinero esperado y el dinero real contado';
COMMENT ON COLUMN pedidos.numero_pedido IS 'Número secuencial del pedido por día y restaurante';
COMMENT ON COLUMN pedidos.items IS 'Array JSON con los items del pedido';
COMMENT ON COLUMN transacciones.referencia IS 'Número de referencia para pagos con tarjeta o transferencia';
