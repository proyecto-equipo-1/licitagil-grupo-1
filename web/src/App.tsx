import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './styles/app.css'; 

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="logo">LicitAgil</h1>
        <nav className="app-nav">
          <NavLink to="/">Listado</NavLink>
          <NavLink to="/licitaciones/nueva">Nueva Licitación</NavLink>
          {user?.rol === 'Administrador' && (
            <NavLink to="/departamentos">Departamentos</NavLink>
          )}
        </nav>
        
        <div className="user-menu">
          {user && (
            <span className="user-name">
              👤 {user.name || user.email}
              {user.rol && (
                <span className="user-role"> ({user.rol}
                  {user.departamento && ` - ${user.departamento.nombre}`})
                </span>
              )}
            </span>
          )}
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </header>
      
      <main>
        <Outlet />
      </main>
    </div>
  );
}