import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchJSON } from '../services/api';
import '../styles/formulario.css'; 

import '../styles/detalle.css';

type Licitacion = {
  id: number;
  titulo: string;
  estado: string;
  fechaCierre: string;
  descripcion: string;
  pdfPath?: string | null;
  pdfOriginalName?: string | null;
};

const formatearFechaCompleta = (fechaString: string) => {
  const opciones: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(fechaString).toLocaleString('es-ES', opciones);
};

export default function Detail() {
  const { id } = useParams();
  const [lic, setLic] = useState<Licitacion | null>(null);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    fetchJSON(`/api/licitaciones/${id}`).then(setLic);
  }, [id]);

  if (!lic) return <p>Cargando...</p>;

  const handlePdfError = () => {
    setPdfError(true);
  };

  return (
    <div className="detalle-flex-container">
      {lic.pdfPath ? (
        <div className="detalle-pdf-viewer">
          {!pdfError ? (
            <iframe
              src={`/api/licitaciones/${id}/pdf`}
              title="PDF de la licitación"
              onError={handlePdfError}
              style={{ border: 'none' }}
            />
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              flex: 1,
              color: '#666',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <p>❌ Error al cargar el PDF</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>El archivo puede estar dañado o no disponible</p>
            </div>
          )}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
          {lic.pdfOriginalName && <div style={{ marginBottom: 6, fontSize: 14 }}>{lic.pdfOriginalName}</div>}
            <a href={`/api/licitaciones/${id}/pdf?download=1`} target="_blank" rel="noopener noreferrer" className="btn btn-pdf">
              📄 Descargar PDF
            </a>
          </div>
        </div>
      ) : (
        <div className="detalle-pdf-viewer detalle-pdf-vacio">
          <div style={{ textAlign: 'center' }}>
            <p>📄</p>
            <em>No hay PDF adjunto a esta licitación</em>
          </div>
        </div>
      )}
      <div className="detalle-info-panel">
        <h2 className="detalle-titulo">{lic.titulo}</h2>
        <div className="detalle-info">
          <p><strong>Estado:</strong> <span className={`estado-badge estado-${lic.estado.toLowerCase()}`}>{lic.estado.replace('_', ' ')}</span></p>
          <p><strong>Fecha de cierre:</strong> {formatearFechaCompleta(lic.fechaCierre)}</p>
        </div>
        <div className="detalle-descripcion">
          <strong>Descripción:</strong>
          <p style={{ marginTop: '8px' }}>{lic.descripcion}</p>
        </div>
        <div className="detalle-acciones">
          <Link to="/" className="btn btn-secondary">Volver al Listado</Link>
          <Link to={`/licitaciones/${lic.id}/editar`} className="btn btn-primary">Editar</Link>
        </div>
      </div>
    </div>
  );
}
