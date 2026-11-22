import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail
} from "lucide-react";

import { supabase } from "../services/supabase";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const [erro, setErro] = useState("");

  async function fazerLogin(event) {
    event.preventDefault();
    setErro("");

    try {
      setCarregando(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha
      });

      if (error) throw error;

      if (data.user) {
        navigate("/dashboard");
      }

    } catch (error) {
      setErro(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-container">

      <section className="login-apresentacao">

        <div className="login-logo">
          <div className="logo-icon">T</div>
          <span>TaskFlow</span>
        </div>

        <div className="apresentacao-conteudo">

          <span className="etiqueta">
            GESTÃO INTELIGENTE
          </span>

          <h1>
            Organize suas tarefas.
            <span> Alcance seus objetivos.</span>
          </h1>

          <p>
            Tenha controle sobre suas atividades, acompanhe seu progresso
            e transforme sua produtividade com o TaskFlow.
          </p>

          <div className="apresentacao-indicadores">

            <div>
              <strong>+100%</strong>
              <span>Organização</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Controle</span>
            </div>

            <div>
              <strong>∞</strong>
              <span>Possibilidades</span>
            </div>

          </div>

        </div>

        <span className="texto-rodape">
          © 2026 TaskFlow. Todos os direitos reservados.
        </span>

      </section>

      <section className="login-formulario-area">

        <div className="login-formulario">

          <div className="formulario-titulo">

            <span>SEJA BEM-VINDO</span>

            <h2>Acesse sua conta</h2>

            <p>
              Entre para continuar gerenciando suas tarefas.
            </p>

          </div>

          <form onSubmit={fazerLogin}>

            <label>E-mail</label>

            <div className="campo-login">

              <Mail size={19} />

              <input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

            </div>

            <label>Senha</label>

            <div className="campo-login">

              <LockKeyhole size={19} />

              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />

              <button
                type="button"
                className="mostrar-senha"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>

            </div>

            {erro && (
              <div className="mensagem-erro">
                {erro}
              </div>
            )}

            <div className="opcoes-login">

              <label className="lembrar-login">
                <input type="checkbox" />
                Lembrar de mim
              </label>

              <Link to="/recuperar-senha">
                Esqueceu a senha?
              </Link>

            </div>

            <button
              type="submit"
              className="botao-login"
              disabled={carregando}
            >
              {carregando ? "Entrando..." : "Entrar na plataforma"}
            </button>

          </form>

          <div className="cadastro-link">
            Ainda não possui uma conta?
            <Link to="/cadastro"> Criar conta</Link>
          </div>

        </div>

      </section>

    </main>
  );
}

export default Login;