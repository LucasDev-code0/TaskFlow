import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { usuario, carregando } = useAuth();

  // Aguarda a verificação da sessão.
  if (carregando) {
    return <div>Verificando autenticação...</div>;
  }

  // Se não estiver logado, volta para o login.
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  // Se estiver autenticado, renderiza a página.
  return children;
}

export default ProtectedRoute;