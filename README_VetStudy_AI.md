# VetStudy com chat AI flutuante

Este pacote inclui:

- chat flutuante que abre e minimiza
- conversa estilo assistente
- backend Node com rota `/api/ai-chat`
- integracao com Ollama local para manter o chat sem chave de API paga no front-end
- modos da VetyAI: `Rapido` e `Detalhado`
- manual interno do VetStudy para responder duvidas sobre como usar o site

## Como rodar

1. Abra a pasta do projeto no terminal.
2. Rode `npm install`.
3. Copie `.env.example` para `.env`.
4. Abra o Ollama no computador.
5. Rode `ollama pull llama3.2` para o modo rapido.
6. Rode `ollama pull qwen3.5:9b` para o modo detalhado.
7. Rode `npm start`.
8. Abra `http://localhost:3000`.

## Configuracao da VetyAI

O modo `Rapido` usa `OLLAMA_FAST_MODEL`, por padrao `llama3.2`.

O modo `Detalhado` usa `OLLAMA_DEEP_MODEL`, por padrao `qwen3.5:9b`.

Se o modelo rapido nao estiver instalado, o servidor tenta usar `OLLAMA_FALLBACK_MODEL` para o chat nao quebrar.

Para respostas mais curtas e rapidas, reduza `OLLAMA_NUM_PREDICT`. Para respostas detalhadas maiores, ajuste `OLLAMA_DEEP_NUM_PREDICT`.

A VetyAI tambem recebe contexto seguro do app, como pagina atual, nome do perfil, materias e progresso dos flashcards. A senha nunca deve ser enviada para o chat.

## Observacao importante

O chat nao deve ser ligado direto no HTML com chave de API no front-end, porque isso expoe a chave para qualquer pessoa. Por isso a integracao passa por `server.js`.
