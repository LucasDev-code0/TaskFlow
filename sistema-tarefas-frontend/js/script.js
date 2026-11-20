// ============================================
// 1. CONFIGURAÇÕES
// ============================================

const API_URL = "http://localhost:3000/api/tarefas";

let tarefas = [];
let filtroAtual = "todas";


// ============================================
// 2. ELEMENTOS HTML
// ============================================

const listaTarefas = document.getElementById("listaTarefas");

const formTarefa = document.getElementById("formTarefa");

const tituloInput = document.getElementById("tituloTarefa");

const descricaoInput = document.getElementById("descricaoTarefa");

const totalTarefas = document.getElementById("totalTarefas");

const tarefasConcluidas = document.getElementById("tarefasConcluidas");

const tarefasPendentes = document.getElementById("tarefasPendentes");

const produtividade = document.getElementById("produtividade");

const currentDate = document.getElementById("currentDate");


// ============================================
// 3. FUNÇÃO PARA ESCAPAR HTML
// ============================================

function escaparHTML(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, caractere => {
        const entidades = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entidades[caractere];
    });
}


// ============================================
// 4. DATA ATUAL
// ============================================

function mostrarData() {
    const data = new Date();

    currentDate.textContent = data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}


// ============================================
// 5. BUSCAR TAREFAS NA API
// ============================================

async function buscarTarefas() {
    try {
        listaTarefas.innerHTML = `
            <p class="loading-message">Carregando tarefas...</p>
        `;

        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error("Não foi possível buscar as tarefas.");
        }

        tarefas = await resposta.json();

        atualizarIndicadores();

        renderizarTarefas();

    } catch (erro) {
        console.error("Erro ao buscar tarefas:", erro);

        listaTarefas.innerHTML = `
            <p class="error-message">
                Não foi possível carregar as tarefas.
                Verifique se o servidor está funcionando.
            </p>
        `;
    }
}


// ============================================
// 6. ATUALIZAR INDICADORES
// ============================================

function atualizarIndicadores() {

    const total = tarefas.length;

    const concluidas = tarefas.filter(tarefa => tarefa.concluida).length;

    const pendentes = total - concluidas;

    const percentual = total > 0
        ? Math.round((concluidas / total) * 100)
        : 0;

    totalTarefas.textContent = total;

    tarefasConcluidas.textContent = concluidas;

    tarefasPendentes.textContent = pendentes;

    produtividade.textContent = `${percentual}%`;
}


// ============================================
// 7. MOSTRAR TAREFAS NA TELA
// ============================================

function renderizarTarefas() {

    let tarefasFiltradas = tarefas;

    if (filtroAtual === "pendentes") {
        tarefasFiltradas = tarefas.filter(tarefa => !tarefa.concluida);
    }

    if (filtroAtual === "concluidas") {
        tarefasFiltradas = tarefas.filter(tarefa => tarefa.concluida);
    }

    if (tarefasFiltradas.length === 0) {
        listaTarefas.innerHTML = `
            <p class="empty-message">
                Nenhuma tarefa encontrada.
            </p>
        `;

        return;
    }

    listaTarefas.innerHTML = tarefasFiltradas.map(tarefa => {

        const status = tarefa.concluida ? "Concluída" : "Pendente";

        const data = tarefa.created_at
            ? new Date(tarefa.created_at).toLocaleDateString("pt-BR")
            : "";

        return `
            <article class="task-item ${tarefa.concluida ? "completed" : ""}">

                <div class="task-info">

                    <button
                        class="task-check ${tarefa.concluida ? "completed" : ""}"
                        onclick="alternarConclusao(${Number(tarefa.id)})"
                        aria-label="Alterar conclusão"
                    >
                        ${tarefa.concluida ? '<i data-lucide="check"></i>' : ""}
                    </button>

                    <div class="task-text">

                        <h3>${escaparHTML(tarefa.titulo)}</h3>

                        <p>${escaparHTML(tarefa.descricao || "Sem descrição")}</p>

                    </div>

                </div>

                <span class="task-status ${tarefa.concluida ? "concluida" : "pendente"}">
                    ${status}
                </span>

                <span class="task-date">
                    ${data}
                </span>

                <div class="task-actions">

                    <button
                        onclick="editarTarefa(${Number(tarefa.id)})"
                        aria-label="Editar tarefa"
                        title="Editar"
                    >
                        <i data-lucide="pencil"></i>
                    </button>

                    <button
                        class="delete-button"
                        onclick="excluirTarefa(${Number(tarefa.id)})"
                        aria-label="Excluir tarefa"
                        title="Excluir"
                    >
                        <i data-lucide="trash-2"></i>
                    </button>

                </div>

            </article>
        `;

    }).join("");

    if (window.lucide) {
        lucide.createIcons();
    }
}


// ============================================
// 8. CADASTRAR TAREFA
// ============================================

formTarefa.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    const titulo = tituloInput.value.trim();

    const descricao = descricaoInput.value.trim();

    if (!titulo) {
        alert("Digite o título da tarefa.");

        return;
    }

    try {

        const resposta = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                titulo,
                descricao
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.mensagem || "Erro ao cadastrar tarefa.");
        }

        formTarefa.reset();

        await buscarTarefas();

        alert("Tarefa cadastrada com sucesso!");

    } catch (erro) {

        console.error("Erro ao cadastrar:", erro);

        alert(erro.message);

    }

});


// ============================================
// 9. EDITAR TAREFA
// ============================================

async function editarTarefa(id) {

    const tarefa = tarefas.find(item => item.id === id);

    if (!tarefa) {
        alert("Tarefa não encontrada.");

        return;
    }

    const novoTitulo = prompt("Novo título:", tarefa.titulo);

    if (novoTitulo === null) return;

    if (!novoTitulo.trim()) {
        alert("O título não pode ficar vazio.");

        return;
    }

    const novaDescricao = prompt("Nova descrição:", tarefa.descricao || "");

    if (novaDescricao === null) return;

    try {

        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                titulo: novoTitulo,
                descricao: novaDescricao,
                concluida: tarefa.concluida
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.mensagem || "Erro ao editar tarefa.");
        }

        await buscarTarefas();

        alert("Tarefa atualizada com sucesso!");

    } catch (erro) {

        console.error("Erro ao editar:", erro);

        alert(erro.message);

    }

}


// ============================================
// 10. CONCLUIR OU REABRIR TAREFA
// ============================================

async function alternarConclusao(id) {

    const tarefa = tarefas.find(item => item.id === id);

    if (!tarefa) return;

    try {

        const resposta = await fetch(`${API_URL}/${id}/concluir`, {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                concluida: !tarefa.concluida
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.mensagem || "Erro ao atualizar tarefa.");
        }

        await buscarTarefas();

    } catch (erro) {

        console.error("Erro ao concluir:", erro);

        alert(erro.message);

    }

}


// ============================================
// 11. EXCLUIR TAREFA
// ============================================

async function excluirTarefa(id) {

    const confirmar = confirm("Deseja realmente excluir esta tarefa?");

    if (!confirmar) return;

    try {

        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.mensagem || "Erro ao excluir tarefa.");
        }

        await buscarTarefas();

        alert("Tarefa excluída com sucesso!");

    } catch (erro) {

        console.error("Erro ao excluir:", erro);

        alert(erro.message);

    }

}


// ============================================
// 12. FILTROS
// ============================================

document.querySelectorAll(".filter-button").forEach(botao => {

    botao.addEventListener("click", () => {

        document.querySelectorAll(".filter-button").forEach(item => {
            item.classList.remove("active");
        });

        botao.classList.add("active");

        filtroAtual = botao.dataset.filtro;

        renderizarTarefas();

    });

});


// ============================================
// 13. BOTÃO NOVA TAREFA
// ============================================

document.getElementById("btnNovaTarefa").addEventListener("click", () => {

    tituloInput.focus();

    formTarefa.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

});


// ============================================
// 14. INICIALIZAÇÃO
// ============================================

mostrarData();

buscarTarefas();