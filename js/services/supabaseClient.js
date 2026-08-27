// Configuración de Supabase para E-hook
// Pega aquí la URL y ANON_KEY que obtendrás en tu panel de Supabase (supabase.com)

export const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
export const SUPABASE_ANON_KEY = 'TU-ANON-KEY-AQUI';

let supabaseClient = null;

export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  const hasConfig = SUPABASE_URL && 
                    !SUPABASE_URL.includes('TU-PROYECTO') && 
                    SUPABASE_ANON_KEY && 
                    !SUPABASE_ANON_KEY.includes('TU-ANON-KEY');

  if (window.supabase && hasConfig) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ Supabase conectado exitosamente.');
    } catch (err) {
      console.warn('⚠️ Error al inicializar Supabase:', err);
    }
  }

  return supabaseClient;
}

export function isSupabaseReady() {
  return getSupabase() !== null;
}
