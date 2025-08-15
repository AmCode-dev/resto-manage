-- Crear tabla de inventario de comidas
CREATE TABLE IF NOT EXISTS inventario_comidas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurante_id UUID NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    unidad VARCHAR(50) NOT NULL, -- kg, gramos, litros, unidades, etc.
    precio_unidad DECIMAL(10,2) NOT NULL,
    fecha_caducidad DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (estado IN ('normal', 'bajo', 'agotado', 'vencido')),
    codigo_barras VARCHAR(100),
    alerta_stock INTEGER DEFAULT 5, -- nivel mínimo de stock
    proveedor VARCHAR(255),
    descripcion TEXT,
    ubicacion VARCHAR(100), -- ubicación en almacén
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_inventario_comidas_restaurante ON inventario_comidas(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_inventario_comidas_categoria ON inventario_comidas(categoria);
CREATE INDEX IF NOT EXISTS idx_inventario_comidas_estado ON inventario_comidas(estado);
CREATE INDEX IF NOT EXISTS idx_inventario_comidas_codigo_barras ON inventario_comidas(codigo_barras) WHERE codigo_barras IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventario_comidas_nombre ON inventario_comidas USING gin(to_tsvector('spanish', nombre));

-- Función para actualizar el estado automáticamente
CREATE OR REPLACE FUNCTION actualizar_estado_comida()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el stock es 0, marcar como agotado
    IF NEW.stock = 0 THEN
        NEW.estado = 'agotado';
    -- Si el stock está por debajo del nivel de alerta, marcar como bajo
    ELSIF NEW.stock <= COALESCE(NEW.alerta_stock, 5) THEN
        NEW.estado = 'bajo';
    -- Si la fecha de caducidad ha pasado, marcar como vencido
    ELSIF NEW.fecha_caducidad IS NOT NULL AND NEW.fecha_caducidad < CURRENT_DATE THEN
        NEW.estado = 'vencido';
    -- Si todo está bien, marcar como normal
    ELSE
        NEW.estado = 'normal';
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar estado automáticamente
DROP TRIGGER IF EXISTS trigger_actualizar_estado_comida ON inventario_comidas;
CREATE TRIGGER trigger_actualizar_estado_comida
    BEFORE INSERT OR UPDATE ON inventario_comidas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_estado_comida();

-- Habilitar RLS (Row Level Security)
ALTER TABLE inventario_comidas ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean comidas de sus restaurantes
CREATE POLICY "Usuarios pueden ver comidas de sus restaurantes" ON inventario_comidas
    FOR SELECT USING (
        restaurante_id IN (
            SELECT id FROM restaurantes WHERE user_id = auth.uid()
        )
    );

-- Política para que los usuarios solo puedan insertar comidas en sus restaurantes
CREATE POLICY "Usuarios pueden insertar comidas en sus restaurantes" ON inventario_comidas
    FOR INSERT WITH CHECK (
        restaurante_id IN (
            SELECT id FROM restaurantes WHERE user_id = auth.uid()
        )
    );

-- Política para que los usuarios solo puedan actualizar comidas de sus restaurantes
CREATE POLICY "Usuarios pueden actualizar comidas de sus restaurantes" ON inventario_comidas
    FOR UPDATE USING (
        restaurante_id IN (
            SELECT id FROM restaurantes WHERE user_id = auth.uid()
        )
    );

-- Política para que los usuarios solo puedan eliminar comidas de sus restaurantes
CREATE POLICY "Usuarios pueden eliminar comidas de sus restaurantes" ON inventario_comidas
    FOR DELETE USING (
        restaurante_id IN (
            SELECT id FROM restaurantes WHERE user_id = auth.uid()
        )
    );

-- Insertar datos de ejemplo (opcional)
INSERT INTO inventario_comidas (
    restaurante_id, nombre, categoria, stock, unidad, precio_unidad, 
    fecha_caducidad, codigo_barras, alerta_stock, proveedor, descripcion
) VALUES 
-- Solo insertar si existe al menos un restaurante
(
    (SELECT id FROM restaurantes LIMIT 1),
    'Carne de Res Premium',
    'Carnes',
    25,
    'kg',
    18.50,
    '2024-02-15',
    '7891234567890',
    5,
    'Frigorífico San Juan',
    'Carne de res de primera calidad para asados'
),
(
    (SELECT id FROM restaurantes LIMIT 1),
    'Pollo Entero',
    'Aves',
    40,
    'unidad',
    8.99,
    '2024-01-20',
    '7891234567891',
    10,
    'Granja Los Pollos',
    'Pollo entero fresco de granja'
),
(
    (SELECT id FROM restaurantes LIMIT 1),
    'Salmón Fresco',
    'Pescados',
    15,
    'kg',
    24.99,
    '2024-01-18',
    '7891234567892',
    3,
    'Pescadería del Mar',
    'Salmón fresco del Atlántico'
),
(
    (SELECT id FROM restaurantes LIMIT 1),
    'Tomates Cherry',
    'Verduras',
    12,
    'kg',
    4.50,
    '2024-01-25',
    '7891234567893',
    8,
    'Huerta Orgánica',
    'Tomates cherry orgánicos'
),
(
    (SELECT id FROM restaurantes LIMIT 1),
    'Queso Mozzarella',
    'Lácteos',
    8,
    'kg',
    12.99,
    '2024-02-10',
    '7891234567894',
    5,
    'Lácteos La Vaca',
    'Queso mozzarella para pizzas'
),
(
    (SELECT id FROM restaurantes LIMIT 1),
    'Harina de Trigo',
    'Cereales',
    0,
    'kg',
    2.99,
    '2024-06-30',
    '7891234567895',
    10,
    'Molino San Pedro',
    'Harina de trigo 000 para panificación'
),
(
    (SELECT id FROM restaurantes LIMIT 1),
    'Aceite de Oliva Extra Virgen',
    'Aceites',
    6,
    'litro',
    15.99,
    '2025-01-01',
    '7891234567896',
    3,
    'Olivares del Sur',
    'Aceite de oliva extra virgen primera presión en frío'
);

-- Comentario final
COMMENT ON TABLE inventario_comidas IS 'Tabla para gestionar el inventario de comidas del restaurante';
