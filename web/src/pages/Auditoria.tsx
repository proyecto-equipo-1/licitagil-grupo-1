import { useEffect, useState } from 'react';
import { fetchJSON } from '../services/api';
import '../styles/auditoria.css';

type Usuario = {
  id: number;
  name: string | null;
  email: string;
  rol: string;
};

type AuditLog = {
  id: number;
  usuarioId: number;
  usuario: Usuario;
  accion: string;
  entidad: string;
  entidadId: number | null;
  detallesAntes: Record<string, any> | null;
  detallesDespues: Record<string, any> | null;
  createdAt: string;
};

type Accion = {
  value: string;
  label: string;
};

const formatearFecha = (fechaString: string) => {
  const fecha = new Date(fechaString);
  return fecha.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getAccionBadgeClass = (accion: string) => {
  const clases: Record<string, string> = {
    'CREAR': 'badge-crear',
    'EDITAR': 'badge-editar',
    'ELIMINAR': 'badge-eliminar',
    'CAMBIO_ESTADO': 'badge-estado',
    'LOGIN': 'badge-login',
    'LOGOUT': 'badge-logout'
  };
  return `badge ${clases[accion] || 'badge-default'}`;
};

const formatearAccion = (accion: string) => {
  const acciones: Record<string, string> = {
    'CREAR': 'Crear',
    'EDITAR': 'Editar',
    'ELIMINAR': 'Eliminar',
    'CAMBIO_ESTADO': 'Cambio Estado',
    'LOGIN': 'Login',
    'LOGOUT': 'Logout'
  };
  return acciones[accion] || accion;
};

export default function Auditoria() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [entidades, setEntidades] = useState<string[]>([]);
  
  const [filtroUsuario, setFiltroUsuario] = useState<string>('');
  const [filtroAccion, setFiltroAccion] = useState<string>('');
  const [filtroEntidad, setFiltroEntidad] = useState<string>('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState<string>('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState<string>('');
  
  // Modal de detalles
  const [logSeleccionado, setLogSeleccionado] = useState<AuditLog | null>(null);
  
  const pageSize = 15;

  const cargarFiltros = async () => {
    try {
      const [usuariosData, accionesData, entidadesData] = await Promise.all([
        fetchJSON('/api/auditoria/usuarios'),
        fetchJSON('/api/auditoria/acciones'),
        fetchJSON('/api/auditoria/entidades')
      ]);
      setUsuarios(usuariosData);
      setAcciones(accionesData);
      setEntidades(entidadesData);
    } catch (err) {
      console.error('Error al cargar filtros:', err);
    }
  };

  const cargarLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let queryParams = `?page=${pagina}&pageSize=${pageSize}`;
      
      if (filtroUsuario) queryParams += `&usuarioId=${filtroUsuario}`;
      if (filtroAccion) queryParams += `&accion=${filtroAccion}`;
      if (filtroEntidad) queryParams += `&entidad=${filtroEntidad}`;
      if (filtroFechaDesde) queryParams += `&fechaDesde=${filtroFechaDesde}`;
      if (filtroFechaHasta) queryParams += `&fechaHasta=${filtroFechaHasta}`;
      
      const data = await fetchJSON(`/api/auditoria${queryParams}`);
      setLogs(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Error al cargar registros de auditoría');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFiltros();
  }, []);

  useEffect(() => {
    cargarLogs();
  }, [pagina, filtroUsuario, filtroAccion, filtroEntidad, filtroFechaDesde, filtroFechaHasta]);

  useEffect(() => {
    setPagina(1);
  }, [filtroUsuario, filtroAccion, filtroEntidad, filtroFechaDesde, filtroFechaHasta]);

  const limpiarFiltros = () => {
    setFiltroUsuario('');
    setFiltroAccion('');
    setFiltroEntidad('');
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
  };

  const totalPaginas = Math.ceil(total / pageSize);

  const renderDetalles = (log: AuditLog) => {
    const detalles: string[] = [];
    
    if (log.accion === 'CAMBIO_ESTADO') {
      const antes = log.detallesAntes?.estado || '?';
      const despues = log.detallesDespues?.estado || '?';
      detalles.push(`${antes} → ${despues}`);
      if (log.detallesAntes?.motivo) {
        detalles.push(`Motivo: ${log.detallesAntes.motivo}`);
      }
    } else if (log.accion === 'CREAR') {
      if (log.detallesDespues?.titulo) {
        detalles.push(`"${log.detallesDespues.titulo}"`);
      }
    } else if (log.accion === 'ELIMINAR') {
      if (log.detallesAntes?.titulo) {
        detalles.push(`"${log.detallesAntes.titulo}"`);
      }
    }
    
    return detalles.length > 0 ? detalles.join(' | ') : '-';
  };

  return (
    <div className="auditoria-container">
      <div className="auditoria-header">
        <h2>Registro de Auditoría</h2>
        <p className="auditoria-subtitle">Historial de acciones realizadas en el sistema</p>
      </div>

      {/* Filtros */}
      <div className="auditoria-filtros">
        <div className="filtro-grupo">
          <label>Usuario</label>
          <select value={filtroUsuario} onChange={(e) => setFiltroUsuario(e.target.value)}>
            <option value="">Todos</option>
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>
                {u.name || u.email} ({u.rol})
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Acción</label>
          <select value={filtroAccion} onChange={(e) => setFiltroAccion(e.target.value)}>
            <option value="">Todas</option>
            {acciones.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Entidad</label>
          <select value={filtroEntidad} onChange={(e) => setFiltroEntidad(e.target.value)}>
            <option value="">Todas</option>
            {entidades.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Desde</label>
          <input 
            type="date" 
            value={filtroFechaDesde} 
            onChange={(e) => setFiltroFechaDesde(e.target.value)}
          />
        </div>

        <div className="filtro-grupo">
          <label>Hasta</label>
          <input 
            type="date" 
            value={filtroFechaHasta} 
            onChange={(e) => setFiltroFechaHasta(e.target.value)}
          />
        </div>

        <button className="btn-limpiar" onClick={limpiarFiltros}>
          Limpiar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="auditoria-error">
           {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="auditoria-loading">
           Cargando registros...
        </div>
      )}

      {/* Tabla */}
      {!loading && !error && (
        <>
          <div className="auditoria-stats">
            Mostrando {logs.length} de {total} registros
          </div>

          <table className="auditoria-tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Entidad</th>
                <th>ID</th>
                <th>Detalles</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="auditoria-empty">
                    No hay registros de auditoría
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td className="fecha-cell">{formatearFecha(log.createdAt)}</td>
                    <td>
                      <span className="usuario-nombre">{log.usuario.name || log.usuario.email}</span>
                      <span className="usuario-rol">{log.usuario.rol}</span>
                    </td>
                    <td>
                      <span className={getAccionBadgeClass(log.accion)}>
                        {formatearAccion(log.accion)}
                      </span>
                    </td>
                    <td>{log.entidad}</td>
                    <td>{log.entidadId || '-'}</td>
                    <td className="detalles-cell">{renderDetalles(log)}</td>
                    <td>
                      <button 
                        className="btn-ver-detalle"
                        onClick={() => setLogSeleccionado(log)}
                        title="Ver detalles completos"
                      >
                        🔍
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="auditoria-paginacion">
              <button 
                disabled={pagina === 1} 
                onClick={() => setPagina(p => p - 1)}
              >
                ← Anterior
              </button>
              <span>Página {pagina} de {totalPaginas}</span>
              <button 
                disabled={pagina === totalPaginas} 
                onClick={() => setPagina(p => p + 1)}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de detalles */}
      {logSeleccionado && (
        <div className="modal-overlay" onClick={() => setLogSeleccionado(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles del Registro</h3>
              <button className="modal-close" onClick={() => setLogSeleccionado(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detalle-row">
                <strong>ID:</strong> {logSeleccionado.id}
              </div>
              <div className="detalle-row">
                <strong>Fecha:</strong> {formatearFecha(logSeleccionado.createdAt)}
              </div>
              <div className="detalle-row">
                <strong>Usuario:</strong> {logSeleccionado.usuario.name || logSeleccionado.usuario.email} ({logSeleccionado.usuario.rol})
              </div>
              <div className="detalle-row">
                <strong>Acción:</strong> 
                <span className={getAccionBadgeClass(logSeleccionado.accion)}>
                  {formatearAccion(logSeleccionado.accion)}
                </span>
              </div>
              <div className="detalle-row">
                <strong>Entidad:</strong> {logSeleccionado.entidad} #{logSeleccionado.entidadId}
              </div>
              
              {logSeleccionado.detallesAntes && (
                <div className="detalle-section">
                  <strong>Estado Anterior:</strong>
                  <pre>{JSON.stringify(logSeleccionado.detallesAntes, null, 2)}</pre>
                </div>
              )}
              
              {logSeleccionado.detallesDespues && (
                <div className="detalle-section">
                  <strong>Estado Nuevo:</strong>
                  <pre>{JSON.stringify(logSeleccionado.detallesDespues, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
