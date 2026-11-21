import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import "../styles/configuracoes.css";
import { User, Camera, Save } from "lucide-react";

function Configuracoes() {
  const [usuario, setUsuario] = useState(null);
  const [nome, setNome] = useState("");
  const [foto, setFoto] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    async function carregarPerfil() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) return;

      setUsuario(data.user);
      setNome(
        data.user.user_metadata?.nome ||
        data.user.user_metadata?.name ||
        ""
      );
      setFoto(data.user.user_metadata?.avatar_url || "");
    }

    carregarPerfil();
  }, []);

  function selecionarFoto(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2 MB.");
      return;
    }

    setArquivo(file);
    setFoto(URL.createObjectURL(file));
  }

  async function salvarPerfil() {
    if (!usuario) return;

    setCarregando(true);

    try {
      let urlFoto = usuario.user_metadata?.avatar_url || "";

      if (arquivo) {
        const extensao = arquivo.name.split(".").pop().toLowerCase();
        const caminho = `${usuario.id}/avatar.${extensao}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(caminho, arquivo, {
            upsert: true,
            contentType: arquivo.type
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(caminho);

        urlFoto = `${data.publicUrl}?t=${Date.now()}`;
      }

      const { data, error } = await supabase.auth.updateUser({
        data: {
          nome,
          avatar_url: urlFoto
        }
      });

      if (error) throw error;

      setUsuario(data.user);
      setFoto(urlFoto);
      setArquivo(null);

      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      alert("Erro ao salvar perfil: " + error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="settings-container">
      <header className="settings-header">
        <h1>Configurações</h1>
        <p>Gerencie suas informações pessoais.</p>
      </header>

      <section className="settings-card">
        <h2>
          <User size={20} />
          Meu perfil
        </h2>

        <div className="profile-settings">
          <div className="settings-avatar">
            {foto ? (
              <img src={foto} alt="Foto de perfil" />
            ) : (
              <User size={35} />
            )}
          </div>

          <div className="photo-upload">
            <label htmlFor="foto-perfil" className="upload-button">
              <Camera size={18} />
              Escolher foto
            </label>

            <input
              id="foto-perfil"
              type="file"
              accept="image/*"
              onChange={selecionarFoto}
              hidden
            />

            <small>PNG, JPG ou outra imagem. Máximo de 2 MB.</small>
          </div>
        </div>

        <label htmlFor="nome">Nome</label>
        <input
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome"
        />

        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          value={usuario?.email || ""}
          disabled
        />

        <button
          className="save-button"
          onClick={salvarPerfil}
          disabled={carregando}
        >
          <Save size={18} />
          {carregando ? "Salvando..." : "Salvar alterações"}
        </button>
      </section>
    </main>
  );
}

export default Configuracoes;