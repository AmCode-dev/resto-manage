-- Crear tabla de restaurantes
CREATE TABLE IF NOT EXISTS restaurantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  logo_url TEXT,
  
  -- Información del dueño
  dueno_nombre VARCHAR(100) NOT NULL,
  dueno_apellido VARCHAR(100) NOT NULL,
  dueno_email VARCHAR(255) NOT NULL,
  dueno_telefono VARCHAR(20),
  dueno_dni VARCHAR(20),
  
  -- Información fiscal
  cuit VARCHAR(15) NOT NULL,
  razon_social VARCHAR(200) NOT NULL,
  condicion_fiscal VARCHAR(50),
  
  -- Ubicación
  direccion TEXT NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  provincia VARCHAR(100) NOT NULL,
  codigo_postal VARCHAR(10),
  pais VARCHAR(100) DEFAULT 'Argentina',
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  
  -- Información operativa
  capacidad_total INTEGER,
  numero_mesas INTEGER,
  horario_apertura TIME,
  horario_cierre TIME,
  dias_operacion TEXT[], -- Array de días: ['lunes', 'martes', etc.]
  
  -- Configuración
  moneda VARCHAR(10) DEFAULT 'ARS',
  zona_horaria VARCHAR(50) DEFAULT 'America/Argentina/Buenos_Aires',
  idioma VARCHAR(10) DEFAULT 'es',
  
  -- Contacto
  telefono_restaurante VARCHAR(20),
  email_restaurante VARCHAR(255),
  sitio_web TEXT,
  redes_sociales JSONB,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  fecha_apertura DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, nombre),
  CONSTRAINT valid_email CHECK (dueno_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_restaurant_email CHECK (email_restaurante IS NULL OR email_restaurante ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_restaurantes_updated_at ON restaurantes;
CREATE TRIGGER update_restaurantes_updated_at
    BEFORE UPDATE ON restaurantes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE restaurantes ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
DROP POLICY IF EXISTS "Users can view their own restaurants" ON restaurantes;
CREATE POLICY "Users can view their own restaurants" ON restaurantes
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own restaurants" ON restaurantes;
CREATE POLICY "Users can insert their own restaurants" ON restaurantes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own restaurants" ON restaurantes;
CREATE POLICY "Users can update their own restaurants" ON restaurantes
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own restaurants" ON restaurantes;
CREATE POLICY "Users can delete their own restaurants" ON restaurantes
    FOR DELETE USING (auth.uid() = user_id);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_restaurantes_user_id ON restaurantes(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurantes_activo ON restaurantes(activo);
CREATE INDEX IF NOT EXISTS idx_restaurantes_ciudad ON restaurantes(ciudad);
CREATE INDEX IF NOT EXISTS idx_restaurantes_provincia ON restaurantes(provincia);
