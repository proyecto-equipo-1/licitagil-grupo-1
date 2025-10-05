import { useEffect, useState } from 'react';
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
    await fetchJSON(`/api/licitaciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(form)
    });
    nav(`/`);
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

      <div className="form-actions">
        <Link to="/" className="btn btn-secondary">Cancelar</Link>
        <button type="submit" className="btn btn-primary">Guardar Cambios</button>
      </div>
    </form>
  );
}