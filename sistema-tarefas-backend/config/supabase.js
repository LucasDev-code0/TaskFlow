import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

console.log("URL do Supabase:", supabaseUrl);
console.log("Chave carregada:", Boolean(supabaseKey));

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Credenciais do Supabase não configuradas!");
}

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
);