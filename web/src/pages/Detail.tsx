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
  estadoValidacion?: 'Borrador' | 'Incompleta' | 'Completa';
  seccionesFaltantes?: string[];
  mensajeValidacion?: string | null;
  fechaValidacion?: string | null;
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
              src={`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'}/api/licitaciones/${id}/pdf`}
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
            {lic.pdfOriginalName && (
              <div style={{ marginBottom: 8, fontSize: 14, color: '#666' }}>
                {lic.pdfOriginalName}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => window.open(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'}/api/licitaciones/${id}/pdf`, '_blank')}
                className="btn btn-primary"
              >
                👁️ Ver PDF
              </button>
              <a 
                href={`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'}/api/licitaciones/${id}/pdf?download=1`}
                className="btn btn-secondary"
                download
              >
                📄 Descargar PDF
              </a>
            </div>
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
          
          {/* Estado de Validación del PDF */}
          {lic.pdfPath && lic.estadoValidacion && (
            <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: 
              lic.estadoValidacion === 'Completa' ? '#d4edda' : 
              lic.estadoValidacion === 'Incompleta' ? '#fff3cd' : '#f8d7da',
              border: `1px solid ${
                lic.estadoValidacion === 'Completa' ? '#c3e6cb' : 
                lic.estadoValidacion === 'Incompleta' ? '#ffeaa7' : '#f5c6cb'
              }`
            }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: 
                lic.estadoValidacion === 'Completa' ? '#155724' : 
                lic.estadoValidacion === 'Incompleta' ? '#856404' : '#721c24'
              }}>
                {lic.estadoValidacion === 'Completa' && '✅ Validación Completa'}
                {lic.estadoValidacion === 'Incompleta' && '⚠️ Validación Incompleta'}
                {lic.estadoValidacion === 'Borrador' && '📝 Borrador - Sin validar'}
              </p>
              {lic.mensajeValidacion && (
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>{lic.mensajeValidacion}</p>
              )}
              {lic.seccionesFaltantes && lic.seccionesFaltantes.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <strong style={{ fontSize: '14px' }}>Secciones faltantes:</strong>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '14px' }}>
                    {lic.seccionesFaltantes.map((seccion, idx) => (
                      <li key={idx}>{seccion}</li>
                    ))}
                  </ul>
                </div>
              )}
              {lic.fechaValidacion && (
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', fontStyle: 'italic' }}>
                  Validado: {formatearFechaCompleta(lic.fechaValidacion)}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="detalle-descripcion">
          <strong>Descripción:</strong>
          <p style={{ marginTop: '8px' }}>{lic.descripcion}</p>
        </div>
        <div className="detalle-acciones">
          <Link to="/" className="btn btn-secondary">
            ← Volver al Listado
          </Link>
          <Link to={`/licitaciones/${lic.id}/editar`} className="btn btn-primary">
            ✏️ Editar
          </Link>
        </div>
      </div>
    </div>
  );
}
