import DownloadButton from './DownloadButton';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentList({ documents, userId, loading, error, onRetry }) {
  return (
    <section className="documents-section" aria-labelledby="documents-title">
      <div className="section-heading">
        <div><span className="eyebrow">BIBLIOTECA</span><h2 id="documents-title">Meus documentos</h2></div>
        {!loading && !error && <span className="document-count">{documents.length} {documents.length === 1 ? 'arquivo' : 'arquivos'}</span>}
      </div>
      {loading ? <p className="list-state" role="status">Carregando documentos...</p> : error ? (
        <div className="list-state"><p className="error-message" role="alert">{error}</p><button className="text-button" type="button" onClick={onRetry}>Tentar novamente</button></div>
      ) : documents.length === 0 ? (
        <div className="list-state"><strong>Nenhum documento por aqui</strong><p>Os arquivos enviados aparecerão nesta lista.</p></div>
      ) : (
        <ul className="document-list">
          {documents.map((document) => (
            <li className="document-row" key={document.id}>
              <span className="file-mark" aria-hidden="true">DOC</span>
              <div className="document-info"><strong>{document.originalName}</strong><span>{formatSize(document.size)} <span aria-hidden="true">·</span> {new Date(document.uploadedAt).toLocaleString('pt-BR')}</span></div>
              <DownloadButton document={document} userId={userId} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}