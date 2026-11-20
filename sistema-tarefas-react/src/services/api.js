import { supabase } from "./supabase";

const API_URL = `${import.meta.env.VITE_API_URL}/api/tarefas`;

// Função central para realizar requisições autenticadas.
async function requisicaoAPI(endpoint = "", options = {}) {

    // Busca a sessão atual do usuário.
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        throw new Error("Não foi possível verificar sua sessão.");
    }

    const token = data.session?.access_token;

    if (!token) {
        throw new Error("Usuário não autenticado. Faça login novamente.");
    }

    // Envia a requisição para o backend.
    const resposta = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
            Authorization: `Bearer ${token}`
        }
    });

    // Converte a resposta para JSON.
    const resultado = await resposta.json();

    // Verifica se ocorreu algum erro.
    if (!resposta.ok) {
        throw new Error(
            resultado.erro || resultado.mensagem || "Erro na comunicação com a API."
        );
    }

    return resultado;
}


// LISTAR TAREFAS
export function listarTarefas() {
    return requisicaoAPI("/");
}


// CADASTRAR TAREFA
export function cadastrarTarefa(tarefa) {
    return requisicaoAPI("/", {
        method: "POST",
        body: JSON.stringify(tarefa)
    });
}


// EDITAR TAREFA
export function editarTarefa(id, tarefa) {
    return requisicaoAPI(`/${id}`, {
        method: "PUT",
        body: JSON.stringify(tarefa)
    });
}


// CONCLUIR OU REABRIR TAREFA
export function alterarConclusao(id, concluida) {
    return requisicaoAPI(`/${id}/concluir`, {
        method: "PATCH",
        body: JSON.stringify({ concluida })
    });
}


// EXCLUIR TAREFA
export function excluirTarefa(id) {
    return requisicaoAPI(`/${id}`, {
        method: "DELETE"
    });
}