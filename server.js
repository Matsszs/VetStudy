import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);
const SITE_DIR = path.join(__dirname, "vetstudy_priority_visible");
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_DEEP_MODEL = process.env.OLLAMA_DEEP_MODEL || process.env.OLLAMA_MODEL || "qwen3.5:9b";
const OLLAMA_FAST_MODEL = process.env.OLLAMA_FAST_MODEL || process.env.OLLAMA_MODEL || OLLAMA_DEEP_MODEL;
const OLLAMA_FALLBACK_MODEL = process.env.OLLAMA_FALLBACK_MODEL || OLLAMA_DEEP_MODEL;
const AI_CHAT_TIMEOUT_MS = Number(process.env.AI_CHAT_TIMEOUT_MS || 28000);
const OLLAMA_NUM_CTX = Number(process.env.OLLAMA_NUM_CTX || 2048);
const OLLAMA_NUM_PREDICT = Number(process.env.OLLAMA_NUM_PREDICT || 180);
const OLLAMA_DEEP_NUM_CTX = Number(process.env.OLLAMA_DEEP_NUM_CTX || Math.max(OLLAMA_NUM_CTX, 2560));
const OLLAMA_DEEP_NUM_PREDICT = Number(process.env.OLLAMA_DEEP_NUM_PREDICT || 300);
const VETSTUDY_SITE_GUIDE = [
  "Manual interno do VetStudy:",
  "- Home: mostra saudacao, banner, calendario, materias recentes, plano do dia e acesso rapido as abas principais.",
  "- Materias: permite criar nova materia, abrir detalhes, editar nome/icone/status, acompanhar progresso, topicos, tarefas, anotacoes e slide.",
  "- Detalhe da materia: o estudante organiza topicos e tarefas, escreve anotacoes, abre slide/PDF, inicia estudo ou manda a materia para o modo foco.",
  "- Flashcards: area de treino com perguntas por nivel Facil, Medio e Dificil. O estudante responde alternativas, ve explicacao, pode clicar em Nao entendi, acompanha progresso, usa Modo simulado e consulta o Caderno de erros.",
  "- Modo foco: o estudante escolhe uma materia, usa timer, revisa topicos/tarefas, escreve anotacoes de foco e tambem pode anexar ou abrir slide/PDF.",
  "- Perfil: guarda nome, usuario, curso, semestre, objetivo, tempo de estudo, preferencias de estudo, area de interesse, bloco Sobre mim nos estudos, estatisticas, XP, diagnostico e ranking pessoal. Nunca mencione senha.",
  "- VetyAI: chat flutuante no canto para tirar duvidas, explicar, resumir, orientar os estudos e ajudar o estudante a usar o site.",
  "- Criador: o VetStudy foi criado por Mateus, 19 anos, estudante de ADS, pensando na dificuldade dos estudantes para se organizar nos estudos.",
  "- Slides/PDF: existem dentro de cada materia e tambem no Modo foco. O material salvo em uma materia pode ser diferente do material aberto no Modo foco.",
  "Quando perguntarem como fazer algo no site, responda como guia do produto: use passos curtos, cite os botoes/abas pelo nome e adapte ao contexto atual do estudante.",
  "Nao use instrucoes genericas como 'procure geralmente'. Use nomes exatos: Nova materia, Materias, Flashcards, Modo foco, Perfil, Editar perfil, Salvar alteracoes, Continuar estudando, Repetir nivel."
].join("\n");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(SITE_DIR));

let installedModels = new Set();

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-4)
    .map((item) => ({
      role: item?.role === "assistant" ? "assistant" : "user",
      content: typeof item?.content === "string" ? item.content.trim() : ""
    }))
    .filter((item) => item.content);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function cleanTopic(message) {
  return String(message || "")
    .replace(/^explique de forma simples:\s*/i, "")
    .replace(/^explique\s+(.+?)\s+de forma simples$/i, "$1")
    .replace(/^explica\s+(.+?)\s+de forma simples$/i, "$1")
    .replace(/^explique:\s*/i, "")
    .replace(/^resuma este tema:\s*/i, "")
    .replace(/^resuma:\s*/i, "")
    .replace(/^crie\s+\d+\s+perguntas\s+sobre:\s*/i, "")
    .replace(/^monte um plano de estudo para:\s*/i, "")
    .replace(/\(coloque o tema aqui\)/ig, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clipText(value, maxLength = 220) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeAppContext(context) {
  if (!context || typeof context !== "object") return null;

  const profile = context.profile && typeof context.profile === "object" ? context.profile : {};
  const currentPage = context.currentPage && typeof context.currentPage === "object" ? context.currentPage : {};
  const flashcards = context.flashcards && typeof context.flashcards === "object" ? context.flashcards : {};

  return {
    profile: {
      name: clipText(profile.name, 80),
      username: clipText(profile.username, 50),
      course: clipText(profile.course, 80),
      semester: clipText(profile.semester, 50),
      goal: clipText(profile.goal, 140),
      studyTime: clipText(profile.studyTime, 50),
      challenge: clipText(profile.challenge, 140),
      studyStyle: clipText(profile.studyStyle, 60),
      vetyStyle: clipText(profile.vetyStyle, 60),
      interestArea: clipText(profile.interestArea, 80),
      studyAbout: clipText(profile.studyAbout, 220)
    },
    currentPage: {
      id: clipText(currentPage.id, 60),
      label: clipText(currentPage.label, 80)
    },
    focus: context.focus && typeof context.focus === "object"
      ? {
          selectedSubject: clipText(context.focus.selectedSubject, 80),
          timer: clipText(context.focus.timer, 40)
        }
      : null,
    flashcards: {
      level: clipText(flashcards.level, 30),
      reviewed: Number(flashcards.reviewed) || 0,
      total: Number(flashcards.total) || 0,
      sessionCorrect: Number(flashcards.sessionCorrect) || 0,
      sessionReviewed: Number(flashcards.sessionReviewed) || 0,
      activeCards: Array.isArray(flashcards.activeCards)
        ? flashcards.activeCards.slice(0, 2).map((card) => ({
            question: clipText(card?.question, 220),
            options: Array.isArray(card?.options) ? card.options.slice(0, 4).map((option) => clipText(option, 120)) : [],
            answered: Boolean(card?.answered),
            selected: clipText(card?.selected, 120),
            correctOption: clipText(card?.correctOption, 120)
          }))
        : []
    },
    subjects: Array.isArray(context.subjects)
      ? context.subjects.slice(0, 8).map((subject) => ({
          name: clipText(subject?.name, 80),
          status: clipText(subject?.status, 40),
          progress: Number(subject?.progress) || 0,
          exam: clipText(subject?.exam, 80),
          pendingTasks: Number(subject?.pendingTasks) || 0,
          topics: Array.isArray(subject?.topics) ? subject.topics.slice(0, 3).map((topic) => clipText(topic, 60)) : []
        }))
      : []
  };
}

function formatAppContext(context) {
  if (!context) return "";
  return `Contexto atual do estudante no VetStudy:\n${JSON.stringify(context, null, 2).slice(0, 3800)}`;
}

function buildCardHint(card) {
  const question = normalizeText(card?.question || "");

  if (/prognostico|reservado|evolucao/.test(question)) {
    return "pense na evolucao esperada do caso e no quanto ainda existe de incerteza.";
  }

  if (/apatia|hiporexia|palida|palidas|primeira linha|conduta inicial/.test(question)) {
    return "comece organizando anamnese, exame fisico completo e hipoteses antes de pensar em uma causa unica.";
  }

  if (/ave|aves|reptil|repteis|exotico|exoticos|serpente/.test(question)) {
    return "priorize manejo, estresse, ambiente e observacao antes de manipular.";
  }

  if (/ausculta|cardiaca|pulmonar|frequencia|perfusao|mucosa/.test(question)) {
    return "nao leia o parametro isolado; cruze com outros sinais vitais e contexto clinico.";
  }

  if (/diagnostico|presuntivo|hipotese|diferencial|sinal inespecifico/.test(question)) {
    return "busque a alternativa que integra dados e evita fechar conclusao com um unico sinal.";
  }

  if (/anamnese|queixa|historico|sintoma|cronologia/.test(question)) {
    return "organize tempo de evolucao, relato do tutor e sinais atuais antes de decidir.";
  }

  if (/palpacao|dor|sensibilidade|abdominal/.test(question)) {
    return "dor ou sensibilidade precisa ser ligada ao historico e aos outros achados do exame.";
  }

  if (/estudo|revisao|flashcard/.test(question)) {
    return "escolha a alternativa que fala de recuperacao ativa e revisao, nao leitura passiva.";
  }

  return "compare as alternativas e escolha a que exige integracao de sinais, contexto e conduta segura.";
}

function buildFlashcardHintReply(appContext) {
  const cards = appContext?.flashcards?.activeCards || [];
  const levelMap = { easy: "Facil", medium: "Medio", hard: "Dificil" };
  const level = levelMap[appContext?.flashcards?.level] || appContext?.flashcards?.level || "atual";

  if (!cards.length) {
    return [
      "Dica para o treino:",
      "1. Clique em Comecar rodada para revelar os cards.",
      "2. Leia a pergunta antes das alternativas.",
      "3. Descarte opcoes absolutas ou que fecham diagnostico sem contexto.",
      "4. Depois de responder, leia a explicacao antes de ir para os proximos cards."
    ].join("\n");
  }

  return [
    `Dica dos cards do nivel ${level}:`,
    "",
    ...cards.map((card, index) => {
      const status = card.answered && card.correctOption
        ? ` Como voce ja respondeu, revise por que "${card.correctOption}" fecha melhor.`
        : " Nao vou entregar a resposta direta.";
      return `${index + 1}. ${card.question}\nDica: ${buildCardHint(card)}${status}`;
    })
  ].join("\n");
}

function buildSiteHelpReply(message, appContext) {
  const normalized = normalizeText(message);
  const name = appContext?.profile?.name;

  if (name && /(qual|sabe|lembr).*meu nome|como eu me chamo|quem sou eu/.test(normalized)) {
    return `Seu nome no VetStudy esta salvo como ${name}. Se quiser mudar, abra a aba Perfil e edite o campo Nome.`;
  }

  if (/(quem|quem foi|quem e|criador|criou|fez|desenvolveu|fundador).*(site|vetstudy|plataforma|app)|criador do vetstudy|quem criou/.test(normalized)) {
    return "O VetStudy foi criado por Mateus, 19 anos, estudante de ADS. A ideia nasceu pensando na dificuldade que muitos estudantes tem para se organizar, revisar no tempo certo e transformar o estudo em uma rotina mais clara.";
  }

  if (/(dica|ajuda|orienta|pista).*(card|cards|flashcard|flashcards|pergunta|questao|questoes)|me oriente no treino/.test(normalized)) {
    return buildFlashcardHintReply(appContext);
  }

  if (!/(como|onde|aba|botao|site|vetstudy|fazer|usar|criar|adicionar|editar|mudar|trocar|flashcard|materia|foco|perfil|calendario|prova|slide|pdf|anotacao|tarefa)/.test(normalized)) {
    return "";
  }

  if (/(criar|adicionar|nova).*materia|materia.*(criar|adicionar|nova)/.test(normalized)) {
    return [
      "Para criar uma materia no VetStudy:",
      "1. Abra a aba Materias.",
      "2. Clique em Nova materia.",
      "3. Preencha nome, icone e status.",
      "4. Salve e abra a materia para adicionar topicos, tarefas, anotacoes e slides."
    ].join("\n");
  }

  if (/(simulado|prova curta|prova rapida)/.test(normalized)) {
    return [
      "Para usar o Modo simulado:",
      "1. Abra a aba Flashcards.",
      "2. Na area Modo simulado, escolha a materia.",
      "3. Clique em Comecar simulado.",
      "4. Responda as 5 questoes.",
      "5. No final, revise primeiro os erros."
    ].join("\n");
  }

  if (/(flashcard|pergunta|quiz|treino|jogo)/.test(normalized)) {
    return [
      "Para treinar perguntas:",
      "1. Abra a aba Flashcards.",
      "2. Escolha Facil, Medio ou Dificil.",
      "3. Responda as alternativas dos cards.",
      "4. Use Nao entendi se quiser que a VetyAI reformule a explicacao.",
      "5. Depois, avance para o simulado ou revise o Caderno de erros."
    ].join("\n");
  }

  if (/(modo foco|foco|timer|pomodoro)/.test(normalized)) {
    return [
      "Para usar o modo foco:",
      "1. Abra a aba Modo foco.",
      "2. Escolha uma materia.",
      "3. Ajuste o timer ou use um tempo pronto.",
      "4. Estude pelos topicos, tarefas, anotacoes e slide da materia.",
      "5. Marque o que concluiu para o progresso ficar atualizado."
    ].join("\n");
  }

  if (/(calendario|agenda|prova|evento|data)/.test(normalized)) {
    return [
      "Para usar calendario e provas:",
      "1. Na Home, abra a area de calendario.",
      "2. Escolha o mes.",
      "3. Clique em um dia para adicionar prova, estudo ou tarefa.",
      "4. Vincule o evento a uma materia quando fizer sentido."
    ].join("\n");
  }

  if (/(slide|pdf|arquivo|anexar)/.test(normalized)) {
    return [
      "Para usar slides ou PDF:",
      "1. Dentro de cada materia, use a area de Slide/PDF para salvar um material proprio daquela materia.",
      "2. No Modo foco, tambem existe Slide/PDF, mas ele pode ser independente do slide salvo na materia.",
      "3. Em qualquer uma dessas telas, cole um link valido ou anexe um PDF.",
      "4. Use Abrir em nova guia quando quiser ver o material maior."
    ].join("\n");
  }

  if (/(perfil|nome|foto|usuario|curso|semestre|objetivo)/.test(normalized)) {
    return [
      "Para editar seu perfil:",
      "1. Abra a aba Perfil.",
      "2. Clique em Editar perfil.",
      "3. Atualize nome, usuario, curso, semestre, objetivo, tempo de estudo, preferencias e bloco Sobre mim nos estudos.",
      "4. Clique em Salvar alteracoes."
    ].join("\n");
  }

  if (/(tarefa|topico|anotacao|resumo)/.test(normalized)) {
    return [
      "Para organizar uma materia:",
      "1. Abra a aba Materias.",
      "2. Entre na materia desejada.",
      "3. Use Topicos e tarefas para quebrar o estudo em partes pequenas.",
      "4. Use Anotacoes para resumos, duvidas e lembretes.",
      "5. Marque tarefas concluidas para atualizar o progresso."
    ].join("\n");
  }

  if (/(vetstudy|site|usar|comecar|começar|funciona|inicio|iniciar)/.test(normalized)) {
    return [
      "Mapa rapido do VetStudy:",
      "1. Home: veja calendario, materias recentes e plano do dia.",
      "2. Materias: crie materias, topicos, tarefas, anotacoes e slides.",
      "3. Flashcards: treine perguntas por nivel e acompanhe o progresso.",
      "4. Modo foco: escolha uma materia, use timer e estude sem sair da tela.",
      "5. Perfil: ajuste nome, curso, objetivo e tempo de estudo."
    ].join("\n");
  }

  return "";
}

function buildFastReply(message, appContext = null) {
  const normalized = normalizeText(message);
  const topic = cleanTopic(message);
  const siteHelpReply = buildSiteHelpReply(message, appContext);

  if (siteHelpReply) {
    return siteHelpReply;
  }

  if (/^(oi|ola|bom dia|boa tarde|boa noite)\b/.test(normalized)) {
    const studentName = appContext?.profile?.name ? clipText(appContext.profile.name, 40) : "";
    const greeting = normalized.startsWith("bom dia")
      ? "Bom dia"
      : normalized.startsWith("boa tarde")
        ? "Boa tarde"
        : normalized.startsWith("boa noite")
          ? "Boa noite"
          : "Oi";
    return `${greeting}${studentName ? `, ${studentName}` : ""}. Como posso te ajudar hoje no estudo?`;
  }

  if (/^(ajuda|me ajuda)\b/.test(normalized)) {
    return "Claro. Me fala a materia, a duvida ou o que voce quer fazer e eu vou direto ao ponto.";
  }

  if (/(obrigad|valeu|tmj)/.test(normalized)) {
    return "Boa. Se quiser, ja manda a proxima duvida ou a materia que eu continuo com voce.";
  }

  if (topic && /(plano|rotina|organizar|estudar)/.test(normalized)) {
    return [
      `Plano rapido para ${topic}:`,
      "",
      "1. Leia o conceito principal por 5 minutos.",
      "2. Separe 3 palavras-chave.",
      "3. Monte 3 flashcards.",
      "4. Explique em voz alta como se estivesse ensinando.",
      "5. Anote uma duvida para revisar depois."
    ].join("\n");
  }

  if (topic && /(pergunta|questao|questoes|quiz|flashcard)/.test(normalized)) {
    return [
      `Perguntas-guia sobre ${topic}:`,
      "",
      `1. O que define ${topic}?`,
      "2. Quais estruturas, processos ou conceitos entram nesse tema?",
      "3. Qual exemplo veterinario ajuda a memorizar?",
      "4. O que costuma confundir em prova?",
      "5. Como resumir isso em poucas linhas?"
    ].join("\n");
  }

  if (topic && /(resum|explique|explica|mapa mental|checklist|revis)/.test(normalized)) {
    return [
      `Resposta rapida: resumo de ${topic}.`,
      "",
      `- Defina ${topic} em uma frase.`,
      "- Separe 3 palavras-chave.",
      "- Feche com um exemplo veterinario ou uma pergunta de prova."
    ].join("\n");
  }

  return "";
}

function modelNamesMatch(requested, installed) {
  const target = String(requested || "").toLowerCase();
  const available = String(installed || "").toLowerCase();
  if (!target || !available) return false;
  if (target === available) return true;
  if (!target.includes(":") && available === `${target}:latest`) return true;
  if (!available.includes(":") && target === `${available}:latest`) return true;
  return false;
}

function resolveInstalledModel(model) {
  return Array.from(installedModels).find((name) => modelNamesMatch(model, name)) || "";
}

async function refreshInstalledModels() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`Ollama respondeu ${response.status}`);
    }

    const data = await response.json();
    const names = (Array.isArray(data?.models) ? data.models : [])
      .flatMap((model) => [model?.name, model?.model])
      .filter(Boolean);
    installedModels = new Set(names);
  } catch (error) {
    console.warn("Nao foi possivel ler os modelos instalados no Ollama:", error?.message || error);
  }

  return installedModels;
}

function chooseModel(mode) {
  const preferredModel = mode === "deep" ? OLLAMA_DEEP_MODEL : OLLAMA_FAST_MODEL;
  return (
    resolveInstalledModel(preferredModel) ||
    resolveInstalledModel(OLLAMA_FALLBACK_MODEL) ||
    preferredModel
  );
}

function buildOllamaOptions(mode) {
  const isDeep = mode === "deep";
  return {
    temperature: isDeep ? 0.4 : 0.3,
    top_p: 0.9,
    num_ctx: isDeep ? OLLAMA_DEEP_NUM_CTX : OLLAMA_NUM_CTX,
    num_predict: isDeep ? OLLAMA_DEEP_NUM_PREDICT : OLLAMA_NUM_PREDICT
  };
}

async function prewarmModel(model) {
  if (!model) return;

  try {
    await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({
        model,
        prompt: "ok",
        stream: false,
        keep_alive: "10m",
        options: {
          num_predict: 1
        }
      })
    });
    console.log(`Modelo Ollama aquecido: ${model}`);
  } catch (error) {
    console.warn(`Nao foi possivel aquecer o modelo ${model}:`, error?.message || error);
  }
}

app.get("/api/ai-models", async (_req, res) => {
  await refreshInstalledModels();
  res.json({
    models: Array.from(installedModels),
    fastModel: chooseModel("fast"),
    deepModel: chooseModel("deep")
  });
});

app.post("/api/ai-chat", async (req, res) => {
  try {
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    const history = normalizeHistory(req.body?.history);
    const mode = req.body?.mode === "deep" ? "deep" : "fast";
    const appContext = normalizeAppContext(req.body?.appContext);

    if (!message) {
      return res.status(400).json({ error: "Envie uma mensagem antes de continuar." });
    }

    const normalizedMessage = normalizeText(message);
    const fastReply = buildFastReply(message, appContext);
    const shouldUseInstantReply =
      !!fastReply &&
      (
        /^(oi|ola|bom dia|boa tarde|boa noite|ajuda|me ajuda|obrigad|valeu|tmj)\b/.test(normalizedMessage) ||
        /(como|onde|aba|botao|site|vetstudy|fazer|usar|criar|adicionar|editar|mudar|trocar|flashcard|materia|foco|perfil|calendario|prova|slide|pdf|anotacao|tarefa|simulado)/.test(normalizedMessage) ||
        /(dica|orienta|pista).*(card|cards|flashcard|flashcards)/.test(normalizedMessage) ||
        /(quem|criador|criou|fundador).*(site|vetstudy|plataforma|app)?/.test(normalizedMessage)
      );
    if (shouldUseInstantReply) {
      return res.json({
        answer: fastReply,
        citations: [],
        model: "vetstudy-fast-reply",
        mode,
        usedWebSearch: false
      });
    }

    if (!installedModels.size) {
      await refreshInstalledModels();
    }

    const model = chooseModel(mode);
    const appContextMessage = formatAppContext(appContext);
    const messages = [
      {
        role: "system",
        content:
          mode === "deep"
            ? "Voce e a VetyAI, assistente de estudos do VetStudy. Responda sempre em portugues do Brasil, com linguagem clara, natural e util. Nao cumprimente nem se apresente no inicio; responda direto ao pedido. Priorize contexto e exemplos de medicina veterinaria quando o tema permitir. Quando a pergunta for simples, responda de forma curta e conversacional. Quando for conteudo de estudo, explique em blocos curtos, com topicos e sem enrolacao. Nao invente fatos; se nao souber, diga de forma direta."
            : "Voce e a VetyAI, assistente de estudos do VetStudy. Responda sempre em portugues do Brasil, com linguagem clara, natural e util. Nao cumprimente nem se apresente no inicio; responda direto ao pedido. Priorize contexto e exemplos de medicina veterinaria quando o tema permitir. Responda em ate 6 linhas na maioria dos casos e use topicos objetivos quando ajudar. Se o usuario pedir resumo, plano, perguntas ou flashcards, entregue direto sem introducao longa. Nao invente fatos; se nao souber, diga de forma direta."
      },
      {
        role: "system",
        content: VETSTUDY_SITE_GUIDE
      },
      ...(appContextMessage ? [{ role: "system", content: appContextMessage }] : []),
      ...history,
      { role: "user", content: message }
    ];

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: AbortSignal.timeout(AI_CHAT_TIMEOUT_MS),
      body: JSON.stringify({
        model,
        messages,
        think: false,
        stream: false,
        keep_alive: "10m",
        options: buildOllamaOptions(mode)
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Falha ao consultar o Ollama.");
    }

    const data = await response.json();
    const answer = data?.message?.content?.trim() || "Não consegui montar uma resposta útil agora.";

    return res.json({
      answer,
      citations: [],
      model,
      mode,
      usedWebSearch: false
    });
  } catch (error) {
    console.error("Erro no /api/ai-chat:", error);

    const message = String(error?.message || "");

    if (message.includes("ECONNREFUSED") || message.includes("fetch failed")) {
      return res.status(500).json({
        error: "O Ollama não está aberto no computador. Abra o Ollama e tente novamente."
      });
    }

    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      return res.status(504).json({
        error: "A VetyAI demorou mais que o esperado. Tente uma pergunta mais curta."
      });
    }

    return res.status(500).json({
      error: "O assistente está temporariamente indisponível. Tente novamente em instantes."
    });
  }
});

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(SITE_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`VetStudy rodando em http://localhost:${PORT}`);
  refreshInstalledModels().then(() => {
    const modelsToWarm = [chooseModel("fast"), chooseModel("deep")]
      .filter(Boolean)
      .filter((model, index, array) => array.indexOf(model) === index);
    modelsToWarm.forEach((model) => {
      prewarmModel(model);
    });
  });
});
