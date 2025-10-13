import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchJSON } from '../services/api';
import '../styles/formulario.css'; 

type LicitacionForm = {
  titulo: string;
  descripcion: string;
  estado: string;
  fecha_cierre: string;
};

export default function EditPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState<LicitacionForm | null>(null);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [pdfOriginalName, setPdfOriginalName] = useState<string | null>(null);
  const [removePdf, setRemovePdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null as any);

  useEffect(() => {
   
    if (id) {
      fetchJSON(`/api/licitaciones/${id}`).then(lic => {
        setForm({
          titulo: lic.titulo,
          descripcion: lic.descripcion,
          estado: lic.estado,
          // Formateamos la fecha para el input datetime-local
          fecha_cierre: new Date(lic.fechaCierre).toISOString().slice(0, 16)
        });
        setPdfPath(lic.pdfPath || null);
        setPdfOriginalName(lic.pdfOriginalName || null);
      });
    }
  }, [id]);

  if (!form) return <p>Cargando...</p>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => prevForm ? { ...prevForm, [name]: value } : null);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    
    try {
      const hasFile = pdfInputRef.current && pdfInputRef.current.files && pdfInputRef.current.files[0];
      
      // Validar tamaño del archivo
      if (hasFile && pdfInputRef.current?.files?.[0]) {
        const file = pdfInputRef.current.files[0];
        const maxSize = 2 * 1024 * 1024; // 2MB
        
        if (file.size > maxSize) {
          alert('El archivo PDF es demasiado grande. El tamaño máximo permitido es 2MB.');
          return;
        }
        
        if (file.type !== 'application/pdf') {
          alert('Solo se permiten archivos PDF.');
          return;
        }
      }
      
      if (hasFile || removePdf) {
        // Si hay archivo o se quiere eliminar, usar FormData
        const formData = new FormData();
        formData.append('titulo', form.titulo);
        formData.append('descripcion', form.descripcion);
        formData.append('estado', form.estado);
        formData.append('fechaCierre', form.fecha_cierre);
        
        if (hasFile && pdfInputRef.current?.files?.[0]) {
          formData.append('pdf', pdfInputRef.current.files[0]);
        }
        
        if (removePdf) {
          formData.append('removePdf', '1');
        }
        
        const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'}/api/licitaciones/${id}`, {
          method: 'PUT',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Error al actualizar la licitación');
        }
      } else {
        // Si no hay cambios de archivo, usar JSON
        const licitacionData = {
          titulo: form.titulo,
          descripcion: form.descripcion,
          estado: form.estado,
          fechaCierre: form.fecha_cierre
        };
        
        await fetchJSON(`/api/licitaciones/${id}`, { 
          method: 'PUT', 
          body: JSON.stringify(licitacionData) 
        });
      }
      
      nav(`/`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la licitación');
    }
  }

  return (
    <form onSubmit={submit} className="form-container">
      <h2 className="form-title">Editar Licitación</h2>

      <div className="form-group">
        <label htmlFor="titulo">Título</label>
        <input 
          id="titulo"
          name="titulo"
          value={form.titulo} 
          onChange={handleInputChange} 
          required 
          minLength={3} 
          maxLength={120}
        />
      </div>

      <div className="form-group">
        <label htmlFor="descripcion">Descripción</label>
        <textarea 
          id="descripcion"
          name="descripcion"
          value={form.descripcion} 
          onChange={handleInputChange} 
          required 
          minLength={10}
        />
      </div>

      <div className="form-group">
        <label htmlFor="estado">Estado</label>
        <select 
          id="estado"
          name="estado"
          value={form.estado} 
          onChange={handleInputChange}
        >
          <option value="Abierta">Abierta</option>
          <option value="En_revision">En revisión</option>
          <option value="Cerrada">Cerrada</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="fecha_cierre">Fecha de cierre</label>
        <input 
          type="datetime-local" 
          id="fecha_cierre"
          name="fecha_cierre"
          value={form.fecha_cierre} 
          onChange={handleInputChange} 
          required
        />
      </div>

      <div className="form-group">
        <label>PDF actual</label>
        {pdfPath ? (
            <div>
                <div style={{ marginBottom: 6 }}>
                  <a href={`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'}/api/licitaciones/${id}/pdf`} target="_blank" rel="noreferrer">{pdfOriginalName || pdfPath.split('/').pop()}</a>
                </div>
                <div>
                  <label><input type="checkbox" checked={removePdf} onChange={e => setRemovePdf(e.target.checked)} /> Eliminar PDF</label>
                </div>
            </div>
        ) : (
          <div>No hay PDF</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="pdf">Subir nuevo PDF (reemplaza al actual, máx. 2MB)</label>
        <input type="file" id="pdf" name="pdf" accept="application/pdf" ref={pdfInputRef} />
        <small style={{color: '#666', fontSize: '0.9em'}}>
          Solo archivos PDF. Tamaño máximo: 2MB
        </small>
      </div>

      <div className="form-actions">
        <Link to="/" className="btn btn-secondary">Cancelar</Link>
        <button type="submit" className="btn btn-primary">Guardar Cambios</button>
      </div>
    </form>
  );
}