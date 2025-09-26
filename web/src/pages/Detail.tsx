import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchJSON } from '../services/api'

export default function Detail() {
  const { id } = useParams()
  const [lic, setLic] = useState<any>(null)

  useEffect(() => {
    fetchJSON(`/api/licitaciones/${id}`).then(setLic)
  }, [id])

  if (!lic) return <p>Cargando...</p>

  return (
    <div>
      <h2>{lic.titulo}</h2>
      <p><strong>Estado:</strong> {lic.estado}</p>
      <p><strong>Fecha cierre:</strong> {new Date(lic.fechaCierre).toLocaleString()}</p>
      <p>{lic.descripcion}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Link to={`/licitaciones/${lic.id}/editar`}>Editar</Link>
        <Link to="/">Volver</Link>
      </div>
    </div>
  )
}
