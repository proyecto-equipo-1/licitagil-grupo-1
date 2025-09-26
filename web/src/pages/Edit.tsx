import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchJSON } from '../services/api'

export default function EditPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    fetchJSON(`/api/licitaciones/${id}`).then(lic => {
      setForm({
        titulo: lic.titulo,
        descripcion: lic.descripcion,
        estado: lic.estado,
        fecha_cierre: new Date(lic.fechaCierre).toISOString().slice(0,16)
      })
    })
  }, [id])

  if (!form) return <p>Cargando...</p>

  async function submit(e) {
    e.preventDefault()
    await fetchJSON(`/api/licitaciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(form)
    })
    nav(`/licitaciones/${id}`)
  }

  return (
    <form onSubmit={submit}>
      <h2>Editar licitación</h2>
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
      <button type="submit">Guardar</button>
    </form>
  )
}
