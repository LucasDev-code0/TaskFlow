import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";

import { supabase } from "../services/supabase";
import "../styles/cadastro.css";

function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function criarConta(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setCarregando(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: {
            nome: nome.trim()
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        setSucesso("Conta criada com sucesso! Redirecionando...");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setSucesso(
          "Cadastro realizado! Confira seu e-mail para confirmar sua conta."
        );
      }

    } catch (error) {
      setErro(error.message || "Não foi possível criar sua conta.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="cadastro-container">

      <section className="cadastro-apresentacao">

        <div className="cadastro-logo">
          <div className="cadastro-logo-icon">T</div>
          <span>TaskFlow</span>
        </div>

        <div className="cadastro-texto">

          <span className="cadastro-etiqueta">
            COMECE SUA JORNADA
          </span>

          <h1>
            Sua produtividade começa com uma
            <span> nova organização.</span>
          </h1>

          <p>
            Crie sua conta e tenha uma plataforma completa para
            organizar suas tarefas, acompanhar resultados e
            alcançar seus objetivos.
          </p>

          <div className="cadastro-beneficios">
            <div>✓ Organização de tarefas</div>
            <div>✓ Acompanhamento de produtividade</div>
            <div>✓ Relatórios e indicadores</div>
          </div>

        </div>

        <span className="cadastro-rodape">
          © 2026 TaskFlow. Todos os direitos reservados.
        </span>

      </section>

      <section className="cadastro-formulario-area">

        <div className="cadastro-formulario">

          <div className="cadastro-titulo">
            <span>CRIE SUA CONTA</span>
            <h2>Comece gratuitamente</h2>
            <p>Preencha os dados abaixo para criar seu acesso.</p>
          </div>

          <form onSubmit={criarConta}>

            <label>Nome completo</label>

            <div className="campo-cadastro">
              <User size={19} />

              <input
                type="text"
                placeholder="Digite seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <label>E-mail</label>

            <div className="campo-cadastro">
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

            <div className="campo-cadastro">
              <LockKeyhole size={19} />

              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Crie uma senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={6}
                required
              />

              <button
                type="button"
                className="cadastro-mostrar-senha"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            <label>Confirmar senha</label>

            <div className="campo-cadastro">
              <LockKeyhole size={19} />

              <input
                type={mostrarConfirmacao ? "text" : "password"}
                placeholder="Digite a senha novamente"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                minLength={6}
                required
              />

              <button
                type="button"
                className="cadastro-mostrar-senha"
                onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
              >
                {mostrarConfirmacao ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {erro && (
              <div className="mensagem-erro">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="mensagem-sucesso">
                {sucesso}
              </div>
            )}

            <button
              type="submit"
              className="botao-cadastro"
              disabled={carregando}
            >
              {carregando ? "Criando conta..." : "Criar minha conta"}
            </button>

          </form>

          <div className="login-link">
            Já possui uma conta?
            <Link to="/"> Fazer login</Link>
          </div>

        </div>

      </section>

    </main>
  );
}

export default Cadastro;