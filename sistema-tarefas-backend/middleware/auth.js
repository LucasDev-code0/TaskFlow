import { supabase } from "../config/supabase.js";

export async function verificarToken(req, res, next) {
try {
const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            erro: "Token de autenticação não informado."
        });
    }

    const token = authorization.slice(7).trim();

    if (!token || token.length > 8192) {
        return res.status(401).json({
            erro: "Token de autenticação inválido."
        });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user?.id) {
        return res.status(401).json({
            erro: "Token inválido ou sessão expirada."
        });
    }

    req.usuario = data.user;

    next();

} catch (error) {
    console.error("Erro na autenticação:", error);

    return res.status(500).json({
        erro: "Erro interno na autenticação."
    });
}

}