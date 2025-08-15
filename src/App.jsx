import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;


function App() {
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [loading, setLoading] = useState(false);

  const enviarPergunta = async () => {
    if (!pergunta.trim()) return;
    setLoading(true);
    setResposta("");

    const prompt = `
Você é um mentor de carreira especializado no contexto educacional do SESI e SENAI, com profundo conhecimento sobre cursos técnicos, programas de aprendizagem industrial, oportunidades de estágio, provas internas e externas, ingresso em faculdades e mercado de trabalho.
Seu papel é orientar alunos sobre caminhos acadêmicos e profissionais, explicando opções de formação, requisitos, prazos e estratégias para aprovação em provas, vestibulares e processos seletivos.
Sempre dê respostas claras, práticas e contextualizadas para a realidade dos estudantes do SESI e SENAI, incluindo dicas de estudo, planejamento de carreira e oportunidades relacionadas à indústria e tecnologia.
Agora, analise e responda à seguinte pergunta do usuário: ${pergunta}
`;

    try {
      const { data } = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const respostaApi =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta";
      setResposta(respostaApi);
    } catch (err) {
      console.error(err);
      setResposta("Erro ao conectar com a API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Mentor de Carreira (React Web)</h1>
      <textarea
        placeholder="Digite sua pergunta..."
        value={pergunta}
        onChange={(e) => setPergunta(e.target.value.slice(0, 500))}
        rows={4}
        className="text-input"
      />
      <button
        onClick={enviarPergunta}
        className="button"
        disabled={!pergunta.trim() || loading}
      >
        {loading ? "Carregando..." : "Perguntar"}
      </button>
      {resposta && <div className="response-container">{resposta}</div>}
    </div>
  );
}

export default App;
