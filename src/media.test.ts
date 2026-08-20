import { describe, expect, it } from 'vitest'
import { resolveMediaUrl, youTubeEmbedUrl } from './media'

describe('resolveMediaUrl', () => {
  it('puts app-relative paths under the base path', () => {
    expect(resolveMediaUrl('media/talk.wav', '/Winnemac-tour/')).toBe(
      '/Winnemac-tour/media/talk.wav',
    )
  })

  it('copes with a base path missing its trailing slash', () => {
    expect(resolveMediaUrl('media/talk.wav', '/Winnemac-tour')).toBe('/Winnemac-tour/media/talk.wav')
  })

  it('does not double the slash on a rooted path', () => {
    expect(resolveMediaUrl('/media/talk.wav', '/Winnemac-tour/')).toBe(
      '/Winnemac-tour/media/talk.wav',
    )
  })

  it('leaves absolute URLs alone', () => {
    expect(resolveMediaUrl('https://cdn.example.org/talk.mp3', '/Winnemac-tour/')).toBe(
      'https://cdn.example.org/talk.mp3',
    )
    expect(resolveMediaUrl('//cdn.example.org/talk.mp3', '/x/')).toBe('//cdn.example.org/talk.mp3')
  })
})

describe('youTubeEmbedUrl', () => {
  it('converts a watch link', () => {
    expect(youTubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    )
  })

  it('converts a short link', () => {
    expect(youTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    )
  })

  it('accepts a link that is already an embed', () => {
    expect(youTubeEmbedUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    )
  })

  it('keeps extra query parameters out of the embed', () => {
    expect(youTubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    )
  })

  it('returns null for a link it cannot read, rather than a broken player', () => {
    expect(youTubeEmbedUrl('https://www.youtube.com/watch?v=')).toBeNull()
    expect(youTubeEmbedUrl('https://vimeo.com/12345')).toBeNull()
    expect(youTubeEmbedUrl('not a url')).toBeNull()
    expect(youTubeEmbedUrl('https://www.youtube.com/')).toBeNull()
  })
})
