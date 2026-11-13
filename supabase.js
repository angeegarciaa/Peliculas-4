
const SUPABASE_URL = "https://srsdoofbtvfakkwfnhhe.supabase.co";

const SUPABASE_KEY = "sb_publishable_AMe9sBslEVYsc4OU45nsbw_LJHSFIKe";

const { createClient } = window.supabase;

window.supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Supabase conectado correctamente");
