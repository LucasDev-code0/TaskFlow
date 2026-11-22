import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { LockKeyhole, ArrowLeft } from "lucide-react";

import { supabase } from "../services/supabase";

import "../styles/recuperar-senha.css";

function RedefinirSenha() {
  const navigate = useNavigate();

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function atualizarSenha(event) {
    event.preventDefault();

    setErro("");

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }

    try {
      setCarregando(true);

      const { error } = await supabase.auth.updateUser({
        password: senha
      });

      if (error) {
        throw error;
      }

      setSucesso(true);

      await supabase.auth.signOut();

    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      setErro(
        "Não foi possível atualizar sua senha. Solicite um novo link de recuperação."
      );

    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="recuperacao-container">

      <section className="recuperacao-card">

        <div className="recuperacao-logo">
          <span>T</span>
          TaskFlow
        </div>

        <div className="recuperacao-icon">
          <LockKeyhole size={28} />
        </div>

        <h1>Crie uma nova senha</h1>

        <p>
          Escolha uma nova senha para acessar sua conta TaskFlow.
        </p>

        {!sucesso ? (

          <form onSubmit={atualizarSenha}>

            <label htmlFor="nova-senha">
              Nova senha
            </label>

            <input
              id="nova-senha"
              type="password"
              placeholder="Digite sua nova senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={6}
              required
            />

            <label htmlFor="confirmar-senha">
              Confirmar nova senha
            </label>

            <input
              id="confirmar-senha"
              type="password"
              placeholder="Digite novamente sua senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              minLength={6}
              required
            />

            {erro && (
              <div className="recuperacao-erro">
                {erro}
              </div>
            )}

            <button type="submit" disabled={carregando}>
              {carregando ? "Atualizando..." : "Salvar nova senha"}
            </button>

          </form>

        ) : (

          <div className="recuperacao-sucesso">
            <strong>Senha atualizada com sucesso!</strong>

            <p>
              Sua senha foi alterada. Agora você pode entrar
              no TaskFlow utilizando sua nova senha.
            </p>

            <button onClick={() => navigate("/")}>
              Ir para o login
            </button>
          </div>

        )}

        {!sucesso && (
          <Link to="/" className="voltar-login">
            <ArrowLeft size={17} />
            Voltar para o login
          </Link>
        )}

      </section>

    </main>
  );
}

export default RedefinirSenha;