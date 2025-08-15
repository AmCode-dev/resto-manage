"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle, Database, ExternalLink, Copy, CheckCircle, ArrowRight } from "lucide-react"

export function DatabaseUpdateNotice() {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const sqlScript = `-- Script para actualizar la base de datos
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar constraints antiguos
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
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

-- 2. Agregar columnas faltantes
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS es_admin_principal BOOLEAN DEFAULT FALSE;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS fecha_ingreso DATE;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS salario DECIMAL(10,2);
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS notas TEXT;

-- 3. Crear nuevos constraints
ALTER TABLE empleados 
ADD CONSTRAINT chk_empleados_estado_v3 
CHECK (estado IN ('activo', 'inactivo', 'vacaciones'));

ALTER TABLE empleados 
ADD CONSTRAINT chk_empleados_cargo_v3 
CHECK (cargo IN ('Dueño', 'Administrador', 'Gerente', 'Mesero', 'Cocinero', 'Bartender', 'Cajero', 'Limpieza'));

-- 4. Crear tabla de secciones si no existe
CREATE TABLE IF NOT EXISTS secciones_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50),
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Insertar secciones básicas
INSERT INTO secciones_sistema (nombre, descripcion, icono, activa) VALUES
    ('Dashboard', 'Panel principal del sistema', 'dashboard', true),
    ('Empleados', 'Gestión de empleados y permisos', 'users', true),
    ('Inventario', 'Control de inventario y stock', 'package', true),
    ('Menús', 'Gestión de menús y productos', 'menu', true),
    ('POS', 'Punto de venta y cajas', 'cash-register', true),
    ('Reservas', 'Sistema de reservas', 'calendar', true),
    ('Configuración', 'Configuración del restaurante', 'settings', true)
ON CONFLICT (nombre) DO NOTHING;

-- 6. Crear tabla de permisos si no existe
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

SELECT 'Script ejecutado correctamente' as resultado;`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript)
      setCopied(true)
      toast({
        title: "Script copiado",
        description: "El script SQL ha sido copiado al portapapeles.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo copiar el script al portapapeles.",
      })
    }
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">Actualización de Base de Datos Requerida</AlertTitle>
      <AlertDescription className="text-orange-700 mt-2">
        <p className="mb-4">
          Tu base de datos necesita ser actualizada para funcionar correctamente con la nueva versión del sistema. Sigue
          estos pasos para completar la actualización:
        </p>

        <Card className="bg-white border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Pasos para Actualizar
            </CardTitle>
            <CardDescription>Ejecuta estos pasos en orden para actualizar tu base de datos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Paso 1 */}
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                1
              </Badge>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Abrir Supabase Dashboard</h4>
                <p className="text-sm text-muted-foreground mb-2">Ve a tu proyecto en Supabase y abre el SQL Editor</p>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Abrir Supabase
                  </a>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Paso 2 */}
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                2
              </Badge>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Copiar y Ejecutar Script</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Copia el script SQL y ejecútalo en el SQL Editor de Supabase
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    {copied ? <CheckCircle className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copied ? "Copiado" : "Copiar Script"}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Paso 3 */}
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                3
              </Badge>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Recargar la Aplicación</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Una vez ejecutado el script, recarga la página para aplicar los cambios
                </p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Recargar Página
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Script SQL */}
        <Card className="bg-gray-50 border-gray-200 mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Script SQL para Ejecutar</CardTitle>
            <CardDescription>Copia este script completo y ejecútalo en Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-3 rounded border overflow-x-auto max-h-40">
              <code>{sqlScript}</code>
            </pre>
          </CardContent>
        </Card>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>💡 Nota:</strong> Este proceso es seguro y no eliminará tus datos existentes. Solo actualiza la
            estructura de la base de datos para soportar las nuevas funcionalidades.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  )
}
