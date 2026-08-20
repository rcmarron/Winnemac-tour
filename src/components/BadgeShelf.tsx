import { BADGES } from '../badges'

interface BadgeShelfProps {
  earnedBadgeIds: readonly string[]
}

export function BadgeShelf({ earnedBadgeIds }: BadgeShelfProps) {
  return (
    <section className="shelf" aria-label="Badges">
      <ul className="shelf__list">
        {BADGES.map((badge) => {
          const earned = earnedBadgeIds.includes(badge.id)
          return (
            <li
              key={badge.id}
              className={`chip ${earned ? 'chip--earned' : 'chip--pending'}`}
              title={badge.description}
            >
              <span aria-hidden="true">{earned ? '★' : '☆'}</span> {badge.name}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
