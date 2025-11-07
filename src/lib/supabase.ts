import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type QRCode = {
  id: string;
  code: string;
  destination_url: string;
  created_at: string;
  is_active: boolean;
};

export type Registration = {
  id: string;
  qr_code_id: string;
  name: string;
  phone: string;
  registered_at: string;
  ip_address?: string;
};
