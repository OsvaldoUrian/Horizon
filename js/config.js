/* =========================================================
   CLUEGG — konfigurasi Supabase
   Isi dari Supabase: Project Settings > API (atau "API Keys").
   - supabaseUrl : Project URL, contoh https://abcdefgh.supabase.co
   - supabaseKey : anon / publishable key (BOLEH publik, dilindungi RLS)

   JANGAN PERNAH menaruh "service_role" / "secret" key di sini.
   Kalau dikosongkan, website tetap jalan dalam mode tamu (demo).
   ========================================================= */
window.CLUEGG_CONFIG = {
  supabaseUrl: "",
  supabaseKey: ""
};
