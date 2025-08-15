-- Crear tabla de menús
CREATE TABLE IF NOT EXISTS public.menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurante_id UUID NOT NULL REFERENCES public.restaurantes(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    ingredientes TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    stock INTEGER,
    imagen_url TEXT,
    disponible BOOLEAN DEFAULT true,
    orden_menu INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_menus_restaurante_id ON public.menus(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_menus_categoria ON public.menus(categoria);
CREATE INDEX IF NOT EXISTS idx_menus_disponible ON public.menus(disponible);
CREATE INDEX IF NOT EXISTS idx_menus_orden ON public.menus(orden_menu);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean los menús de sus restaurantes
CREATE POLICY "Users can view their restaurant menus" ON public.menus
    FOR SELECT USING (
        restaurante_id IN (
            SELECT id FROM public.restaurantes WHERE user_id = auth.uid()
        )
    );

-- Política para que los usuarios solo puedan insertar menús en sus restaurantes
CREATE POLICY "Users can insert menus for their restaurants" ON public.menus
    FOR INSERT WITH CHECK (
        restaurante_id IN (
            SELECT id FROM public.restaurantes WHERE user_id = auth.uid()
        )
    );

-- Política para que los usuarios solo puedan actualizar los menús de sus restaurantes
CREATE POLICY "Users can update their restaurant menus" ON public.menus
    FOR UPDATE USING (
        restaurante_id IN (
            SELECT id FROM public.restaurantes WHERE user_id = auth.uid()
        )
    );

-- Política para que los usuarios solo puedan eliminar los menús de sus restaurantes
CREATE POLICY "Users can delete their restaurant menus" ON public.menus
    FOR DELETE USING (
        restaurante_id IN (
            SELECT id FROM public.restaurantes WHERE user_id = auth.uid()
        )
    );

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE
    ON public.menus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE public.menus IS 'Tabla para gestionar los elementos del menú de cada restaurante';
COMMENT ON COLUMN public.menus.disponible IS 'Indica si el elemento del menú está disponible para pedidos';
COMMENT ON COLUMN public.menus.orden_menu IS 'Orden de aparición del elemento en el menú';
