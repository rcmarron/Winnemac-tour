import { describe, expect, it } from 'vitest'
import { DONATION_URL, showSupportInvitation } from './donation'

describe('DONATION_URL', () => {
  it('is the Council’s SwipeSimple page, over https', () => {
    const url = new URL(DONATION_URL)
    expect(url.protocol).toBe('https:')
    expect(url.hostname).toBe('swipesimple.com')
    expect(url.pathname).toBe('/links/lnk_a8868065')
  })

  it('carries no query or fragment that could be mistyped into it', () => {
    const url = new URL(DONATION_URL)
    expect(url.search).toBe('')
    expect(url.hash).toBe('')
  })
})

describe('showSupportInvitation', () => {
  it('stays away until the tour is finished', () => {
    expect(showSupportInvitation([])).toBe(false)
    expect(showSupportInvitation(['first-discovery', 'halfway-there'])).toBe(false)
  })

  it('appears with the completion badge', () => {
    expect(showSupportInvitation(['park-naturalist'])).toBe(true)
  })

  it('is not triggered by finding the hidden stops alone', () => {
    expect(showSupportInvitation(['keen-eye'])).toBe(false)
  })
})
