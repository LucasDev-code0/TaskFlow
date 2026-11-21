import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import {
  User,
  Lock,
  Bell,
  Palette,
  Camera
} from "lucide-react";

function Configuracoes() {
  const [usuario, setUsuario] = useState(null);
  const [nome, setNome] = useState("");
  const [foto, setFoto] = useState("");
  const [tema, setTema] = useState("claro");
  const [notificacoes, setNotificacoes] = useState(true);

  useEffect(() => {
    async function carregarPerfil() {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setUsuario(data.user);
        setNome(
          data.user.user_metadata?.nome ||
          data.user.user_metadata?.name ||
          ""
        );
        setFoto(data.user.user_metadata?.avatar_url || "");
      }
    }

    carregarPerfil();
  }, []);

  async function salvarPerfil() {
    const { error } = await supabase.auth.updateUser({
      data: {
        nome,
        avatar_url: foto
      }
    });

    if (error) {
      alert("Erro ao salvar perfil: " + error.message);
      return;
    }

    alert("Perfil atualizado com sucesso!");
  }

  return (
    <main className="settings-container">
      <header className="settings-header">
        <h1>Configurações</h1>
        <p>Gerencie suas preferências e informações pessoais.</p>
      </header>

      <section className="settings-card">
        <h2><User size={20} /> Meu perfil</h2>

        <div className="profile-settings">
          <div className="settings-avatar">
            {foto ? (
              <img src={foto} alt="Foto de perfil" />
            ) : (
              <User size={35} />
            )}
          </div>

          <div>
            <label htmlFor="foto">URL da foto de perfil</label>
            <input
              id="foto"
              value={foto}
              onChange={(e) => setFoto(e.target.value)}
              placeholder="Cole o endereço da sua foto"
            />
          </div>
        </div>

        <label>Nome</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome"
        />

        <label>E-mail</label>
        <input
          value={usuario?.email || ""}
          disabled
        />

        <button onClick={salvarPerfil}>
          Salvar alterações
        </button>
      </section>

      <section className="settings-card">
        <h2><Lock size={20} /> Segurança</h2>
        <p>Alteração de senha será configurada nesta área.</p>
      </section>

      <section className="settings-card">
        <h2><Bell size={20} /> Notificações</h2>

        <label>
          <input
            type="checkbox"
            checked={notificacoes}
            onChange={(e) => setNotificacoes(e.target.checked)}
          />
          Ativar notificações
        </label>
      </section>

      <section className="settings-card">
        <h2><Palette size={20} /> Aparência</h2>

        <select
          value={tema}
          onChange={(e) => setTema(e.target.value)}
        >
          <option value="claro">Tema claro</option>
          <option value="escuro">Tema escuro</option>
        </select>

        <p>
          A aplicação do tema será conectada na próxima etapa.
        </p>
      </section>
    </main>
  );
}

export default Configuracoes;