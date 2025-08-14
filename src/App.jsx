import React, { useState } from "react";
import axios from "axios";
import "./App.css"; // Certifique-se de ter um arquivo CSS se estiver usando estilos externos.

function App() {
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [loading, setLoading] = useState(false);

  const enviarPergunta = async () => {
    if (!pergunta.trim()) return;
    setLoading(true);
    setResposta("");

    try {
      const { data } = await axios.post("http://localhost:3000/perguntar", {
        pergunta,
      });
      setResposta(data.resposta || "Sem resposta.");
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
        onChange={(e) => setPergunta(e.target.value.slice(0, 500))} // Limite de 500 caracteres
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
      {resposta && (
        <div className="response-container">
          {resposta}
        </div>
      )}
    </div>
  );
}

export default App;