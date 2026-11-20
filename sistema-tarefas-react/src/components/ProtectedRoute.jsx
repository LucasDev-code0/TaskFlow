import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  const { usuario, carregando } = useAuth();

  // Aguarda a verificação da sessão.
  if (carregando) {
    return <div>Verificando autenticação...</div>;
  }

  // Se não estiver logado, volta para o login.
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  // Se estiver autenticado, permite acessar a página.
  return <Outlet />;
}

export default ProtectedRoute;