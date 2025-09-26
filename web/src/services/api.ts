const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function fetchJSON(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
