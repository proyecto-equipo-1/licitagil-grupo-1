import { useState } from 'react';
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const lic = await fetchJSON('/api/licitaciones', {
      method: 'POST',
      body: JSON.stringify(form)
    });
    // Navegamos a la página de detalle de la nueva licitación creada
    nav(`/licitaciones/${lic.id}`);
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

      <div className="form-actions">
        <Link to="/" className="btn btn-secondary">Cancelar</Link>
        <button type="submit" className="btn btn-primary" data-testid="create-btn">
          Crear Licitación
        </button>
      </div>
    </form>
  );
}