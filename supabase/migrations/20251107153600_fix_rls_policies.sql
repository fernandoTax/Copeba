/*
  # Fix RLS Policies for QR System

  1. Changes
    - Update qr_codes table policies to allow public access for INSERT operations
    - Update registrations table policies to allow public access for INSERT operations
    - Keep SELECT policies open for admin dashboard
  
  2. Security
    - Allow anyone to generate QR codes (anon users)
    - Allow anyone to register via QR codes (anon users)
    - Maintain read access for viewing records
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public to insert qr_codes" ON qr_codes;
DROP POLICY IF EXISTS "Allow public to view qr_codes" ON qr_codes;
DROP POLICY IF EXISTS "Allow public to insert registrations" ON registrations;
DROP POLICY IF EXISTS "Allow public to view registrations" ON registrations;

-- QR Codes policies
CREATE POLICY "Allow public to insert qr_codes"
  ON qr_codes
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public to view qr_codes"
  ON qr_codes
  FOR SELECT
  TO anon
  USING (true);

-- Registrations policies
CREATE POLICY "Allow public to insert registrations"
  ON registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public to view registrations"
  ON registrations
  FOR SELECT
  TO anon
  USING (true);
