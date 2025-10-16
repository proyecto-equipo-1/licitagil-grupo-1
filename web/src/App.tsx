import { NavLink, Outlet } from 'react-router-dom';
import './styles/app.css'; 

export default function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="logo">LicitAgil</h1>
        <nav className="app-nav">
         
          <NavLink to="/">Listado</NavLink>
          <NavLink to="/licitaciones/nueva">Nueva Licitación</NavLink>
        </nav>
      </header>
      
      <main>
       
        <Outlet />
      </main>
    </div>
  );
}