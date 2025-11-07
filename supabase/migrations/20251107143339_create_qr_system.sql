/*
  # Sistema de Códigos QR y Registros

  1. Nuevas Tablas
    - `qr_codes`
      - `id` (uuid, primary key) - Identificador único del código QR
      - `code` (text, unique) - Código único para la URL del QR
      - `destination_url` (text) - URL de destino (copeba.com.gt)
      - `created_at` (timestamp) - Fecha de creación
      - `is_active` (boolean) - Estado activo/inactivo del QR
    
    - `registrations`
      - `id` (uuid, primary key) - Identificador único del registro
      - `qr_code_id` (uuid, foreign key) - Referencia al código QR usado
      - `name` (text) - Nombre del visitante
      - `phone` (text) - Número de teléfono del visitante
      - `registered_at` (timestamp) - Fecha y hora del registro
      - `ip_address` (text, optional) - Dirección IP del visitante

  2. Seguridad
    - Habilitar RLS en ambas tablas
    - Permitir lectura pública de qr_codes activos
    - Permitir inserción pública de registrations
    - Permitir lectura y escritura completa para usuarios autenticados (admin)

  Notas Importantes:
    - Los códigos QR nunca expiran (no hay fecha de vencimiento)
    - Los registros se mantienen indefinidamente para auditoría
    - Sistema diseñado para recopilar datos antes de redirección
*/

-- Crear tabla de códigos QR
CREATE TABLE IF NOT EXISTS qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  destination_url text NOT NULL DEFAULT 'https://copeba.com.gt/',
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Crear tabla de registros
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id uuid REFERENCES qr_codes(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  registered_at timestamptz DEFAULT now(),
  ip_address text
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code);
CREATE INDEX IF NOT EXISTS idx_registrations_qr_code_id ON registrations(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_registrations_registered_at ON registrations(registered_at DESC);

-- Habilitar RLS
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Políticas para qr_codes
-- Cualquiera puede leer códigos QR activos
CREATE POLICY "Anyone can view active QR codes"
  ON qr_codes FOR SELECT
  USING (is_active = true);

-- Usuarios autenticados pueden ver todos los códigos QR
CREATE POLICY "Authenticated users can view all QR codes"
  ON qr_codes FOR SELECT
  TO authenticated
  USING (true);

-- Usuarios autenticados pueden insertar códigos QR
CREATE POLICY "Authenticated users can insert QR codes"
  ON qr_codes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Usuarios autenticados pueden actualizar códigos QR
CREATE POLICY "Authenticated users can update QR codes"
  ON qr_codes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Usuarios autenticados pueden eliminar códigos QR
CREATE POLICY "Authenticated users can delete QR codes"
  ON qr_codes FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para registrations
-- Cualquiera puede insertar registros (público)
CREATE POLICY "Anyone can insert registrations"
  ON registrations FOR INSERT
  WITH CHECK (true);

-- Usuarios autenticados pueden ver todos los registros
CREATE POLICY "Authenticated users can view all registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (true);

-- Usuarios autenticados pueden actualizar registros
CREATE POLICY "Authenticated users can update registrations"
  ON registrations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Usuarios autenticados pueden eliminar registros
CREATE POLICY "Authenticated users can delete registrations"
  ON registrations FOR DELETE
  TO authenticated
  USING (true);
