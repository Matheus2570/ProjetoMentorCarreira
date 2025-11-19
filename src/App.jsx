// src/App.jsx
import React, { useState } from "react";
import { enviarPerguntaAoMentor } from "./pergunta";
import "./App.css";

function App() {
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pergunta.trim()) return;

    setLoading(true);
    setResposta("");
    try {
      const texto = await enviarPerguntaAoMentor(pergunta);
      setResposta(texto);
    } catch (err) {
      setResposta("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copiarLaTeX = () => {
    navigator.clipboard.writeText(resposta);
    alert("Código LaTeX copiado para a área de transferência!");
  };

  // Botão atualizado: abre seus projetos do Overleaf + cola o código automaticamente
  const abrirNoOverleaf = () => {
  window.open("https://www.overleaf.com/project", "_blank");
};


  const temLaTeX = resposta.includes("\\documentclass");

  return (
    <div className="app-container">
      <div className="mentor-card">
        <header className="header">
          <h1>Mentor de Carreira</h1>
          <p className="subtitle">SESI • SENAI • Unicamp • ITA • Futuro</p>
        </header>

        <main className="main-content">
          <form onSubmit={handleSubmit} className="input-area">
            <textarea
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              placeholder="Ex: Monte um plano de estudos completo para Matemática na Unicamp 2026, 3h por dia"
              rows="4"
              className="pergunta-input"
              disabled={loading}
            />
            <button type="submit" disabled={loading} className="send-btn">
              {loading ? "Pensando..." : "Enviar Pergunta"}
            </button>
          </form>

          {resposta && (
            <div className="resposta-area">
              <div className="resposta-card">
                <pre className="resposta-texto">{resposta}</pre>
              </div>

              {/* BOTÕES MÁGICOS */}
              {temLaTeX && (
                <div className="latex-botoes">
                  <button onClick={copiarLaTeX} className="btn-copiar">
                    Copiar código LaTeX
                  </button>

                  {/* Botão atualizado com o link que você pediu */}
                  <button onClick={abrirNoOverleaf} className="btn-overleaf">
                    Abrir no Overleaf
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="footer">
          <p>Desenvolvido com carinho para quem vai conquistar a Unicamp • 2025</p>
        </footer>
      </div>
    </div>
  );
}

export default App;