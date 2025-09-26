import { useNavigate } from 'react-router-dom'
import { fetchJSON } from '../services/api'
import { useState } from 'react'

export default function NewPage() {
  const nav = useNavigate()
  const [form, setForm] = useState({ titulo:'', descripcion:'', estado:'Abierta', fecha_cierre:'' })

  async function submit(e) {
    e.preventDefault()
    const lic = await fetchJSON('/api/licitaciones', {
      method: 'POST',
      body: JSON.stringify(form)
    })
    nav(`/licitaciones/${lic.id}`)
  }

  return (
    <form onSubmit={submit}>
      <h2>Nueva licitación</h2>
      <div><label>Título<br/>
        <input value={form.titulo} onChange={e=>setForm({...form, titulo:e.target.value})} required minLength={3} maxLength={120}/>
      </label></div>
      <div><label>Descripción<br/>
        <textarea value={form.descripcion} onChange={e=>setForm({...form, descripcion:e.target.value})} required minLength={10}/>
      </label></div>
      <div><label>Estado<br/>
        <select value={form.estado} onChange={e=>setForm({...form, estado:e.target.value})}>
          <option>Abierta</option>
          <option value="En_revision">En revisión</option>
          <option>Cerrada</option>
        </select>
      </label></div>
      <div><label>Fecha cierre<br/>
        <input type="datetime-local" value={form.fecha_cierre} onChange={e=>setForm({...form, fecha_cierre:e.target.value})} required/>
      </label></div>
      <button type="submit" data-testid="create-btn">Crear</button>
    </form>
  )
}
