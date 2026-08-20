/**
 * Media a stop can carry. Both fields are optional per stop, so the tour can
 * launch text-only and gain narration or a clip later without any rework.
 */

/**
 * Stops may give either a full URL or a path relative to the app. Relative
 * paths are resolved against the app's base, which is a subpath on GitHub
 * Pages -- "media/x.wav" alone would 404 from a nested route.
 */
export function resolveMediaUrl(url: string, baseUrl: string): string {
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) return url

  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return `${base}${url.replace(/^\/+/, '')}`
}

const YOUTUBE_ID = /^[\w-]{6,20}$/

/**
 * The embeddable form of a YouTube link, or null when we can't recognise it.
 * Returning null rather than guessing keeps a mistyped link from rendering a
 * broken player on a stop.
 */
export function youTubeEmbedUrl(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  const host = parsed.hostname.replace(/^www\./, '')

  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1)
    return YOUTUBE_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null
  }

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    if (parsed.pathname === '/watch') {
      const id = parsed.searchParams.get('v') ?? ''
      return YOUTUBE_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }

    const embedded = parsed.pathname.match(/^\/embed\/([\w-]+)/)
    if (embedded && YOUTUBE_ID.test(embedded[1])) {
      return `https://www.youtube-nocookie.com/embed/${embedded[1]}`
    }
  }

  return null
}
