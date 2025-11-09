const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'

export async function fetchJSON(path: string, options: any = {}) {
  // Obtener token de localStorage
  const token = localStorage.getItem('token');
  
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    ...options
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
