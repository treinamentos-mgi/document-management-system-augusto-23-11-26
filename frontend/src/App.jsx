import { useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { listDocuments } from './services/documents';
import './styles.css';

function DocumentWorkspace({ userId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    listDocuments(userId)
      .then((result) => {
        if (active) setDocuments(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [userId, revision]);

  function refreshDocuments() {
    setRevision((current) => current + 1);
  }

  return (
    <>
      <UploadComponent userId={userId} onUploaded={refreshDocuments} />
      <DocumentList documents={documents} userId={userId} loading={loading} error={error} onRetry={refreshDocuments} />
    </>
  );
}

export default function App() {
  const [userInput, setUserInput] = useState('');
  const [userId, setUserId] = useState('');

  function handleUserSubmit(event) {
    event.preventDefault();
    setUserId(userInput.trim());
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="/" aria-label="Documentos, página inicial">
            <span className="brand-mark" aria-hidden="true">D</span>
            <span>Documentos</span>
          </a>
          <span className="topbar-label">GESTÃO DE ARQUIVOS</span>
        </div>
      </header>

      <main className="content">
        <div className="page-heading">
          <div>
            <span className="eyebrow">ÁREA DE TRABALHO</span>
            <h1>Seus documentos</h1>
            <p>Arquivos organizados em um só lugar.</p>
          </div>
          {userId && <span className="active-user">Usuário ativo <strong>{userId}</strong></span>}
        </div>

        <section className="identity-section" aria-labelledby="identity-title">
          <div>
            <h2 id="identity-title">Identificação</h2>
            <p>Informe seu identificador de usuário.</p>
          </div>
          <form className="identity-form" onSubmit={handleUserSubmit}>
            <label className="sr-only" htmlFor="user-id">Identificador do usuário</label>
            <input id="user-id" value={userInput} onChange={(event) => setUserInput(event.target.value)} placeholder="Identificador do usuário" required />
            <button type="submit" disabled={!userInput.trim()}>Acessar</button>
          </form>
        </section>

        {userId ? (
          <DocumentWorkspace key={userId} userId={userId} />
        ) : (
          <div className="initial-state">
            <span className="state-number">01</span>
            <div><h2>Comece pela identificação</h2><p>Informe seu usuário para acessar seus documentos.</p></div>
          </div>
        )}
      </main>
    </div>
  );
}
