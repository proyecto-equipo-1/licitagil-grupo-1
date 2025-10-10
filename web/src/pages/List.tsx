import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJSON } from '../services/api';
import '../styles/EventList.css';

type Licitacion = {
  id: number;
  titulo: string;
  fechaCierre: string;
  estado: string;
  descripcion: string;
};

const formatearFechaCierre = (fechaString: string) => {
  const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(fechaString).toLocaleDateString('es-ES', opciones);
};

const formatearEstado = (estado: string) => {
  const estadosFormateados: { [key: string]: string } = {
    'Abierta': 'Abierta',
    'En_revision': 'En revisión',
    'Cerrada': 'Cerrada'
  };
  return estadosFormateados[estado] || estado;
};

export default function ListaLicitaciones() {
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [pestañaActiva, setPestañaActiva] = useState('Todas');
  const pageSize = 10;

  const cargarLicitaciones = async () => {
    const q = `?page=${pagina}&pageSize=${pageSize}&state=${pestañaActiva}`;
    const data = await fetchJSON(`/api/licitaciones${q}`);
    setLicitaciones(data.items);
    setTotal(data.total);
  };

  const eliminarLicitacion = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar esta licitación?')) return;
    await fetchJSON(`/api/licitaciones/${id}`, { method: 'DELETE' });
    cargarLicitaciones();
  };

  useEffect(() => {
    cargarLicitaciones();
  }, [pagina, pestañaActiva]); // ← Array de dependencias

  const totalPaginas = Math.ceil(total / pageSize);

  return (
    <div className="licitaciones-container">
      <header className="licitaciones-header">
        <h1>Panel de Licitaciones</h1>
        <div className="filter-container">
          <label htmlFor="estado-filter">Filtrar por estado:</label>
          <select 
            id="estado-filter"
            value={pestañaActiva} 
            onChange={(e) => setPestañaActiva(e.target.value)}
            className="estado-select"
          >
            <option value="Todas">Todas</option>
            <option value="Abierta">Abierta</option>
            <option value="En_revision">En revisión</option>
            <option value="Cerrada">Cerrada</option>
          </select>
        </div>
      </header>

      {licitaciones.length === 0 ? (
        <p>No hay licitaciones disponibles.</p>
      ) : (
        <>
          <div className="licitaciones-grid">
            {licitaciones.map((licitacion) => (
              <div key={licitacion.id} className="licitacion-card">
                <div className="licitacion-info">
                  <p className="licitacion-estado">{formatearEstado(licitacion.estado)}</p>
                  <Link to={`/licitaciones/${licitacion.id}`} className="licitacion-titulo">
                    {licitacion.titulo}
                  </Link>
                  <p className="licitacion-fecha">
                    <strong>Fecha de cierre:</strong> {formatearFechaCierre(licitacion.fechaCierre)}
                  </p>
                </div>

                <hr className="divider" />

                <div className="card-footer">
                  <div className="institucion-info">
                    <span>🏛️</span>
                    <p>{licitacion.descripcion || "no especificada"}</p>
                  </div>
                  <div className="card-actions">
                    <button 
                      onClick={() => eliminarLicitacion(licitacion.id)} 
                      className="delete-btn" 
                      title="Eliminar Licitación">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}>
              ◀ Anterior
            </button>
            <span>Página {pagina} de {totalPaginas}</span>
            <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}>
              Siguiente ▶
            </button>
          </div>
        </>
      )}

      <Link to="/licitaciones/nueva" className="fab" title="Crear nueva licitación">
        +
      </Link>
    </div>
  );
}
