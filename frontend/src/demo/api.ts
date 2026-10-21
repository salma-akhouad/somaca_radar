import snapshot from './snapshot.json'

const data = snapshot as Record<string, any>
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const page = (items: any[], params: URLSearchParams) => {
  const number = Math.max(1, Number(params.get('page') || 1))
  const size = Math.max(1, Number(params.get('page_size') || 20))
  return {items: items.slice((number - 1) * size, number * size), total: items.length, page: number, page_size: size, total_pages: Math.max(1, Math.ceil(items.length / size))}
}
export async function demoRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = new URL(path, 'https://demo.invalid')
  const route = url.pathname
  const params = url.searchParams
  const method = (init.method || 'GET').toUpperCase()
  if (method === 'POST' && route === '/login') return {authenticated: true} as T
  if (method === 'POST' && route === '/logout') return undefined as T
  if (method !== 'GET') {
    if (route === '/notifications/read') return {read_at: new Date().toISOString()} as T
    throw new Error('Mode démonstration : les modifications sont désactivées.')
  }
  if (route === '/admin/machines') {
    let items = [...data['/machines?include_inactive=true']]
    const search = (params.get('search') || '').toLowerCase()
    if (search) items = items.filter((m: any) => (m.nom_machine + ' ' + m.type_machine + ' ' + m.ip_address).toLowerCase().includes(search))
    if (params.has('active')) items = items.filter((m: any) => String(m.actif) === params.get('active'))
    if (params.has('type_machine')) items = items.filter((m: any) => m.type_machine === params.get('type_machine'))
    if (params.has('id_poteau')) items = items.filter((m: any) => String(m.id_poteau) === params.get('id_poteau'))
    return clone(page(items, params)) as T
  }
  if (route === '/admin/utilisateurs') {
    let items = [...data['/utilisateurs']]
    const search = (params.get('search') || '').toLowerCase()
    if (search) items = items.filter((u: any) => (u.nom + ' ' + u.prenom + ' ' + u.email).toLowerCase().includes(search))
    if (params.has('active')) items = items.filter((u: any) => String(u.actif) === params.get('active'))
    return clone(page(items, params)) as T
  }
  if (route === '/sessions') {
    let items = [...data['/sessions']]
    const search = (params.get('search') || '').toLowerCase()
    if (search) items = items.filter((s: any) => (s.user_nom + ' ' + s.user_prenom + ' ' + s.user_email).toLowerCase().includes(search))
    if (params.has('status')) items = items.filter((s: any) => s.status === params.get('status'))
    const size = Math.max(1, Number(params.get('page_size') || 20))
    const start = Math.max(0, Number(params.get('cursor') || 0))
    return clone({items: items.slice(start, start + size), next_cursor: start + size < items.length ? String(start + size) : null, page_size: size}) as T
  }
  if (route === '/incidents') {
    let items = [...data['/incidents?page=1&page_size=100'].items]
    const search = (params.get('search') || '').toLowerCase()
    if (search) items = items.filter((i: any) => (i.problem + ' ' + i.id_incident).toLowerCase().includes(search))
    for (const key of ['severity','status']) if (params.has(key)) items = items.filter((i: any) => i[key] === params.get(key))
    return clone(page(items, params)) as T
  }
  if (route.match(/^\/incidents\/\d+\/(history|severity-history|contacts)$/)) return [] as T
  if (route === '/helper/conversations') return {items: [], next_cursor: null} as T
  if (route.startsWith('/helper/')) throw new Error('Assistant indisponible dans la démonstration.')
  const key = params.get('include_inactive') === 'true' ? route + '?include_inactive=true' : route
  if (Object.prototype.hasOwnProperty.call(data, key)) return clone(data[key]) as T
  throw new Error('Fonction non disponible dans cette démonstration : ' + route)
}
