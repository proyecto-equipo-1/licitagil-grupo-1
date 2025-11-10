import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/departamentos.css';

interface Departamento {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  _count?: {
    usuarios: number;
    licitaciones: number;
  };
}

interface FormData {
  nombre: string;
  codigo: string;
  descripcion: string;
}

export default function Departamentos() {
  const { user } = useAuth();
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado del formulario
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    codigo: '',
    descripcion: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // Verificar que el usuario sea Administrador
  if (user?.rol !== 'Administrador') {
    return (
      <div className="departamentos-container">
        <div className="error-message">
          No tienes permisos para acceder a esta página.
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchDepartamentos();
  }, []);

  const fetchDepartamentos = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/departamentos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar departamentos');
      }

      const data = await response.json();
      setDepartamentos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `http://localhost:3000/api/departamentos/${editingId}`
        : 'http://localhost:3000/api/departamentos';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar departamento');
      }

      setSuccess(editingId ? 'Departamento actualizado exitosamente' : 'Departamento creado exitosamente');
      setShowForm(false);
      setEditingId(null);
      setFormData({ nombre: '', codigo: '', descripcion: '' });
      fetchDepartamentos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (dept: Departamento) => {
    setEditingId(dept.id);
    setFormData({
      nombre: dept.nombre,
      codigo: dept.codigo,
      descripcion: dept.descripcion || ''
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: number, nombre: string) => {
    const dept = departamentos.find(d => d.id === id);
    
    // Validar si tiene usuarios o licitaciones
    if (dept?._count) {
      if (dept._count.usuarios > 0) {
        setError(`No se puede eliminar "${nombre}" porque tiene ${dept._count.usuarios} usuario(s) asignado(s)`);
        return;
      }
      if (dept._count.licitaciones > 0) {
        setError(`No se puede eliminar "${nombre}" porque tiene ${dept._count.licitaciones} licitación(es) asociada(s)`);
        return;
      }
    }

    if (!confirm(`¿Estás seguro de eliminar el departamento "${nombre}"?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/departamentos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar departamento');
      }

      setSuccess(`Departamento "${nombre}" eliminado exitosamente`);
      fetchDepartamentos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nombre: '', codigo: '', descripcion: '' });
    setError('');
  };

  const handleNewDepartamento = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({ nombre: '', codigo: '', descripcion: '' });
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="departamentos-container">
        <div className="loading">Cargando departamentos...</div>
      </div>
    );
  }

  return (
    <div className="departamentos-container">
      <div className="departamentos-header">
        <h1>Gestión de Departamentos</h1>
        {!showForm && (
          <button 
            className="btn btn-primary"
            onClick={handleNewDepartamento}
          >
            + Nuevo Departamento
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {showForm && (
        <div className="departamento-form-card">
          <h2>{editingId ? 'Editar Departamento' : 'Nuevo Departamento'}</h2>
          
          <form onSubmit={handleSubmit} className="departamento-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                disabled={formLoading}
                placeholder="Ej: Tecnología de la Información"
              />
            </div>

            <div className="form-group">
              <label htmlFor="codigo">Código *</label>
              <input
                id="codigo"
                name="codigo"
                type="text"
                value={formData.codigo}
                onChange={handleInputChange}
                required
                disabled={formLoading}
                placeholder="Ej: TI"
                maxLength={10}
              />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                disabled={formLoading}
                placeholder="Descripción del departamento (opcional)"
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCancelForm}
                disabled={formLoading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={formLoading}
              >
                {formLoading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="departamentos-table-container">
        <table className="departamentos-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Usuarios</th>
              <th>Licitaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {departamentos.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">
                  No hay departamentos registrados
                </td>
              </tr>
            ) : (
              departamentos.map((dept) => (
                <tr key={dept.id}>
                  <td className="codigo-cell">{dept.codigo}</td>
                  <td className="nombre-cell">{dept.nombre}</td>
                  <td className="descripcion-cell">{dept.descripcion || '-'}</td>
                  <td className="count-cell">{dept._count?.usuarios || 0}</td>
                  <td className="count-cell">{dept._count?.licitaciones || 0}</td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => handleEdit(dept)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDelete(dept.id, dept.nombre)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
