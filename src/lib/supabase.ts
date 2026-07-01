import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Car {
  id: string;
  name: string;
  brand: string;
  year: number;
  price_per_day: number;
  price_per_week: number | null;
  price_per_month: number | null;
  price_per_year: number | null;
  image_url: string | null;
  images: string[];
  images_3d_exterior: string[];
  images_3d_interior: string[];
  transmission: string;
  fuel_type: string;
  seats: number;
  features: string[];
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  phone_primary: string;
  phone_secondary: string | null;
  whatsapp_number: string;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  tiktok_url: string | null;
  site_name: string;
  address: string | null;
  email: string | null;
  logo_url: string | null;
  hero_bg_light: string | null;
  hero_bg_dark: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminCredentials {
  id: string;
  username: string;
  email: string | null;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface AllowedIP {
  id: string;
  ip_address: string;
  label: string;
  created_at: string;
}

export interface Rental {
  id: string;
  car_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  start_date: string;
  end_date: string;
  notes: string | null;
  status: 'active' | 'completed' | 'cancelled';
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}
