import {
  Check,
  Circle,
  Pencil,
  Trash2,
  CalendarDays
} from "lucide-react";

import "../styles/task-item.css";

function TaskItem({
  tarefa,
  onAlterarConclusao,
  onEditar,
  onExcluir
}) {
  const concluida = tarefa.concluida;

  function formatarData(data) {
    if (!data) return null;

    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function verificarPrazo(data) {
    if (!data || concluida) return "";

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const [ano, mes, dia] = data.split("-").map(Number);
    const vencimento = new Date(ano, mes - 1, dia);

    if (vencimento < hoje) return "atrasada";
    if (vencimento.getTime() === hoje.getTime()) return "vence-hoje";

    return "no-prazo";
  }

  const prazo = verificarPrazo(tarefa.data_vencimento);

  return (
    <article className={`task-item ${concluida ? "task-completed" : ""}`}>

      <button
        className="task-checkbox"
        onClick={() => onAlterarConclusao(tarefa.id, !concluida)}
        title={concluida ? "Reabrir tarefa" : "Concluir tarefa"}
        aria-label={concluida ? "Reabrir tarefa" : "Concluir tarefa"}
      >
        {concluida ? <Check size={16} /> : <Circle size={19} />}
      </button>

      <div className="task-info">
        <h3>{tarefa.titulo}</h3>

        <p>{tarefa.descricao || "Sem descrição"}</p>

        {tarefa.data_vencimento && (
          <div className={`task-deadline ${prazo}`}>
            <CalendarDays size={15} />

            <span>
              {formatarData(tarefa.data_vencimento)}
            </span>

            {!concluida && prazo === "atrasada" && (
              <strong> • Atrasada</strong>
            )}

            {!concluida && prazo === "vence-hoje" && (
              <strong> • Vence hoje</strong>
            )}

            {!concluida && prazo === "no-prazo" && (
              <strong> • No prazo</strong>
            )}
          </div>
        )}
      </div>

      <div className="task-actions">

        <span className={`task-status ${concluida ? "concluida" : "pendente"}`}>
          {concluida ? "Concluída" : "Pendente"}
        </span>

        <button
          className="task-action-button"
          onClick={() => onEditar(tarefa)}
          title="Editar tarefa"
          aria-label="Editar tarefa"
        >
          <Pencil size={17} />
        </button>

        <button
          className="task-action-button delete"
          onClick={() => onExcluir(tarefa.id)}
          title="Excluir tarefa"
          aria-label="Excluir tarefa"
        >
          <Trash2 size={17} />
        </button>

      </div>
    </article>
  );
}

export default TaskItem;