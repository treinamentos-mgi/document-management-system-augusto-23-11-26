import { useState } from 'react';
import { uploadDocument } from '../services/documents';

export default function UploadComponent({ userId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || uploading) return;
    const form = event.currentTarget;
    setUploading(true);
    setError('');
    setMessage('');
    try {
      await uploadDocument(userId, file);
      form.reset();
      setFile(null);
      setMessage('Documento enviado com sucesso.');
      onUploaded();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="upload-section" aria-labelledby="upload-title">
      <div className="section-heading">
        <div><span className="eyebrow">ADICIONAR ARQUIVO</span><h2 id="upload-title">Enviar documento</h2></div>
        <span className="section-index">01</span>
      </div>
      <form className="upload-form" onSubmit={handleSubmit}>
        <label htmlFor="document-file">Arquivo</label>
        <div className="upload-controls">
          <input id="document-file" type="file" onChange={(event) => { setFile(event.target.files[0] || null); setMessage(''); setError(''); }} disabled={uploading} required />
          <button type="submit" disabled={!file || uploading}>{uploading ? 'Enviando...' : 'Enviar documento'}</button>
        </div>
        {message && <p className="success-message" role="status">{message}</p>}
        {error && <p className="error-message" role="alert">{error}</p>}
      </form>
    </section>
  );
}