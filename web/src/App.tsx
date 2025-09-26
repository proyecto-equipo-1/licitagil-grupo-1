import { Link, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>LicitAgil</h1>
        <nav style={{ display: 'flex', gap: 8 }}>
          <Link to="/">Listado</Link>
          <Link to="/licitaciones/nueva">Nueva</Link>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
