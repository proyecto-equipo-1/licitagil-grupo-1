import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import List from './pages/List'
import Detail from './pages/Detail'
import NewPage from './pages/New'
import EditPage from './pages/Edit'

// Componente para manejar errores 404
function ErrorPage() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🚫 Página no encontrada</h1>
      <p>La página que buscas no existe.</p>
      <a href="/" style={{
        color: '#007bff',
        textDecoration: 'none',
        fontWeight: 'bold'
      }}>← Volver al inicio</a>
    </div>
  )
}

const router = createBrowserRouter([
  { 
    path: '/', 
    element: <App />, 
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <List /> },
      { path: 'licitaciones/nueva', element: <NewPage /> },
      { path: 'licitaciones/:id', element: <Detail /> },
      { path: 'licitaciones/:id/editar', element: <EditPage /> },
    ]
  }
])
ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />)
