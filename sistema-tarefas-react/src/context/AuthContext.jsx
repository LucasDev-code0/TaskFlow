import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Verifica se já existe uma sessão ativa.
    async function verificarSessao() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Erro ao verificar sessão:", error.message);
      }

      setUsuario(data?.session?.user ?? null);
      setCarregando(false);
    }

    verificarSessao();

    // Acompanha login, logout e alterações na sessão.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      setUsuario(session?.user ?? null);
      setCarregando(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}