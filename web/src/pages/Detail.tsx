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

  useEffect(() => {
    fetchJSON(`/api/licitaciones/${id}`).then(setLic);
  }, [id]);

  if (!lic) return <p>Cargando...</p>;

  return (
    <div className="detalle-container">
      <h2 className="detalle-titulo">{lic.titulo}</h2>
      
      <div className="detalle-info">
        <p><strong>Estado:</strong> <span className={`estado-badge estado-${lic.estado.toLowerCase()}`}>{lic.estado.replace('_', ' ')}</span></p>
        <p><strong>Fecha de cierre:</strong> {formatearFechaCompleta(lic.fechaCierre)}</p>
      </div>
      
      <p className="detalle-descripcion">{lic.descripcion}</p>
      
      <div className="detalle-acciones">
        <Link to="/" className="btn btn-secondary">Volver al Listado</Link>
        <Link to={`/licitaciones/${lic.id}/editar`} className="btn btn-primary">Editar</Link>
      </div>
    </div>
  );
}