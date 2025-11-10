const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export async function fetchJSON(path: string, options: RequestInit = {}) {
 
  const token = localStorage.getItem('token');
  
  
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }
  
 
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }


  const res = await fetch(`${API}${path}`, {
    ...options, 
    headers,    
  });

  
  if (!res.ok) {
   
    try {
      const errorData = await res.json();
      throw new Error(errorData.error || res.statusText);
    } catch {
     
      throw new Error(res.statusText);
    }
  }


  if (res.status === 204) {
    return null;
  }
  
  return res.json();
}