import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle2,
  Clock
} from "lucide-react";

import "../styles/calendar.css";

function Calendar({ tarefas, onEditar }) {
  const [mesAtual, setMesAtual] = useState(new Date());

  const [diaSelecionado, setDiaSelecionado] = useState(
    new Date().getDate()
  );

  const ano = mesAtual.getFullYear();
  const mes = mesAtual.getMonth();

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();

  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  function formatarData(ano, mes, dia) {
    return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  }

  function mudarMes(direcao) {
    setMesAtual(new Date(ano, mes + direcao, 1));
    setDiaSelecionado(1);
  }

  const tarefasDoDia = tarefas.filter((tarefa) => {
    return tarefa.data_vencimento === formatarData(
      ano,
      mes,
      diaSelecionado
    );
  });

  const tarefasDoMes = tarefas.filter((tarefa) => {
    if (!tarefa.data_vencimento) return false;

    const [anoTarefa, mesTarefa] = tarefa.data_vencimento
      .split("-")
      .map(Number);

    return anoTarefa === ano && mesTarefa === mes + 1;
  });

  return (
    <section className="calendar-section" id="calendario">

      <div className="calendar-heading">
        <div>
          <span className="calendar-subtitle">ORGANIZAÇÃO</span>
          <h2>Calendário de tarefas</h2>
          <p>Visualize seus compromissos e vencimentos.</p>
        </div>

        <CalendarDays size={28} />
      </div>

      <div className="calendar-layout">

        <div className="calendar-box">

          <div className="calendar-navigation">

            <button onClick={() => mudarMes(-1)}>
              <ChevronLeft size={20} />
            </button>

            <h3>
              {nomesMeses[mes]} {ano}
            </h3>

            <button onClick={() => mudarMes(1)}>
              <ChevronRight size={20} />
            </button>

          </div>

          <div className="calendar-grid">

            {diasSemana.map((dia) => (
              <div className="calendar-weekday" key={dia}>
                {dia}
              </div>
            ))}

            {Array.from({ length: primeiroDia }).map((_, index) => (
              <div className="calendar-empty" key={`vazio-${index}`} />
            ))}

            {Array.from({ length: totalDias }).map((_, index) => {
              const dia = index + 1;

              const data = formatarData(ano, mes, dia);

              const tarefasDoDiaCalendario = tarefas.filter(
                (tarefa) => tarefa.data_vencimento === data
              );

              const temTarefa = tarefasDoDiaCalendario.length > 0;

              const hoje = new Date();

              const ehHoje =
                dia === hoje.getDate() &&
                mes === hoje.getMonth() &&
                ano === hoje.getFullYear();

              return (
                <button
                  key={dia}
                  className={`
                    calendar-day
                    ${diaSelecionado === dia ? "selected" : ""}
                    ${ehHoje ? "today" : ""}
                    ${temTarefa ? "has-tasks" : ""}
                  `}
                  onClick={() => setDiaSelecionado(dia)}
                >
                  <span>{dia}</span>

                  {temTarefa && (
                    <span className="calendar-dot">
                      {tarefasDoDiaCalendario.length}
                    </span>
                  )}
                </button>
              );
            })}

          </div>

          <div className="calendar-legend">
            <span>
              <i className="legend-today"></i>
              Hoje
            </span>

            <span>
              <i className="legend-task"></i>
              Com tarefas
            </span>
          </div>

        </div>

        <div className="calendar-tasks">

          <div className="calendar-tasks-heading">
            <div>
              <span>ATIVIDADES DO DIA</span>

              <h3>
                {String(diaSelecionado).padStart(2, "0")}/
                {String(mes + 1).padStart(2, "0")}/{ano}
              </h3>
            </div>

            <span className="calendar-task-count">
              {tarefasDoDia.length}
            </span>
          </div>

          {tarefasDoDia.length === 0 ? (
            <div className="calendar-empty-state">
              <CalendarDays size={35} />
              <p>Nenhuma tarefa com vencimento neste dia.</p>
            </div>
          ) : (
            <div className="calendar-task-list">

              {tarefasDoDia.map((tarefa) => (
            <div
              className="calendar-task-item"
              key={tarefa.id}
              onClick={() => onEditar(tarefa)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") onEditar(tarefa);
              }}
            >

                  {tarefa.concluida ? (
                    <CheckCircle2 size={19} className="calendar-done" />
                  ) : (
                    <Clock size={19} className="calendar-pending" />
                  )}

                  <div>
                    <strong>{tarefa.titulo}</strong>

                    <span>
                      {tarefa.concluida ? "Concluída" : "Pendente"}
                    </span>
                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

      <div className="calendar-month-summary">
        <CalendarDays size={18} />

        <span>
          Este mês possui <strong>{tarefasDoMes.length}</strong> tarefas com vencimento.
        </span>
      </div>

    </section>
  );
}

export default Calendar;