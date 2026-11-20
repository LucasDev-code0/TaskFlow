import express from "express";
import { supabase } from "../config/supabase.js";
import { verificarToken } from "../middleware/auth.js";

const router = express.Router();

router.use(verificarToken);

// VALIDAÇÕES
function validarId(id) {
    return /^\d+$/.test(id);
}

function validarTitulo(titulo) {
    return (
        typeof titulo === "string" &&
        titulo.trim().length > 0 &&
        titulo.trim().length <= 150
    );
}

function validarDescricao(descricao) {
    return descricao === undefined ||
        descricao === null ||
        (
            typeof descricao === "string" &&
            descricao.length <= 2000
        );
}

function validarData(data) {
    if (data === undefined || data === null || data === "") {
        return true;
    }

    if (typeof data !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return false;
    }

    const [ano, mes, dia] = data.split("-").map(Number);
    const dataObj = new Date(Date.UTC(ano, mes - 1, dia));

    return (
        dataObj.getUTCFullYear() === ano &&
        dataObj.getUTCMonth() === mes - 1 &&
        dataObj.getUTCDate() === dia
    );
}


// LISTAR TAREFAS
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("tarefas")
            .select("*")
            .eq("user_id", req.usuario.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro ao buscar tarefas:", error);
            return res.status(500).json({
                mensagem: "Erro ao buscar tarefas."
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error("Erro interno:", error);

        return res.status(500).json({
            mensagem: "Erro interno do servidor."
        });
    }
});


// CADASTRAR TAREFA
router.post("/", async (req, res) => {
    try {
        const { titulo, descricao, data_vencimento } = req.body;

        if (!validarTitulo(titulo)) {
            return res.status(400).json({
                mensagem: "O título deve ter entre 1 e 150 caracteres."
            });
        }

        if (!validarDescricao(descricao)) {
            return res.status(400).json({
                mensagem: "A descrição deve ter no máximo 2000 caracteres."
            });
        }

        if (!validarData(data_vencimento)) {
            return res.status(400).json({
                mensagem: "Data de vencimento inválida."
            });
        }

        const { data, error } = await supabase
            .from("tarefas")
            .insert([{
                titulo: titulo.trim(),
                descricao: descricao?.trim() || "",
                data_vencimento: data_vencimento || null,
                concluida: false,
                user_id: req.usuario.id
            }])
            .select()
            .single();

        if (error) {
            console.error("Erro ao cadastrar:", error);

            return res.status(500).json({
                mensagem: "Erro ao cadastrar tarefa."
            });
        }

        return res.status(201).json({
            mensagem: "Tarefa cadastrada com sucesso!",
            tarefa: data
        });

    } catch (error) {
        console.error("Erro interno:", error);

        return res.status(500).json({
            mensagem: "Erro interno do servidor."
        });
    }
});


// EDITAR TAREFA
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descricao, concluida, data_vencimento } = req.body;

        if (!validarId(id)) {
            return res.status(400).json({
                mensagem: "ID da tarefa inválido."
            });
        }

        if (!validarTitulo(titulo)) {
            return res.status(400).json({
                mensagem: "O título deve ter entre 1 e 150 caracteres."
            });
        }

        if (!validarDescricao(descricao)) {
            return res.status(400).json({
                mensagem: "A descrição deve ter no máximo 2000 caracteres."
            });
        }

        if (!validarData(data_vencimento)) {
            return res.status(400).json({
                mensagem: "Data de vencimento inválida."
            });
        }

        if (concluida !== undefined &&
            typeof concluida !== "boolean") {
            return res.status(400).json({
                mensagem: "O campo concluida deve ser true ou false."
            });
        }

        const { data, error } = await supabase
            .from("tarefas")
            .update({
                titulo: titulo.trim(),
                descricao: descricao?.trim() || "",
                data_vencimento: data_vencimento || null,
                concluida: concluida ?? false
            })
            .eq("id", id)
            .eq("user_id", req.usuario.id)
            .select()
            .maybeSingle();

        if (error) {
            console.error("Erro ao editar:", error);

            return res.status(500).json({
                mensagem: "Erro ao editar tarefa."
            });
        }

        if (!data) {
            return res.status(404).json({
                mensagem: "Tarefa não encontrada."
            });
        }

        return res.status(200).json({
            mensagem: "Tarefa atualizada com sucesso!",
            tarefa: data
        });

    } catch (error) {
        console.error("Erro interno:", error);

        return res.status(500).json({
            mensagem: "Erro interno do servidor."
        });
    }
});


// CONCLUIR OU REABRIR TAREFA
router.patch("/:id/concluir", async (req, res) => {
    try {
        const { id } = req.params;
        const { concluida } = req.body;

        if (!validarId(id)) {
            return res.status(400).json({
                mensagem: "ID da tarefa inválido."
            });
        }

        if (typeof concluida !== "boolean") {
            return res.status(400).json({
                mensagem: "Informe concluida como true ou false."
            });
        }

        const { data, error } = await supabase
            .from("tarefas")
            .update({ concluida })
            .eq("id", id)
            .eq("user_id", req.usuario.id)
            .select()
            .maybeSingle();

        if (error) {
            console.error("Erro ao atualizar conclusão:", error);

            return res.status(500).json({
                mensagem: "Erro ao atualizar tarefa."
            });
        }

        if (!data) {
            return res.status(404).json({
                mensagem: "Tarefa não encontrada."
            });
        }

        return res.status(200).json({
            mensagem: "Status atualizado com sucesso!",
            tarefa: data
        });

    } catch (error) {
        console.error("Erro interno:", error);

        return res.status(500).json({
            mensagem: "Erro interno do servidor."
        });
    }
});


// EXCLUIR TAREFA
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!validarId(id)) {
            return res.status(400).json({
                mensagem: "ID da tarefa inválido."
            });
        }

        const { data, error } = await supabase
            .from("tarefas")
            .delete()
            .eq("id", id)
            .eq("user_id", req.usuario.id)
            .select()
            .maybeSingle();

        if (error) {
            console.error("Erro ao excluir:", error);

            return res.status(500).json({
                mensagem: "Erro ao excluir tarefa."
            });
        }

        if (!data) {
            return res.status(404).json({
                mensagem: "Tarefa não encontrada."
            });
        }

        return res.status(200).json({
            mensagem: "Tarefa excluída com sucesso!"
        });

    } catch (error) {
        console.error("Erro interno:", error);

        return res.status(500).json({
            mensagem: "Erro interno do servidor."
        });
    }
});

export default router;