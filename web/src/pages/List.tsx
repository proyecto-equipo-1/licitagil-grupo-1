import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchJSON } from '../services/api'

export default function List() {
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')

  async function load() {
    const q = search ? `?search=${encodeURIComponent(search)}` : ''
    const data = await fetchJSON(`/api/licitaciones${q}`)
    setItems(data.items); setTotal(data.total)
  }
  useEffect(() => { load() }, [])

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Buscar por título" value={search} onChange={e=>setSearch(e.target.value)} />
        <button onClick={load} data-testid="search-btn">Buscar</button>
      </div>
      {items.length === 0 ? <p>No hay licitaciones</p> : (
        <table width="100%">
          <thead><tr><th>Título</th><th>Estado</th><th>Cierre</th></tr></thead>
          <tbody>
            {items.map(it => (
              <tr key={it.id} data-testid={`lic-row-${it.id}`}>
                <td><Link to={`/licitaciones/${it.id}`}>{it.titulo}</Link></td>
                <td>{it.estado}</td>
                <td>{new Date(it.fechaCierre).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p>Total: {total}</p>
    </div>
  )
}
