import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Clock,
  CheckCircle2,
  ListTodo
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { supabase } from "../services/supabase";

import {
  listarTarefas,
  cadastrarTarefa,
  alterarConclusao,
  editarTarefa,
  excluirTarefa
} from "../services/api";

import TaskItem from "../components/TaskItem";
import ProductivityCharts from "../components/ProductivityCharts";
import Calendar from "../components/Calendar";

import "../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [tarefas, setTarefas] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [periodoRelatorio, setPeriodoRelatorio] = useState("30");
  const [filtroPrazo, setFiltroPrazo] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("recentes");
  const [pesquisa, setPesquisa] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [tarefaEditando, setTarefaEditando] = useState(null);

  // IDENTIFICAR SITUAÇÃO DO PRAZO
  function obterSituacaoPrazo(tarefa) {
    if (tarefa.concluida || !tarefa.data_vencimento) {
      return "sem-prazo";
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const [ano, mes, dia] = tarefa.data_vencimento
      .split("-")
      .map(Number);

    const vencimento = new Date(ano, mes - 1, dia);

    if (vencimento < hoje) {
      return "atrasada";
    }

    if (vencimento.getTime() === hoje.getTime()) {
      return "hoje";
    }

    return "futura";
  }

  // FILTRAR E ORDENAR TAREFAS
  const tarefasFiltradas = tarefas
    .filter((tarefa) => {
      const termo = pesquisa.toLowerCase().trim();

      const correspondePesquisa =
        (tarefa.titulo || "").toLowerCase().includes(termo) ||
        (tarefa.descricao || "").toLowerCase().includes(termo);

      if (!correspondePesquisa) return false;

      // FILTRO DE CONCLUSÃO
      if (filtro === "pendentes" && tarefa.concluida) {
        return false;
      }

      if (filtro === "concluidas" && !tarefa.concluida) {
        return false;
      }

      // FILTRO DE PRAZO
      const situacaoPrazo = obterSituacaoPrazo(tarefa);

      if (
        filtroPrazo === "atrasadas" &&
        situacaoPrazo !== "atrasada"
      ) {
        return false;
      }

      if (
        filtroPrazo === "hoje" &&
        situacaoPrazo !== "hoje"
      ) {
        return false;
      }

      if (
        filtroPrazo === "proximas" &&
        situacaoPrazo !== "futura"
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // MAIS RECENTES
      if (ordenacao === "recentes") {
        return new Date(b.created_at) - new Date(a.created_at);
      }

      // MAIS ANTIGAS
      if (ordenacao === "antigas") {
        return new Date(a.created_at) - new Date(b.created_at);
      }

      // ORDEM ALFABÉTICA
      if (ordenacao === "alfabetica") {
        return (a.titulo || "").localeCompare(
          b.titulo || "",
          "pt-BR"
        );
      }

      return 0;
    });

  // BUSCAR TAREFAS
  async function carregarTarefas() {
    try {
      setCarregando(true);
      setErro("");

      const resultado = await listarTarefas();

      setTarefas(resultado);

    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      setErro(error.message);

    } finally {
      setCarregando(false);
    }
  }

  // CADASTRAR OU EDITAR TAREFA
  async function salvarTarefa(event) {
    event.preventDefault();

    if (!titulo.trim()) {
      alert("Informe o título da tarefa.");
      return;
    }

    try {
      setSalvando(true);

      const dadosTarefa = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        data_vencimento: dataVencimento || null
      };

      if (tarefaEditando) {
        await editarTarefa(tarefaEditando.id, {
          ...dadosTarefa,
          concluida: tarefaEditando.concluida
        });
      } else {
        await cadastrarTarefa(dadosTarefa);
      }

      setTitulo("");
      setDescricao("");
      setDataVencimento("");
      setTarefaEditando(null);
      setModalAberto(false);

      await carregarTarefas();

      alert(
        tarefaEditando
          ? "Tarefa atualizada com sucesso!"
          : "Tarefa cadastrada com sucesso!"
      );

    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      alert(error.message);

    } finally {
      setSalvando(false);
    }
  }

  // ALTERAR CONCLUSÃO
  async function handleAlterarConclusao(id, concluida) {
    try {
      await alterarConclusao(id, concluida);
      await carregarTarefas();

    } catch (error) {
      console.error("Erro ao alterar conclusão:", error);
      alert(error.message);
    }
  }

  // ABRIR EDIÇÃO
  function abrirEdicao(tarefa) {
    setTarefaEditando(tarefa);
    setTitulo(tarefa.titulo);
    setDescricao(tarefa.descricao || "");
    setDataVencimento(tarefa.data_vencimento || "");
    setModalAberto(true);
  }

  // EXCLUIR TAREFA
  async function handleExcluirTarefa(id) {
    const confirmar = window.confirm(
      "Tem certeza de que deseja excluir esta tarefa?"
    );

    if (!confirmar) return;

    try {
      await excluirTarefa(id);
      await carregarTarefas();

      alert("Tarefa excluída com sucesso!");

    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      alert(error.message);
    }
  }

  // FECHAR MODAL
  function fecharModal() {
    setModalAberto(false);
    setTitulo("");
    setDescricao("");
    setDataVencimento("");
    setTarefaEditando(null);
  }

  // CARREGAR AO ABRIR DASHBOARD
  useEffect(() => {
    carregarTarefas();
  }, []);

  // FILTRAR TAREFAS POR PERÍODO DO RELATÓRIO

const tarefasPeriodo = tarefas.filter((tarefa) => {
  if (periodoRelatorio === "todos") {
    return true;
  }

  if (!tarefa.created_at) {
    return false;
  }

  const dias = Number(periodoRelatorio);

  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  const dataInicial = new Date();
  dataInicial.setHours(0, 0, 0, 0);
  dataInicial.setDate(dataInicial.getDate() - (dias - 1));

  const dataCriacao = new Date(tarefa.created_at);

  return dataCriacao >= dataInicial && dataCriacao <= hoje;
});

// INDICADORES DO RELATÓRIO

const totalPeriodo = tarefasPeriodo.length;

const concluidasPeriodo = tarefasPeriodo.filter(
  tarefa => tarefa.concluida
).length;

const pendentesPeriodo = totalPeriodo - concluidasPeriodo;

const produtividadePeriodo = totalPeriodo > 0
  ? Math.round((concluidasPeriodo / totalPeriodo) * 100)
  : 0;

  // INDICADORES
  const totalTarefas = tarefas.length;

  const tarefasConcluidas = tarefas.filter(
    tarefa => tarefa.concluida
  ).length;

  const tarefasPendentes = totalTarefas - tarefasConcluidas;

  const produtividade = totalTarefas > 0
    ? Math.round((tarefasConcluidas / totalTarefas) * 100)
    : 0;

  const tarefasAtrasadas = tarefas.filter(
    tarefa => obterSituacaoPrazo(tarefa) === "atrasada"
  ).length;

  // NOTIFICAÇÕES INTELIGENTES

const notificacoes = tarefas.filter((tarefa) => {
  const situacao = obterSituacaoPrazo(tarefa);

  if (
    situacao === "atrasada" ||
    situacao === "hoje"
  ) {
    return true;
  }

  if (situacao === "futura") {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const [ano, mes, dia] = tarefa.data_vencimento
      .split("-")
      .map(Number);

    const vencimento = new Date(ano, mes - 1, dia);

    const diferenca = Math.ceil(
      (vencimento - hoje) / (1000 * 60 * 60 * 24)
    );

    return diferenca <= 3;
  }

  return false;
});

  // SAIR DA CONTA
  async function sairDaConta() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Não foi possível sair da conta.");
      return;
    }

    navigate("/");
  }

  return (
    <div className="dashboard-container">

      <aside className="sidebar">

        <div className="logo">
          <CheckSquare size={28} />
          <h2>TaskFlow</h2>
        </div>

        <span className="menu-label">MENU PRINCIPAL</span>

       <nav>
  <a href="#inicio" className="menu-item">
    <LayoutDashboard size={19} />
    Visão geral
  </a>

  <a href="#tarefas" className="menu-item">
    <ListTodo size={19} />
    Minhas tarefas
  </a>

  <a href="#calendario" className="menu-item">
    <CalendarDays size={19} />
    Calendário
  </a>

  <a href="#relatorios" className="menu-item">
    <BarChart3 size={19} />
    Relatórios
  </a>
</nav>

        <div className="sidebar-bottom">

          <button
            type="button"
            className="menu-item"
            onClick={() => navigate("/configuracoes")}
          >
            <Settings size={19} />
            Configurações
          </button>

          <button
            className="menu-item botao-sair"
            onClick={sairDaConta}
          >
            <LogOut size={19} />
            Sair da conta
          </button>

          <div className="profile">
            <div className="profile-avatar">L</div>

            <div>
              <strong>Lucas Dev</strong>
              <span>Administrador</span>
            </div>
          </div>

        </div>

      </aside>

      <main className="dashboard-main" id="inicio">

        <header className="dashboard-header">

          <div>
            <span className="welcome">PAINEL DE CONTROLE</span>
            <h1>Visão geral</h1>
            <p>Acompanhe suas atividades e produtividade.</p>
          </div>

          <button
            className="new-task-button"
            onClick={() => setModalAberto(true)}
          >
            <Plus size={18} />
            Nova tarefa
          </button>

        </header>

        {/* INDICADORES */}

        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon blue">
              <ListTodo />
            </div>
            <span>Total de tarefas</span>
            <h2>{totalTarefas}</h2>
            <small>Atividades cadastradas</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <CheckCircle2 />
            </div>
            <span>Concluídas</span>
            <h2>{tarefasConcluidas}</h2>
            <small>Tarefas finalizadas</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <Clock />
            </div>
            <span>Pendentes</span>
            <h2>{tarefasPendentes}</h2>
            <small>Aguardando conclusão</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <BarChart3 />
            </div>
            <span>Produtividade</span>
            <h2>{produtividade}%</h2>
            <small>Taxa de conclusão</small>
          </div>

        </section>

        {/* RELATÓRIOS E PRODUTIVIDADE */}

<section className="reports-section" id="relatorios">

  <div className="reports-header">
    <div>
      <h2>Relatórios de produtividade</h2>
      <p>Acompanhe o desempenho das suas atividades.</p>
    </div>

    <select
      value={periodoRelatorio}
      onChange={(e) => setPeriodoRelatorio(e.target.value)}
    >
      <option value="7">Últimos 7 dias</option>
      <option value="30">Últimos 30 dias</option>
      <option value="90">Últimos 90 dias</option>
      <option value="todos">Todo o período</option>
    </select>
  </div>

  <div className="report-cards">

    <div className="report-card">
      <span>Tarefas criadas</span>
      <h3>{totalPeriodo}</h3>
    </div>

    <div className="report-card">
      <span>Tarefas concluídas</span>
      <h3>{concluidasPeriodo}</h3>
    </div>

    <div className="report-card">
      <span>Tarefas pendentes</span>
      <h3>{pendentesPeriodo}</h3>
    </div>

    <div className="report-card">
      <span>Produtividade</span>
      <h3>{produtividadePeriodo}%</h3>
    </div>

  </div>

  <ProductivityCharts tarefas={tarefasPeriodo} />

</section>

        {/* NOTIFICAÇÕES INTELIGENTES */}

<section className="notifications-section">

  <div className="notifications-header">
    <div>
      <h2>Central de notificações</h2>
      <p>Acompanhe tarefas que precisam da sua atenção.</p>
    </div>

    <span className="notification-count">
      {notificacoes.length} avisos
    </span>
  </div>

  <div className="notifications-list">

    {notificacoes.length === 0 ? (

      <div className="notification-empty">
        <CheckCircle2 size={24} />
        <p>Você está em dia! Nenhuma tarefa precisa de atenção.</p>
      </div>

    ) : (

      notificacoes.map((tarefa) => {
        const situacao = obterSituacaoPrazo(tarefa);

        let mensagem = "";
        let classe = "";

        if (situacao === "atrasada") {
          mensagem = "Esta tarefa está atrasada.";
          classe = "notification-overdue";
        } else if (situacao === "hoje") {
          mensagem = "Esta tarefa vence hoje.";
          classe = "notification-today";
        } else {
          mensagem = "Esta tarefa vence nos próximos 3 dias.";
          classe = "notification-upcoming";
        }

        return (
          <div
            key={tarefa.id}
            className={`notification-item ${classe}`}
            onClick={() => abrirEdicao(tarefa)}
          >
            <div className="notification-indicator"></div>

            <div className="notification-content">
              <strong>{tarefa.titulo}</strong>
              <p>{mensagem}</p>
            </div>

            <span>Ver tarefa →</span>
          </div>
        );
      })

    )}

  </div>

</section>

        {/* CALENDÁRIO */}

      <div id="calendario">
  <Calendar
    tarefas={tarefas}
    onEditar={abrirEdicao}
  />
</div>

        {/* PESQUISA */}

        <div className="task-search">
          <input
            type="text"
            placeholder="Pesquisar por título ou descrição..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>

        {/* FILTROS DE CONCLUSÃO */}

        <div className="task-filters">

          <button
            className={filtro === "todas" ? "active" : ""}
            onClick={() => setFiltro("todas")}
          >
            Todas
          </button>

          <button
            className={filtro === "pendentes" ? "active" : ""}
            onClick={() => setFiltro("pendentes")}
          >
            Pendentes
          </button>

          <button
            className={filtro === "concluidas" ? "active" : ""}
            onClick={() => setFiltro("concluidas")}
          >
            Concluídas
          </button>

        </div>

        {/* FILTROS DE PRAZO */}

        <div className="deadline-filters">

          <button
            className={filtroPrazo === "todos" ? "active" : ""}
            onClick={() => setFiltroPrazo("todos")}
          >
            Todos os prazos
          </button>

          <button
            className={filtroPrazo === "atrasadas" ? "active" : ""}
            onClick={() => setFiltroPrazo("atrasadas")}
          >
            Atrasadas ({tarefasAtrasadas})
          </button>

          <button
            className={filtroPrazo === "hoje" ? "active" : ""}
            onClick={() => setFiltroPrazo("hoje")}
          >
            Vencem hoje
          </button>

          <button
            className={filtroPrazo === "proximas" ? "active" : ""}
            onClick={() => setFiltroPrazo("proximas")}
          >
            Próximas
          </button>

        </div>

        {/* ORDENAÇÃO */}

        <div className="task-sorting">
          <label htmlFor="ordenacao">Ordenar por:</label>

          <select
            id="ordenacao"
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
          >
            <option value="recentes">Mais recentes</option>
            <option value="antigas">Mais antigas</option>
            <option value="alfabetica">Ordem alfabética</option>
          </select>
        </div>

        {/* LISTA DE TAREFAS */}

        <section className="content-card" id="tarefas">

          <div className="section-heading">

            <div>
              <h2>Minhas tarefas</h2>
              <p>Gerencie suas atividades recentes.</p>
            </div>

            <button
              className="filter-button"
              onClick={carregarTarefas}
            >
              Atualizar
            </button>

          </div>

          {carregando && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Carregando suas tarefas...</p>
            </div>
          )}

          {!carregando && erro && (
            <div className="empty-state">
              <h3>Não foi possível carregar as tarefas</h3>
              <p>{erro}</p>

              <button
                className="filter-button"
                onClick={carregarTarefas}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!carregando && !erro && tarefasFiltradas.length === 0 && (
            <div className="empty-state">
              <ListTodo size={42} />

              <h3>
                {tarefas.length === 0
                  ? "Você ainda não possui tarefas"
                  : "Nenhuma tarefa encontrada"}
              </h3>

              <p>
                {tarefas.length === 0
                  ? "Cadastre sua primeira tarefa para começar."
                  : "Não existem tarefas com os filtros selecionados."}
              </p>
            </div>
          )}

          {!carregando && !erro && tarefasFiltradas.length > 0 && (
            <div className="task-list">

              {tarefasFiltradas.map(tarefa => (
                <TaskItem
                  key={tarefa.id}
                  tarefa={tarefa}
                  onAlterarConclusao={handleAlterarConclusao}
                  onEditar={abrirEdicao}
                  onExcluir={handleExcluirTarefa}
                />
              ))}

            </div>
          )}

        </section>

        {/* MODAL */}

        {modalAberto && (
          <div className="modal-overlay">

            <div className="modal-content">

              <div className="modal-header">

                <div>
                  <h2>
                    {tarefaEditando ? "Editar tarefa" : "Nova tarefa"}
                  </h2>
                  <p>Preencha os dados da atividade.</p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={fecharModal}
                >
                  ×
                </button>

              </div>

              <form onSubmit={salvarTarefa}>

                <div className="form-group">
                  <label htmlFor="titulo">Título da tarefa</label>

                  <input
                    id="titulo"
                    type="text"
                    placeholder="Ex: Desenvolver página inicial"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="descricao">Descrição</label>

                  <textarea
                    id="descricao"
                    placeholder="Descreva os detalhes da tarefa..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dataVencimento">
                    Data de vencimento
                  </label>

                  <input
                    id="dataVencimento"
                    type="date"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                  />
                </div>

                <div className="modal-actions">

                  <button
                    type="button"
                    className="filter-button"
                    onClick={fecharModal}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="new-task-button"
                    disabled={salvando}
                  >
                    {salvando
                      ? "Salvando..."
                      : tarefaEditando
                        ? "Salvar alterações"
                        : "Salvar tarefa"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}

export default Dashboard;