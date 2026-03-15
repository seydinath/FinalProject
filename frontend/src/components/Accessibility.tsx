import { useState } from 'react'
import '../styles/mobile-menu.css'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  items: { label: string; onClick: () => void }[]
  logo?: React.ReactNode
}

export function MobileMenu({ isOpen, onClose, items, logo }: MobileMenuProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={onClose}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Menu */}
      <nav
        className={`mobile-menu mobile-menu-${isOpen ? 'open' : 'closed'}`}
        aria-label="Navigation mobile"
        aria-hidden={!isOpen}
      >
        <div className="mobile-menu-header">
          {logo && <div className="mobile-menu-logo">{logo}</div>}
          <button
            className="mobile-menu-close"
            onClick={onClose}
            aria-label="Fermer le menu"
            type="button"
          >
            ✕
          </button>
        </div>

        <ul className="mobile-menu-list">
          {items.map((item, index) => (
            <li key={index}>
              <button
                className="mobile-menu-item"
                onClick={() => {
                  item.onClick()
                  onClose()
                }}
                type="button"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}

interface HamburgerButtonProps {
  isOpen: boolean
  onClick: () => void
  label?: string
}

export function HamburgerButton({ isOpen, onClick, label = 'Menu' }: HamburgerButtonProps) {
  return (
    <button
      className={`hamburger-button hamburger-${isOpen ? 'open' : 'closed'}`}
      onClick={onClick}
      aria-label={`${label} (${isOpen ? 'ouvert' : 'fermé'})`}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
      type="button"
    >
      <span className="hamburger-line hamburger-line-1" />
      <span className="hamburger-line hamburger-line-2" />
      <span className="hamburger-line hamburger-line-3" />
    </button>
  )
}

/* ACCESSIBILITY UTILITIES */

export function SkipToMainContent() {
  return (
    <a href="#main-content" className="skip-to-main">
      Aller au contenu principal
    </a>
  )
}

interface AccessibleTabsProps {
  tabs: { id: string; label: string; content: React.ReactNode }[]
}

export function AccessibleTabs({ tabs }: AccessibleTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id)

  return (
    <div className="accessible-tabs" role="tablist">
      <div className="tabs-list">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            id={`${tab.id}-tab`}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map(tab => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${tab.id}-panel`}
          aria-labelledby={`${tab.id}-tab`}
          hidden={activeTab !== tab.id}
          className="tab-content"
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}

interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm
}: AccessibleModalProps) {
  if (!isOpen) return null

  return (
    <>
      <div
        className="modal-backdrop"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            type="button"
          >
            ✕
          </button>
        </div>

        <div id="modal-description" className="modal-content">
          {children}
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
            type="button"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              className="btn-primary"
              onClick={onConfirm}
              type="button"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </>
  )
}

/* TOAST NOTIFICATIONS A11Y */
interface AccessibleToastProps {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export function AccessibleToast({ message, type }: AccessibleToastProps) {
  const roleMap = {
    success: 'status',
    error: 'alert',
    info: 'status',
    warning: 'alert'
  }

  return (
    <div
      role={roleMap[type]}
      aria-live="polite"
      aria-atomic="true"
      className={`toast toast-${type}`}
    >
      {message}
    </div>
  )
}
