import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJSON } from '../services/api';
import '../styles/EventList.css';
import '../styles/badges.css';

type Licitacion = {
  id: number;
  titulo: string;
  fechaCierre: string;
  estado: string;
  descripcion: string;
  pdfPath?: string | null;
  estadoValidacion?: 'Borrador' | 'Incompleta' | 'Completa';
};

const formatearFechaCierre = (fechaString: string) => {
  const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(fechaString).toLocaleDateString('es-ES', opciones);
};

const formatearEstado = (estado: string) => {
  const estadosFormateados: { [key: string]: string } = {
    'Borrador': 'Borrador',
    'PendienteAprobacion': 'Pendiente Aprobación',
    'Aprobada': 'Aprobada',
    'Abierta': 'Abierta',
    'En_revision': 'En revisión',
    'Cerrada': 'Cerrada',
    'Rechazada': 'Rechazada'
  };
  return estadosFormateados[estado] || estado;
};

const getEstadoBadgeClass = (estado: string) => {
  const claseEstado = estado.toLowerCase().replace('_', '');
  return `badge badge-${claseEstado}`;
};

export default function ListaLicitaciones() {
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [pestañaActiva, setPestañaActiva] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const pageSize = 10;

  const cargarLicitaciones = async () => {
    let queryParams = `?page=${pagina}&pageSize=${pageSize}`;
    
    if (pestañaActiva !== 'Todas') {
      queryParams += `&state=${pestañaActiva}`;
    }
    
    if (busqueda.trim()) {
      queryParams += `&search=${busqueda.trim()}`;
    }
    
    const data = await fetchJSON(`/api/licitaciones${queryParams}`);
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
  }, [pagina, pestañaActiva, busqueda]);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPagina(1);
  }, [pestañaActiva, busqueda]); // ← Array de dependencias

  const totalPaginas = Math.ceil(total / pageSize);

  return (
    <div className="licitaciones-container">
      <header className="licitaciones-header">
        <h1>Panel de Licitaciones</h1>
        <div className="filters-row">
          <div className="search-container">
            <label htmlFor="search-input">Buscar por título:</label>
            <input
              id="search-input"
              type="text"
              placeholder="Escriba para buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-container">
            <label htmlFor="estado-filter">Filtrar por estado:</label>
            <select 
              id="estado-filter"
              value={pestañaActiva} 
              onChange={(e) => setPestañaActiva(e.target.value)}
              className="estado-select"
            >
              <option value="Todas">Todas</option>
              <option value="Borrador">Borrador</option>
              <option value="PendienteAprobacion">Pendiente Aprobación</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Abierta">Abierta</option>
              <option value="En_revision">En revisión</option>
              <option value="Cerrada">Cerrada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>
        </div>
      </header>

      {licitaciones.length === 0 ? (
        <div className="no-results">
          <p>
            {busqueda.trim() 
              ? `No se encontraron licitaciones que contengan "${busqueda.trim()}"` 
              : "No hay licitaciones disponibles."
            }
          </p>
        </div>
      ) : (
        <>
          <div className="licitaciones-grid">
            {licitaciones.map((licitacion) => (
              <div key={licitacion.id} className="licitacion-card">
                <div className="licitacion-info">
                  <span className={getEstadoBadgeClass(licitacion.estado)}>
                    {formatearEstado(licitacion.estado)}
                  </span>
                  <Link to={`/licitaciones/${licitacion.id}`} className="licitacion-titulo">
                    {licitacion.titulo}
                  </Link>
                  <p className="licitacion-fecha">
                    <strong>Fecha de cierre:</strong> {formatearFechaCierre(licitacion.fechaCierre)}
                  </p>
                  
                  {/* Badge de validación */}
                  {licitacion.pdfPath && licitacion.estadoValidacion && (
                    <div style={{ marginTop: '8px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: 
                          licitacion.estadoValidacion === 'Completa' ? '#d4edda' : 
                          licitacion.estadoValidacion === 'Incompleta' ? '#fff3cd' : '#f8d7da',
                        color: 
                          licitacion.estadoValidacion === 'Completa' ? '#155724' : 
                          licitacion.estadoValidacion === 'Incompleta' ? '#856404' : '#721c24'
                      }}>
                        {licitacion.estadoValidacion === 'Completa' && '✅ Validada'}
                        {licitacion.estadoValidacion === 'Incompleta' && '⚠️ Incompleta'}
                        {licitacion.estadoValidacion === 'Borrador' && '📝 Borrador'}
                      </span>
                    </div>
                  )}
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
                      title="Eliminar Licitación"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button 
              onClick={() => setPagina(p => Math.max(1, p - 1))} 
              disabled={pagina === 1}
              className="btn btn-secondary"
            >
              ◀ Anterior
            </button>
            <span style={{ 
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Página {pagina} de {totalPaginas}
            </span>
            <button 
              onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} 
              disabled={pagina === totalPaginas}
              className="btn btn-secondary"
            >
              Siguiente ▶
            </button>
          </div>
        </>
      )}

      <Link 
        to="/licitaciones/nueva" 
        className="fab" 
        title="Crear nueva licitación"
      >
        +
      </Link>
    </div>
  );
}
