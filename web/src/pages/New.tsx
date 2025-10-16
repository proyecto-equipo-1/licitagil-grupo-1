import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchJSON } from '../services/api';
import '../styles/formulario.css'; 
type NuevaLicitacionForm = {
  titulo: string;
  descripcion: string;
  estado: 'Abierta' | 'En_revision' | 'Cerrada';
  fecha_cierre: string;
};

export default function NewPage() {
  const nav = useNavigate();
  
  const [form, setForm] = useState<NuevaLicitacionForm>({
    titulo: '',
    descripcion: '',
    estado: 'Abierta',
    fecha_cierre: ''
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value as any }));
  };

  const pdfInputRef = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    
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
      
      if (hasFile && pdfInputRef.current?.files?.[0]) {
        // Si hay archivo, usar FormData
        const formData = new FormData();
        formData.append('titulo', form.titulo);
        formData.append('descripcion', form.descripcion);
        formData.append('estado', form.estado);
        formData.append('fechaCierre', form.fecha_cierre);
        formData.append('pdf', pdfInputRef.current.files[0]);
        
        const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'}/api/licitaciones`, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Error al crear la licitación');
        }
        
        const lic = await response.json();
        nav(`/licitaciones/${lic.id}`);
      } else {
        // Si no hay archivo, usar JSON
        const licitacionData = {
          titulo: form.titulo,
          descripcion: form.descripcion,
          estado: form.estado,
          fechaCierre: form.fecha_cierre
        };
        
        const lic = await fetchJSON('/api/licitaciones', {
          method: 'POST',
          body: JSON.stringify(licitacionData)
        });
        
        nav(`/licitaciones/${lic.id}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear la licitación');
    }
  }

  return (
    <form onSubmit={submit} className="form-container">
      <h2 className="form-title">Crear Nueva Licitación</h2>

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
        <label htmlFor="pdf">PDF de la licitación (opcional, máx. 2MB)</label>
        <input 
          type="file"
          id="pdf"
          name="pdf"
          accept="application/pdf"
          ref={pdfInputRef}
        />
        <small style={{color: '#666', fontSize: '0.9em'}}>
          Solo archivos PDF. Tamaño máximo: 2MB
        </small>
      </div>

      <div className="form-actions">
        <Link to="/" className="btn btn-secondary">Cancelar</Link>
        <button type="submit" className="btn btn-primary" data-testid="create-btn">
          Crear Licitación
        </button>
      </div>
    </form>
  );
}