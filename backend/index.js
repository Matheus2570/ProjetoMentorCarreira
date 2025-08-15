import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());           // Permite requisições de outros domínios
app.use(express.json());   // Substitui body-parser

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 3000;

app.post("/perguntar", async (req, res) => {
  const { pergunta } = req.body;

  if (!pergunta || !pergunta.trim()) {
    return res.status(400).json({ resposta: "Pergunta vazia" });
  }

  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY não está configurada.");
    return res.status(500).json({ resposta: "Chave da API não configurada." });
  }

  const prompt = `
Você é um mentor de carreira especializado no contexto educacional do SESI e SENAI...
[resto do prompt igual ao seu]
Agora, analise e responda à seguinte pergunta do usuário: ${pergunta}
`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await r.json();
    console.log("Resposta da API Gemini:", data);

    const resposta = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta";
    res.json({ resposta });
  } catch (e) {
    console.error("Erro ao chamar Gemini:", e);
    res.status(500).json({ resposta: "Erro ao consultar a IA." });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
