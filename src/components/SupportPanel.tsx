import { DONATION_URL } from '../donation'

/**
 * The finish: the completion badge, and a gentle invitation to support the
 * park. The link goes to the Council's own page -- no money passes through
 * this app.
 */
export function SupportPanel() {
  return (
    <section className="support">
      <p className="support__eyebrow">Tour complete</p>
      <h2 className="support__title">You walked the whole park</h2>
      <p className="support__text">
        Every stop visited, every question read. If you enjoyed it, the Park Council keeps the
        wildlife, wildflowers and natural areas going.
      </p>
      <a className="button support__button" href={DONATION_URL} target="_blank" rel="noreferrer">
        Support the Park
      </a>
      <p className="support__fine">Opens the Council&rsquo;s own payment page.</p>
    </section>
  )
}
