# Especificação - Document Management System

## 1. Objetivo

Entregar uma aplicação web que permita a usuários enviar, listar e baixar documentos, com armazenamento local ao servidor e gestão simples por usuário.

## 2. Escopo

### Dentro do escopo

- Upload de documentos
- Listagem de documentos
- Download de documentos
- Gestão simples por usuário (cada documento pertence a um dono)
- Frontend em React para envio, listagem e download
- Backend em Node.js + Express (CommonJS)

### Fora do escopo

- Armazenamento externo ou em nuvem (S3, Azure Blob, Google Drive etc.)
- Versionamento de documentos
- Autenticação completa (login, senha, tokens, sessões)
- Persistência de metadados em banco de dados (nesta fase, apenas em memória)
- Edição, exclusão ou compartilhamento de documentos
- TypeScript (JavaScript puro nesta fase)

## 3. Requisitos funcionais

| ID    | Requisito |
| ----- | --------- |
| RF-01 | O usuário pode enviar um documento via `POST /upload` (multipart/form-data, campo `file`) |
| RF-02 | Ao enviar, o sistema registra metadados (id, nome original, tamanho, data de upload e dono) e grava o arquivo localmente |
| RF-03 | O usuário pode listar os documentos que enviou via `GET /documents` |
| RF-04 | O usuário pode baixar um documento pelo identificador via `GET /documents/:id/download`, recebendo o conteúdo original |
| RF-05 | O download devolve o arquivo com `Content-Disposition` contendo o nome original |
| RF-06 | Um usuário não pode listar nem baixar documentos de outro usuário |
| RF-07 | Upload sem arquivo é rejeitado com 400 |
| RF-08 | Arquivo acima do limite configurado é rejeitado com 413 |
| RF-09 | Identificador inexistente retorna 404 |
| RF-10 | O frontend exibe a lista de documentos do usuário e permite enviar um arquivo e baixar cada documento |

## 4. Requisitos não funcionais

| ID     | Requisito |
| ------ | --------- |
| RNF-01 | Arquivos gravados no filesystem local em `backend/storage`, usando `multer` com `diskStorage` |
| RNF-02 | Metadados mantidos em memória nesta fase (perdidos ao reiniciar o processo) |
| RNF-03 | Configuração via variáveis de ambiente (12-Factor): `PORT`, `STORAGE_DIR`, `MAX_FILE_SIZE_MB` |
| RNF-04 | Nenhum provedor externo de armazenamento ou upload de terceiros |
| RNF-05 | Erros tratados nos limites do sistema: entrada HTTP e leitura/escrita de arquivos |
| RNF-06 | Testes do backend com o runner nativo do Node (`node:test`) |
| RNF-07 | Frontend acessa a API pelo prefixo `/api`, com proxy no Vite |

## 5. Modelo de dados (metadados do documento)

Entidade mantida em memória (`Map` indexado por `id`) no repositório de documentos.

| Campo        | Tipo   | Descrição |
| ------------ | ------ | --------- |
| id           | string | Identificador único do documento (UUID v4) |
| originalName | string | Nome original do arquivo enviado |
| storedName   | string | Nome do arquivo em `STORAGE_DIR` (interno, não exposto) |
| mimeType     | string | Tipo MIME informado no upload |
| size         | number | Tamanho em bytes |
| uploadedAt   | string | Data/hora do upload (ISO 8601) |
| owner        | string | Identificador do usuário dono |

Premissa de identificação: sem autenticação nesta fase. O cliente informa o usuário pelo cabeçalho `X-User-Id`. Ausente, a requisição é rejeitada com 400.

## 6. Contratos de API

Erros seguem o formato `{ "error": "mensagem em português" }`. No frontend, as chamadas usam o prefixo `/api`.

### POST /upload

- Cabeçalhos: `X-User-Id` (obrigatório)
- Entrada: `multipart/form-data` com o campo `file`
- Sucesso: `201 Created`

```json
{
  "id": "2f1c...",
  "originalName": "contrato.pdf",
  "mimeType": "application/pdf",
  "size": 20480,
  "uploadedAt": "2026-11-23T18:00:00.000Z",
  "owner": "user-123"
}
```

- Erros: `400` (sem arquivo ou sem `X-User-Id`), `413` (acima do limite)

### GET /documents

- Cabeçalhos: `X-User-Id` (obrigatório)
- Sucesso: `200 OK` com a lista de metadados do usuário (sem `storedName`)
- Erros: `400` (sem `X-User-Id`)

### GET /documents/:id/download

- Cabeçalhos: `X-User-Id` (obrigatório)
- Sucesso: `200 OK` com conteúdo binário; `Content-Type` = `mimeType`; `Content-Disposition: attachment; filename="<originalName>"`
- Erros: `400` (sem `X-User-Id`), `404` (inexistente), `403` (documento de outro usuário)

### GET /health

- Sucesso: `200 OK` com `{ "status": "ok" }` (já existente no seed)

## 7. Decisões arquiteturais

- Backend em Clean Architecture simples em `backend/src`, com fluxo `routes -> controllers -> services -> repositories`. Camadas internas não conhecem as externas.
  - `routes/`: define endpoints e delega para controllers
  - `controllers/`: entrada/saída HTTP e validação básica
  - `services/`: regras de negócio (ownership, montagem de metadados)
  - `repositories/`: arquivos via `multer.diskStorage` em `STORAGE_DIR`; metadados em memória
- `multer` fica restrito à configuração de upload na camada HTTP; o repositório recebe o caminho gravado.
- Erros de filesystem são convertidos em respostas HTTP nos controllers, sem expor detalhes internos.
- Frontend em React + Vite (ESM), organizado em `components/`, `pages/` e `services/`. Chamadas via `fetch` a `/api`. Componentes funcionais com hooks.
- Princípios: SOLID, DRY, KISS, YAGNI, 12-Factor.
- Preferir dependências já presentes (`express`, `multer`, `react`, `vite`).

## 8. Plano de execução

1. **Configuração**: ler `PORT`, `STORAGE_DIR` e `MAX_FILE_SIZE_MB` com padrões; garantir `backend/storage`.
2. **Repositório**: `multer.diskStorage` para arquivos; `Map` em memória para metadados (salvar, listar por dono, buscar por id).
3. **Serviço**: criar metadados a partir do arquivo, listar por dono, obter documento com verificação de dono.
4. **Upload**: `POST /upload` com validação de `X-User-Id`, arquivo ausente (400) e limite (413).
5. **Listagem e download**: `GET /documents` e `GET /documents/:id/download` com 400, 403, 404 e `Content-Disposition`.
6. **Testes do backend** (`node:test`): upload válido, sem arquivo, acima do limite, listagem filtrada, download do dono, 403 de outro dono, 404 inexistente.
7. **Frontend base**: serviço de API em `services/` (`fetch` para `/api`) e campo para `X-User-Id`.
8. **Frontend funcional**: formulário de upload, lista e download em `components/` e `pages/`.
9. **Validação**: `npm test` no backend, `npm run build` no frontend e fluxo manual upload -> listagem -> download.
10. **Documentação**: README com variáveis de ambiente e exemplos de chamadas.

## Premissas em aberto

- Identificação por `X-User-Id` (sem autenticação nesta fase).
- Padrão de `MAX_FILE_SIZE_MB` e lista de tipos MIME aceitos ainda não definidos (assume-se qualquer tipo com limite de tamanho).
