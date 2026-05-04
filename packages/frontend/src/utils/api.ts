const API_BASE = (import.meta.env.VITE_API_URL ?? '') + '/api'

interface ApiOptions {
  method?: string
  body?: unknown
  token?: string
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data: Record<string, unknown> = {}
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      if (!res.ok) throw new Error('Something went wrong')
    }
  }

  if (!res.ok) {
    throw new Error((data as { error?: string }).error || 'Something went wrong')
  }

  return data as T
}
