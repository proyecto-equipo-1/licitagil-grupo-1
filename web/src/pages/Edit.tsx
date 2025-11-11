import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchJSON } from '../services/api';

import '../styles/formulario.css'; 
import { useAuth } from '../contexts/AuthContext';


type Licitacion = {
  id: number;
  titulo: string;
  descripcion: string;
  estado: 'Borrador' | 'PendienteAprobacion' | 'Aprobada' | 'Abierta' | 'En_revision' | 'Cerrada' | 'Rechazada';
  fechaCierre: string;
  pdfPath: string | null;
  pdfOriginalName: string | null;
  creador: { id: number };
  departamentoId: number | null;
};

type LicitacionForm = {
  titulo: string;
  descripcion: string;
  estado: string;
  fecha_cierre: string;
};

const PanelDeAcciones = ({ licitacion }: { licitacion: Licitacion }) => {
  const { user } = useAuth();
  const nav = useNavigate();

  
  const handleAccion = async (endpoint: string, body?: object) => {
    if (!confirm(`¿Estás seguro de que quieres ${endpoint.replace('-', ' ')} esta licitación?`)) {
      return;
    }
    try {
      await fetchJSON(`/api/licitaciones/${licitacion.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      alert('Acción realizada con éxito.');
      nav('/'); 
    } catch (error: any) {
      const errorData = await error.json?.().catch(() => null);
      const errorMessage = errorData?.error || 'Ocurrió un error inesperado.';
      alert(`Error: ${errorMessage}`);
    }
  };


  const handleRechazar = () => {
    const motivo = prompt('Por favor, introduce el motivo del rechazo:');
    if (motivo && motivo.trim()) {
      handleAccion('rechazar', { motivo });
    } else if (motivo !== null) {
      alert('El motivo del rechazo es obligatorio.');
    }
  };
  

  const getBotonesDeAccion = () => {
    if (!user) return null;

    switch (licitacion.estado) {
      case 'Borrador':
        if (user.rol === 'Funcionario' && user.id === licitacion.creador.id) {
          return <button onClick={() => handleAccion('enviar-aprobacion')} className="btn btn-primary">Enviar a Aprobación</button>;
        }
        break;
      case 'PendienteAprobacion':
        if (user.rol === 'Supervisor' && user.departamentoId === licitacion.departamentoId) {
          return (
            <>
              <button onClick={() => handleAccion('aprobar')} className="btn btn-success">✅ Aprobar</button>
              <button onClick={handleRechazar} className="btn btn-danger">❌ Rechazar</button>
            </>
          );
        }
        break;
      case 'Aprobada':
        if (user.rol === 'Adquisiciones' || user.rol === 'Administrador') {
          return <button onClick={() => handleAccion('publicar')} className="btn btn-info">🌍 Publicar Licitación</button>;
        }
        break;
      default:
        return null;
    }
    return null;
  };

  const botones = getBotonesDeAccion();

  
  if (!botones) {
    return null;
  }

  return (
    <div className="actions-panel">
      <h3 className="actions-panel-title">Acciones de Aprobación</h3>
      <div className="actions-panel-buttons">
        {botones}
      </div>
    </div>
  );
};

export default function EditPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [licitacion, setLicitacion] = useState<Licitacion | null>(null); 
  const [form, setForm] = useState<LicitacionForm | null>(null);
  const [removePdf, setRemovePdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const descargarPlantilla = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'}/api/licitaciones/plantilla/descargar`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Error al descargar plantilla');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla-licitacion.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar plantilla:', error);
      alert('Error al descargar la plantilla');
    }
  };

  useEffect(() => {
    if (id) {
      fetchJSON(`/api/licitaciones/${id}`).then((lic: Licitacion) => {
        setLicitacion(lic); 
        setForm({
          titulo: lic.titulo,
          descripcion: lic.descripcion,
          estado: lic.estado,
          fecha_cierre: new Date(lic.fechaCierre).toISOString().slice(0, 16)
        });
      }).catch(err => {
        console.error("Error al cargar la licitación:", err);
        alert("No se pudo cargar la licitación.");
        nav('/');
      });
    }
  }, [id, nav]);

 
  if (!form || !licitacion) return <p>Cargando...</p>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => prevForm ? { ...prevForm, [name]: value } : null);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    
    
  }

  return (
    <div className="form-page-container">
      
      <PanelDeAcciones licitacion={licitacion} />

      <form onSubmit={submit} className="form-container">
        <h2 className="form-title">Editar Licitación</h2>

       

        <div className="form-group">
          <label htmlFor="titulo">Título</label>
          <input id="titulo" name="titulo" value={form.titulo} onChange={handleInputChange} required />
        </div>
        
        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea id="descripcion" name="descripcion" value={form.descripcion} onChange={handleInputChange} required />
        </div>
        
        <div className="form-group">
          <label htmlFor="estado">Estado</label>
          <select id="estado" name="estado" value={form.estado} onChange={handleInputChange}>
           
            <option value="Borrador">Borrador</option>
            <option value="Abierta">Abierta</option>
            <option value="En_revision">En revisión</option>
            <option value="Cerrada">Cerrada</option>
            <option value="Rechazada">Rechazada</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="fecha_cierre">Fecha de cierre</label>
          <input type="datetime-local" id="fecha_cierre" name="fecha_cierre" value={form.fecha_cierre} onChange={handleInputChange} required />
        </div>
        
        <div className="form-group">
            <label>PDF actual</label>
            {licitacion.pdfPath ? (
                <div>
                    <div><a href={`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'}/api/licitaciones/${id}/pdf`} target="_blank" rel="noreferrer">{licitacion.pdfOriginalName || 'Descargar PDF'}</a></div>
                    <label><input type="checkbox" checked={removePdf} onChange={e => setRemovePdf(e.target.checked)} /> Eliminar PDF</label>
                </div>
            ) : <div>No hay PDF</div>}
        </div>

        <div className="form-group">
          <label htmlFor="pdf">Subir nuevo PDF (reemplaza al actual, máx. 2MB)</label>
          <div style={{ marginBottom: '12px' }}>
            <a href={`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'}/api/licitaciones/plantilla/descargar`} className="btn btn-secondary" download>
              📥 Descargar Plantilla Oficial
            </a>
          </div>
          <input type="file" id="pdf" name="pdf" accept="application/pdf" ref={pdfInputRef} />
        </div>
        
        <div className="form-actions">
          <Link to="/" className="btn btn-secondary">← Cancelar</Link>
          <button type="submit" className="btn btn-primary">💾 Guardar Cambios</button>
        </div>
      </form>
    </div>
  );
}