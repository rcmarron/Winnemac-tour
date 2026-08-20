/**
 * The Park Council's own payment page. The app never handles money: this is a
 * plain link out, which keeps card details entirely off this site.
 */
export const DONATION_URL = 'https://swipesimple.com/links/lnk_a8868065'

/**
 * The invitation to give appears only once the tour is finished -- the plan
 * asks for it at the end, alongside the completion badge, not as a standing ask
 * over someone's walk.
 */
export function showSupportInvitation(earnedBadgeIds: readonly string[]): boolean {
  return earnedBadgeIds.includes('park-naturalist')
}
