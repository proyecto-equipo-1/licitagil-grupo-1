import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

interface Departamento {
  id: number;
  nombre: string;
  codigo: string;
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rol, setRol] = useState<string>('Postulante');
  const [departamentoId, setDepartamentoId] = useState<string>('');
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Cargar departamentos si el rol requiere departamento
  useEffect(() => {
    if (rol === 'Funcionario' || rol === 'Supervisor') {
      fetchDepartamentos();
    }
  }, [rol]);

  const fetchDepartamentos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/departamentos`);
      if (response.ok) {
        const data = await response.json();
        setDepartamentos(data);
      }
    } catch (err) {
      console.error('Error al cargar departamentos:', err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validar departamento si es requerido
    if ((rol === 'Funcionario' || rol === 'Supervisor') && !departamentoId) {
      setError('Debes seleccionar un departamento para este rol');
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = { 
        email, 
        password,
        name: name.trim(),
        rol
      };

      // Agregar departamentoId solo si aplica
      if (rol === 'Funcionario' || rol === 'Supervisor') {
        payload.departamentoId = Number(departamentoId);
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      // Login automático después del registro
      login(data.token, data.user);
      
      // Redirigir al dashboard
      navigate('/');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>LicitAgil</h1>
        <h2>Crear Cuenta</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nombre completo *</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Ej: Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico *</label>
            <input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña *</label>
            <input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña *</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="rol">Rol *</label>
            <select
              id="rol"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              disabled={isLoading}
            >
              <option value="Postulante">Postulante</option>
              <option value="Funcionario">Funcionario</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Adquisiciones">Adquisiciones</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

          {(rol === 'Funcionario' || rol === 'Supervisor') && (
            <div className="form-group">
              <label htmlFor="departamento">Departamento *</label>
              <select
                id="departamento"
                value={departamentoId}
                onChange={(e) => setDepartamentoId(e.target.value)}
                required
                disabled={isLoading}
              >
                <option value="">Selecciona un departamento</option>
                {departamentos.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.nombre} ({dept.codigo})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}
