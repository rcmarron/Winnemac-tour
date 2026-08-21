import { useEffect, useId, useRef, type ReactNode } from 'react'

interface ModalProps {
  title: string
  /** Hide the title visually where the content already carries a heading. */
  titleHidden?: boolean
  onClose: () => void
  children: ReactNode
}

/**
 * A native <dialog>, so Escape, focus trapping, the backdrop and taking the
 * page out of the tab order all come from the browser rather than from us.
 */
export function Modal({ title, titleHidden = false, onClose, children }: ModalProps) {
  const dialog = useRef<HTMLDialogElement | null>(null)
  const headingId = useId()

  useEffect(() => {
    const element = dialog.current
    if (!element || element.open) return

    element.showModal()
    return () => {
      if (element.open) element.close()
    }
  }, [])

  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-labelledby={headingId}
      // Escape fires cancel; both routes end at the same handler.
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClose={onClose}
      onClick={(event) => {
        // A click on the backdrop lands on the dialog itself, never on its
        // contents, so this closes on backdrop only.
        if (event.target === dialog.current) onClose()
      }}
    >
      <div className="modal__panel">
        <header className="modal__head">
          <h2 id={headingId} className={`modal__title ${titleHidden ? 'visually-hidden' : ''}`}>
            {title}
          </h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </dialog>
  )
}
