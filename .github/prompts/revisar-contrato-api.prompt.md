---
description: "Revisa a compatibilidade entre o frontend, o backend e a especificação da API."
name: revisar-contrato-api
argument-hint: "Fluxo ou endpoint a revisar (ex. upload)"
agent: agent
---

# Revisar contrato da API

Revise o fluxo ou endpoint `${input:escopo:Fluxo ou endpoint a revisar}` considerando as [instruções do projeto](../copilot-instructions.md) e a [especificação do DMS](../../docs/specs/dms-spec.md).

Compare as chamadas do frontend com as rotas, controllers e serviços do backend relevantes. Verifique caminhos, métodos, cabeçalhos, formatos de entrada e resposta, erros e isolamento por usuário. Confira também os testes existentes e identifique lacunas relacionadas ao escopo.

Apresente os problemas por ordem de gravidade, com referências aos arquivos, impacto e recomendação. Informe os testes executados ou por que não foram executados. Se não encontrar problemas, declare isso e mencione riscos ou lacunas de teste. Não altere arquivos durante a revisão.