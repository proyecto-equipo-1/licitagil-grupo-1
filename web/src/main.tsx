import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import List from './pages/List'
import Detail from './pages/Detail'
import NewPage from './pages/New'
import EditPage from './pages/Edit'

const router = createBrowserRouter([
  { path: '/', element: <App />, children: [
      { index: true, element: <List /> },
      { path: 'licitaciones/nueva', element: <NewPage /> },
      { path: 'licitaciones/:id', element: <Detail /> },
      { path: 'licitaciones/:id/editar', element: <EditPage /> },
  ]}
])
ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />)
