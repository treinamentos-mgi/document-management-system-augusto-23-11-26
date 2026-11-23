import { useState } from 'react';
import { downloadDocument } from '../services/documents';

export default function DownloadButton({ document, userId }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    setDownloading(true);
    setError('');
    try {
      const blob = await downloadDocument(userId, document.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.originalName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="download-action">
      <button className="download-button" type="button" onClick={handleDownload} disabled={downloading} aria-label={`Baixar ${document.originalName}`}>
        {downloading ? 'Baixando...' : 'Baixar'}
      </button>
      {error && <p className="error-message" role="alert">{error}</p>}
    </div>
  );
}