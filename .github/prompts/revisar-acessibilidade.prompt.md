---
description: "Revisa a acessibilidade de um fluxo da interface do DMS."
name: revisar-acessibilidade
argument-hint: "Fluxo ou componente a revisar (ex. upload)"
agent: agent
---

# Revisar acessibilidade

Revise `${input:escopo:Fluxo ou componente a revisar}` no frontend, seguindo as [instruções do projeto](../copilot-instructions.md). Adapte a análise ao fluxo de identificação, envio, listagem ou download de documentos, conforme o escopo.

- Verifique HTML semântico, nomes acessíveis e associação entre campos, instruções e erros; prefira elementos nativos e use ARIA apenas quando necessário.
- Confira operação por teclado, ordem e visibilidade do foco, inclusive quando a interface muda após uma ação.
- Avalie anúncios de carregamento, sucesso e erro, contraste, uso de cor, redimensionamento e adaptação a telas pequenas.
- Examine os testes existentes. Execute verificações automatizadas disponíveis e, quando possível, teste o fluxo com teclado e tecnologia assistiva; não instale ferramentas sem necessidade.
- Relacione os problemas identificados aos critérios WCAG 2.2 aplicáveis quando houver evidência suficiente, sem declarar conformidade com base apenas em análise estática ou testes automatizados.

Apresente os achados por gravidade, com arquivo, impacto, orientação de correção e forma de verificação. Informe o que foi testado e o que não pôde ser verificado. Não altere arquivos durante a revisão.

Adaptado do agente [Accessibility Expert](https://github.com/github/awesome-copilot/blob/main/agents/accessibility.agent.md) do repositório awesome-copilot.