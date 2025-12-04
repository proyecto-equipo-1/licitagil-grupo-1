import { useEffect, useState } from 'react';
import { fetchJSON } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/estadisticas.css';

// Tipos
type EstadoConteo = {
  Borrador: number;
  PendienteAprobacion: number;
  Aprobada: number;
  Abierta: number;
  En_revision: number;
  Cerrada: number;
  Rechazada: number;
};

type DepartamentoStats = {
  departamentoId: number | null;
  nombre: string;
  codigo: string;
  cantidad: number;
};

type TendenciaMes = {
  mes: string;
  mesLabel: string;
  cantidad: number;
};

type Estadisticas = {
  total: number;
  porEstado: EstadoConteo;
  porDepartamento: DepartamentoStats[];
  tendenciaTemporal: TendenciaMes[];
  tiempoPromedioAprobacion: number;
  esFiltradoPorDepartamento: boolean;
  departamentoId: number | null;
};

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

// Colores para los estados
const COLORES_ESTADO: Record<string, string> = {
  Borrador: '#6c757d',
  PendienteAprobacion: '#ffc107',
  Aprobada: '#28a745',
  Abierta: '#007bff',
  En_revision: '#17a2b8',
  Cerrada: '#343a40',
  Rechazada: '#dc3545'
};

const LABELS_ESTADO: Record<string, string> = {
  Borrador: 'Borrador',
  PendienteAprobacion: 'Pendiente Aprob.',
  Aprobada: 'Aprobada',
  Abierta: 'Abierta',
  En_revision: 'En Revisión',
  Cerrada: 'Cerrada',
  Rechazada: 'Rechazada'
};

export default function Estadisticas() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJSON('/api/estadisticas');
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = async () => {
    setExportando(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/estadisticas/exportar`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al exportar');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `licitaciones_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Error al exportar CSV');
    } finally {
      setExportando(false);
    }
  };

  // Calcular máximos para los gráficos
  const maxDepartamento = stats ? Math.max(...stats.porDepartamento.map(d => d.cantidad), 1) : 1;
  const maxMes = stats ? Math.max(...stats.tendenciaTemporal.map(t => t.cantidad), 1) : 1;

  if (loading) {
    return (
      <div className="estadisticas-container">
        <div className="estadisticas-loading">📊 Cargando estadísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="estadisticas-container">
        <div className="estadisticas-error"> {error}</div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="estadisticas-container">
      <div className="estadisticas-header">
        <div>
          <h2> Panel de Estadísticas</h2>
          {stats.esFiltradoPorDepartamento && (
            <p className="estadisticas-filtro-info">
               Mostrando datos de tu departamento
            </p>
          )}
        </div>
        <button 
          className="btn-exportar"
          onClick={exportarCSV}
          disabled={exportando}
        >
          {exportando ? ' Exportando...' : ' Exportar CSV'}
        </button>
      </div>

      {/* Resumen general */}
      <div className="estadisticas-resumen">
        <div className="resumen-card resumen-total">
          <span className="resumen-numero">{stats.total}</span>
          <span className="resumen-label">Total Licitaciones</span>
        </div>
        <div className="resumen-card resumen-aprobacion">
          <span className="resumen-numero">{stats.tiempoPromedioAprobacion}</span>
          <span className="resumen-label">Días promedio aprobación</span>
        </div>
        <div className="resumen-card resumen-activas">
          <span className="resumen-numero">
            {stats.porEstado.Abierta + stats.porEstado.En_revision}
          </span>
          <span className="resumen-label">Activas</span>
        </div>
        <div className="resumen-card resumen-pendientes">
          <span className="resumen-numero">{stats.porEstado.PendienteAprobacion}</span>
          <span className="resumen-label">Pendientes Aprobación</span>
        </div>
      </div>

      {/* Gráfico de estados */}
      <div className="estadisticas-seccion">
        <h3> Licitaciones por Estado</h3>
        <div className="grafico-estados">
          {Object.entries(stats.porEstado).map(([estado, cantidad]) => (
            <div key={estado} className="estado-barra-container">
              <div className="estado-info">
                <span 
                  className="estado-badge"
                  style={{ backgroundColor: COLORES_ESTADO[estado] }}
                >
                  {LABELS_ESTADO[estado]}
                </span>
                <span className="estado-cantidad">{cantidad}</span>
              </div>
              <div className="estado-barra-bg">
                <div 
                  className="estado-barra"
                  style={{ 
                    width: `${(cantidad / stats.total) * 100}%`,
                    backgroundColor: COLORES_ESTADO[estado]
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico por departamento */}
      {!stats.esFiltradoPorDepartamento && stats.porDepartamento.length > 0 && (
        <div className="estadisticas-seccion">
          <h3> Licitaciones por Departamento</h3>
          <div className="grafico-barras">
            {stats.porDepartamento.map((dept) => (
              <div key={dept.departamentoId || 'sin-dept'} className="barra-horizontal">
                <div className="barra-label">
                  <span className="barra-nombre">{dept.nombre}</span>
                  <span className="barra-codigo">{dept.codigo}</span>
                </div>
                <div className="barra-contenedor">
                  <div 
                    className="barra-fill"
                    style={{ width: `${(dept.cantidad / maxDepartamento) * 100}%` }}
                  />
                  <span className="barra-valor">{dept.cantidad}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráfico de tendencia temporal */}
      <div className="estadisticas-seccion">
        <h3> Tendencia (Últimos 6 meses)</h3>
        <div className="grafico-lineas">
          <div className="lineas-container">
            {stats.tendenciaTemporal.map((mes, index) => (
              <div key={mes.mes} className="linea-punto-container">
                <div 
                  className="linea-barra"
                  style={{ height: `${(mes.cantidad / maxMes) * 100}%` }}
                >
                  <span className="linea-valor">{mes.cantidad}</span>
                </div>
                <span className="linea-label">{mes.mesLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla resumen de estados */}
      <div className="estadisticas-seccion">
        <h3> Resumen Detallado</h3>
        <table className="tabla-resumen">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Cantidad</th>
              <th>Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.porEstado).map(([estado, cantidad]) => (
              <tr key={estado}>
                <td>
                  <span 
                    className="estado-badge-sm"
                    style={{ backgroundColor: COLORES_ESTADO[estado] }}
                  >
                    {LABELS_ESTADO[estado]}
                  </span>
                </td>
                <td>{cantidad}</td>
                <td>{stats.total > 0 ? ((cantidad / stats.total) * 100).toFixed(1) : 0}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>{stats.total}</strong></td>
              <td><strong>100%</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
