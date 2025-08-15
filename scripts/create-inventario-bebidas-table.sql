-- Crear tabla de inventario de bebidas
CREATE TABLE IF NOT EXISTS inventario_bebidas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurante_id UUID NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  unidad VARCHAR(50) NOT NULL,
  precio_unidad DECIMAL(10,2) NOT NULL,
  fecha_caducidad DATE,
  estado VARCHAR(20) NOT NULL DEFAULT 'normal',
  codigo_barras VARCHAR(100),
  alerta_stock INTEGER DEFAULT 5,
  proveedor VARCHAR(255),
  descripcion TEXT,
  ubicacion VARCHAR(255),
  graduacion_alcoholica DECIMAL(4,2) DEFAULT 0,
  volumen INTEGER, -- en ml
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_inventario_bebidas_restaurante_id ON inventario_bebidas(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_inventario_bebidas_categoria ON inventario_bebidas(categoria);
CREATE INDEX IF NOT EXISTS idx_inventario_bebidas_estado ON inventario_bebidas(estado);
CREATE INDEX IF NOT EXISTS idx_inventario_bebidas_codigo_barras ON inventario_bebidas(codigo_barras);

-- Función para actualizar el timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_inventario_bebidas_updated_at ON inventario_bebidas;
CREATE TRIGGER update_inventario_bebidas_updated_at
    BEFORE UPDATE ON inventario_bebidas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular el estado automáticamente
CREATE OR REPLACE FUNCTION calcular_estado_bebida()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el stock es 0, está agotado
    IF NEW.stock = 0 THEN
        NEW.estado = 'agotado';
    -- Si el stock está por debajo del nivel de alerta, está bajo
    ELSIF NEW.stock <= NEW.alerta_stock THEN
        NEW.estado = 'bajo';
    -- Si la fecha de caducidad ha pasado, está vencido
    ELSIF NEW.fecha_caducidad IS NOT NULL AND NEW.fecha_caducidad < CURRENT_DATE THEN
        NEW.estado = 'vencido';
    -- En caso contrario, está normal
    ELSE
        NEW.estado = 'normal';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para calcular el estado automáticamente
DROP TRIGGER IF EXISTS trigger_calcular_estado_bebida ON inventario_bebidas;
CREATE TRIGGER trigger_calcular_estado_bebida
    BEFORE INSERT OR UPDATE ON inventario_bebidas
    FOR EACH ROW
    EXECUTE FUNCTION calcular_estado_bebida();

-- Habilitar RLS (Row Level Security)
ALTER TABLE inventario_bebidas ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver bebidas de sus restaurantes
CREATE POLICY "Users can view bebidas from their restaurants" ON inventario_bebidas
    FOR SELECT USING (
        restaurante_id IN (
            SELECT id FROM restaurantes WHERE propietario_id = auth.uid()
        )
    );

-- Política para que los usuarios solo puedan insertar bebidas en sus restaurantes
CREATE POLICY "Users can insert bebidas in their restaurants" ON inventario_bebidas
    FOR INSERT WITH CHECK (
        restaurante_id IN (
            SELECT id FROM restaurantes WHERE propietario_id = auth.uid()
        )
    );

-- Política para que los usuarios solo puedan actualizar bebidas de sus restaurantes
CREATE POLICY "Users can update bebidas from their restaurants" ON inventario_bebidas
    FOR UPDATE USING (
        restaurante_id IN (
            SELECT id FROM restaurantes WHERE propietario_id = auth.uid()
        )
    );

-- Política para que los usuarios solo puedan eliminar bebidas de sus restaurantes
CREATE POLICY "Users can delete bebidas from their restaurants" ON inventario_bebidas
    FOR DELETE USING (
        restaurante_id IN (
            SELECT id FROM restaurantes WHERE propietario_id = auth.uid()
        )
    );

-- Insertar datos de ejemplo (opcional)
INSERT INTO inventario_bebidas (
    restaurante_id,
    nombre,
    categoria,
    stock,
    unidad,
    precio_unidad,
    fecha_caducidad,
    graduacion_alcoholica,
    volumen,
    alerta_stock,
    proveedor,
    descripcion,
    ubicacion,
    codigo_barras
) VALUES 
-- Nota: Reemplaza 'your-restaurant-id' con el ID real de tu restaurante
-- Estos son datos de ejemplo, puedes eliminarlos si no los necesitas
(
    (SELECT id FROM restaurantes LIMIT 1),
    'Vino Tinto Reserva',
    'Vinos',
    24,
    'botella',
    25.99,
    '2026-12-31',
    13.5,
    750,
    5,
    'Bodega Premium',
    'Vino tinto reserva con 2 años de crianza',
    'Bodega A1',
    '7891234567890'
),
(
    (SELECT id FROM restaurantes LIMIT 1),
    'Cerveza Artesanal IPA',
    'Cervezas',
    48,
    'botella',
    4.50,
    '2024-06-30',
    6.2,
    330,
    10,
    'Cervecería Local',
    'Cerveza IPA con lúpulo americano',
    'Refrigerador 1',
    '7891234567891'
),
(
    (SELECT id FROM restaurantes LIMIT 1),
    'Whisky Premium',
    'Licores',
    6,
    'botella',
    89.99,
    '2030-01-01',
    40.0,
    700,
    2,
    'Destilería Escocesa',
    'Whisky escocés de malta única',
    'Estante Premium',
    '7891234567892'
),
(
    (SELECT id FROM restaurantes LIMIT 1),
    'Agua Mineral',
    'Sin Alcohol',
    120,
    'botella',
    1.25,
    '2025-03-15',
    0.0,
    500,
    20,
    'Aguas Puras',
    'Agua mineral natural',
    'Almacén General',
    '7891234567893'
),
(
    (SELECT id FROM restaurantes LIMIT 1),
    'Refresco Cola',
    'Sin Alcohol',
    72,
    'lata',
    1.50,
    '2024-09-30',
    0.0,
    355,
    15,
    'Refrescos Unidos',
    'Refresco de cola clásico',
    'Refrigerador 2',
    '7891234567894'
),
(
    (SELECT id FROM restaurantes LIMIT 1),
    'Champagne Brut',
    'Espumantes',
    12,
    'botella',
    45.00,
    '2027-12-31',
    12.0,
    750,
    3,
    'Champagne House',
    'Champagne brut de calidad superior',
    'Bodega Especial',
    '7891234567895'
);

-- Comentario final
COMMENT ON TABLE inventario_bebidas IS 'Tabla para gestionar el inventario de bebidas del restaurante';
COMMENT ON COLUMN inventario_bebidas.graduacion_alcoholica IS 'Porcentaje de alcohol (0 para bebidas sin alcohol)';
COMMENT ON COLUMN inventario_bebidas.volumen IS 'Volumen del envase en mililitros';
COMMENT ON COLUMN inventario_bebidas.estado IS 'Estado calculado automáticamente: normal, bajo, agotado, vencido';
