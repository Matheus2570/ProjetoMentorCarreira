// src/pergunta.jsx  ←  VERSÃO FINAL PERFEITA + DATA ATUAL AUTOMÁTICA
import axios from "axios";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const enviarPerguntaAoMentor = async (perguntaOriginal) => {
  // DATA ATUAL DO SISTEMA (atualiza automaticamente todo dia!)
  const hoje = new Date();
  const dia = hoje.getDate();
  const mes = hoje.toLocaleString("pt-BR", { month: "long" });
  const ano = hoje.getFullYear();
  const dataAtualFormatada = `${dia} de ${mes} de ${ano}`;

  const texto = perguntaOriginal.toLowerCase().trim();
  const ehPlano = /plano.*estudo|monte.*plano|quero.*estudar|roteiro|cronograma|prepara.*(unicamp|enem|ita|pf)/i.test(texto);

  if (!ehPlano) {
    const prompt = `Você é um mentor do SESI/SENAI especialista em vestibulares e concursos.
Hoje é ${dataAtualFormatada}.
Responda em português, com tom acolhedor e motivador.

Pergunta: ${perguntaOriginal}`;
    try {
      const res = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        { contents: [{ role: "user", parts: [{ text: prompt }] }] },
        { headers: { "x-goog-api-key": GEMINI_API_KEY }, timeout: 60000 }
      );
      return res.data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    } catch { return "Erro de conexão."; }
  }

  // =================== FORÇA TOTAL: SOMENTE LaTeX PURO + DATA CORRETA ===================
  const horasDia = texto.match(/(\d+)\s*(hora|h|horas)/i)?.[1] || "3";
  const diasSemana = texto.includes("7 dias") || texto.includes("todo dia") ? "7" : 
                     texto.match(/(\d+)\s*dias.*semana/)?.[1] || "6";
  const dataProva = perguntaOriginal.match(/(\d{1,2}.*?\d{4})/i)?.[0] || "20 de agosto de 2026";
  const curso = perguntaOriginal.match(/(matemática|medicina|direito|engenharia|polícia|agente|[a-zç]+).*?(unicamp|usp|ita|enem|pf)/i)?.[0] || "vestibular";

  const promptLaTeX = `HOJE É EXATAMENTE ${dataAtualFormatada} (${dia}/${mes}/${ano}).
USE ESSA DATA COMO REFERÊNCIA ABSOLUTA PARA TODOS OS CÁLCULOS DE TEMPO, FASES E CRONOGRAMA.
NUNCA use 2024 nem datas passadas. A prova é sempre em 2026 ou depois.

VOCÊ É UM COMPILADOR LaTeX PROFISSIONAL.
Gere APENAS código LaTeX 100% válido, limpo e compilável no Overleaf, com 3 a 5 páginas.

REGRAS ABSOLUTAS (SE DESCUMPRIR, SERÁ BLOQUEADO):
1. Comece com: \\documentclass[a4paper,12pt]{article}
2. Termine exatamente com: \\end{document}
3. NÃO escreva NENHUMA palavra fora do LaTeX (nem "Aqui está", nem emojis, nem bulb, nem star)
4. Use SOMENTE comandos LaTeX:
   • Listas: \\begin{itemize} \\item
   • Checks: \\checkmark (pacote pifont ou emoji)
   • Negrito: \\textbf{}
   • Títulos: \\section{}, \\subsection{}
   • Tabelas: \\begin{longtable}{|c|c|c|} ... \\end{longtable}
   • Cores: \\definecolor{azulunicamp}{RGB}{0,51,160}
5. Pacotes obrigatórios (coloque todos no preâmbulo):
   \\usepackage[utf8]{inputenc}
   \\usepackage[T1]{fontenc}
   \\usepackage{geometry} \\geometry{a4paper, margin=2cm}
   \\usepackage{xcolor}
   \\usepackage{booktabs}
   \\usepackage{longtable}
   \\usepackage{fancyhdr}
   \\usepackage{emoji}
   \\usepackage{pifont}
   \\usepackage{colortbl}
   \\usepackage{array}

DADOS DO ALUNO (OBRIGATÓRIO USAR):
• Curso/Cargo: ${curso.toUpperCase()}
• Prova: ${dataProva}
• Horas por dia: EXATAMENTE ${horasDia}
• Dias por semana: ${diasSemana === "7" ? "todos os dias" : diasSemana + " dias"}
• Data de hoje: ${dataAtualFormatada}

Estrutura obrigatória:
• Capa com título grande, curso, data da prova
• Cabeçalho com cores da Unicamp (azul #0033A0 e amarelo #FFC107)
• Tabela semanal fixa (longtable)
• Cronograma por fases (começando a partir de hoje, ${mes} ${ano})
• Checklist com \\checkmark
• Materiais recomendados
• Frase final épica com \\textbf e \\Huge

Pergunta original: "${perguntaOriginal}"

Gere o LaTeX AGORA, sem nenhuma palavra fora do código.`;

  try {
    const res = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ role: "user", parts: [{ text: promptLaTeX }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8192,
          topP: 0.85,
        },
      },
      {
        headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
        timeout: 120000,
      }
    );

    const latex = res.data?.candidates?.[0]?.content?.parts
      ?.map(p => p.text || "")
      .join("")
      .trim();

    if (!latex?.includes("\\documentclass") || !latex?.includes("\\end{document}")) {
      return "Erro: o Mentor gerou texto inválido. Tente novamente com mais detalhes.";
    }

    return latex;

  } catch (err) {
    console.error(err.response?.data || err);
    return "Erro crítico no Gemini. Tente novamente em 10 segundos.";
  }
};