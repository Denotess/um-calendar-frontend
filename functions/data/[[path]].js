function normalizeOrigin(origin) {
  return (origin || '').replace(/\/$/, '')
}

function resolvePath(pathParam) {
  if (!pathParam) return ''
  if (Array.isArray(pathParam)) return pathParam.join('/')
  return String(pathParam)
}

export async function onRequest(context) {
  const apiOrigin = normalizeOrigin(context.env.API_ORIGIN)

  if (!apiOrigin) {
    return new Response('Missing API_ORIGIN environment variable', { status: 500 })
  }

  const incomingUrl = new URL(context.request.url)
  const suffix = resolvePath(context.params.path)
  const targetUrl = `${apiOrigin}/data${suffix ? `/${suffix}` : ''}${incomingUrl.search}`

  return fetch(new Request(targetUrl, context.request))
}