// Seed do servidor backend do Document Management System.
//
// Este arquivo é apenas um ponto de partida mínimo. Ao longo do workshop você
// vai usar o Agent Mode do GitHub Copilot para construir as camadas:
//   - routes/       (definição das rotas)
//   - controllers/  (entrada HTTP e validação)
//   - services/     (regras de negócio)
//   - repositories/ (persistência: arquivos locais + metadados em memória)
//
// Restrição do projeto: uploads são gravados no filesystem local da aplicação
// usando multer com diskStorage. Não utilize provedores externos.

const express = require('express');
const config = require('./config');
const documentsRoutes = require('./routes/documents.routes');
const { AppError } = require('./errors');
const { DocumentNotFoundError, DocumentAccessDeniedError } = require('./services/document.errors');

const app = express();

app.use(express.json());

// Endpoint de verificação de saúde.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(documentsRoutes);

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof DocumentNotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  if (err instanceof DocumentAccessDeniedError) {
    return res.status(403).json({ error: err.message });
  }
  if (err.expose && err.status) {
    return res.status(err.status).json({ error: 'Requisição inválida.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`DMS backend ouvindo na porta ${config.port}`);
  });
}

module.exports = app;
