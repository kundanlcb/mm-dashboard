export const API_BASE_URL = 'http://localhost:8080/api/v1/admin';

export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  post: async <T>(endpoint: string, data: any): Promise<T> => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  delete: async (endpoint: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
  }
};
