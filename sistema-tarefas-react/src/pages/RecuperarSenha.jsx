import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

import { supabase } from "../services/supabase";

import "../styles/recuperar-senha.css";

function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function enviarEmail(event) {
    event.preventDefault();

    setErro("");
    setSucesso(false);

    try {
      setCarregando(true);

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/redefinir-senha`
        }
      );

      if (error) {
        throw error;
      }

      setSucesso(true);

    } catch (error) {
      console.error("Erro ao recuperar senha:", error);
      setErro(error.message || "Não foi possível enviar o e-mail.");

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
          <Mail size={28} />
        </div>

        <h1>Esqueceu sua senha?</h1>

        <p>
          Informe o e-mail cadastrado na sua conta.
          Enviaremos um link para você criar uma nova senha.
        </p>

        {!sucesso ? (

          <form onSubmit={enviarEmail}>

            <label htmlFor="email-recuperacao">
              E-mail cadastrado
            </label>

            <input
              id="email-recuperacao"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {erro && (
              <div className="recuperacao-erro">
                {erro}
              </div>
            )}

            <button type="submit" disabled={carregando}>
              {carregando ? "Enviando..." : "Enviar link de recuperação"}
            </button>

          </form>

        ) : (

          <div className="recuperacao-sucesso">
            <strong>Solicitação enviada!</strong>

            <p>
              Se o endereço informado estiver cadastrado,
              você receberá um e-mail com as instruções para
              redefinir sua senha. Verifique também a caixa de spam.
            </p>
          </div>

        )}

        <Link to="/" className="voltar-login">
          <ArrowLeft size={17} />
          Voltar para o login
        </Link>

      </section>

    </main>
  );
}

export default RecuperarSenha;