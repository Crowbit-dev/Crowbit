import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import styles from './ContextMenu.module.css'

export type ContextMenuItem =
  | { type: 'separator' }
  | {
      type?: 'item'
      icon?: ReactNode
      label: string
      hint?: string
      danger?: boolean
      disabled?: boolean
      onSelect: () => void
    }

export type ContextMenuState = {
  x: number
  y: number
  invoker: HTMLElement | null
  items: ContextMenuItem[]
  keyboard: boolean
  toggle: boolean
}

function ContextMenu({ menu, onClose }: { menu: ContextMenuState; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const keyboardRef = useRef(false)
  const [position, setPosition] = useState({ x: menu.x, y: menu.y, origin: 'top left' })

  // Clamp into the viewport (flip up/left near edges) in a layout effect,
  // so the final position paints on the first frame with no visible snap.
  useLayoutEffect(() => {
    const el = panelRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const fitsRight = menu.x + rect.width + 8 <= window.innerWidth
    const fitsBottom = menu.y + rect.height + 8 <= window.innerHeight
    const x = Math.max(8, fitsRight ? menu.x : menu.x - rect.width)
    const y = Math.max(8, fitsBottom ? menu.y : menu.y - rect.height)
    setPosition({ x, y, origin: `${fitsBottom ? 'top' : 'bottom'} ${fitsRight ? 'left' : 'right'}` })
    if (menu.keyboard) itemRefs.current[0]?.focus()
  }, [menu])

  // Return focus to the invoker after keyboard dismissal.
  useEffect(() => () => {
    if (keyboardRef.current) menu.invoker?.focus?.()
  }, [menu])

  // Dismiss on outside pointerdown, scroll, resize, or Escape.
  // A left-click on a toggle invoker itself is left alone so it can toggle the menu.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (e.button === 0 && menu.toggle && menu.invoker?.contains(target)) return
      if (!panelRef.current?.contains(target)) onClose()
    }
    const onScroll = () => onClose()
    const onResize = () => onClose()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        keyboardRef.current = true
        onClose()
      }
    }
    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menu, onClose])

  const focusItem = (index: number) => {
    const buttons = itemRefs.current.filter(Boolean) as HTMLButtonElement[]
    const next = buttons[(index + buttons.length) % buttons.length]
    next?.focus()
  }

  const handleItemKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
      keyboardRef.current = true
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      focusItem(index + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      focusItem(index - 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      focusItem(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      focusItem(-1)
    }
  }

  return (
    <div
      ref={panelRef}
      className={styles.menu}
      role="menu"
      style={{ left: position.x, top: position.y, transformOrigin: position.origin }}
    >
      {menu.items.map((item, index) => {
        if (item.type === 'separator') {
          return <div key={`sep-${index}`} className={styles.separator} role="separator" />
        }
        const current = menu.items.slice(0, index).filter((entry) => entry.type !== 'separator').length
        return (
          <button
            key={item.label}
            ref={(el) => {
              itemRefs.current[current] = el
            }}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            className={`${styles.item} ${item.danger ? styles.danger : ''}`}
            onClick={(e) => {
              // Keyboard-activated clicks (Enter/Space) report detail 0.
              if (e.detail === 0) keyboardRef.current = true
              item.onSelect()
              onClose()
            }}
            onKeyDown={(e) => handleItemKeyDown(e, current)}
          >
            {item.icon && <span className={styles.icon} aria-hidden="true">{item.icon}</span>}
            <span className={styles.label}>{item.label}</span>
            {item.hint && <span className={styles.hint}>{item.hint}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default ContextMenu
