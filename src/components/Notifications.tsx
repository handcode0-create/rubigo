import { useApp } from '../context/AppContext'
import { formatDate } from '../utils/formatDate'
import { BellIcon, CheckIcon, CloseIcon } from './Icons'
import './Notifications.css'

export function Notifications({ onClose }: { onClose: () => void }) {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useApp()

  return (
    <aside className="notifications-panel" aria-label="Centre de notifications">
      <div className="notifications-head">
        <div>
          <p className="eyebrow">CENTRE RUBIGO</p>
          <h2>Notifications</h2>
        </div>
        <button
          type="button"
          className="notifications-close-btn"
          aria-label="Fermer les notifications"
          onClick={onClose}
        >
          <CloseIcon size={18} />
        </button>
      </div>

      {notifications.length ? (
        <>
          <button type="button" className="mark-all" onClick={markAllAsRead}>
            <CheckIcon size={14} />
            <span>Tout marquer comme lu</span>
          </button>

          <div className="notification-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={
                  notification.read
                    ? 'notification-row read'
                    : 'notification-row unread'
                }
                role="button"
                tabIndex={0}
                onClick={() => markAsRead(notification.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    markAsRead(notification.id)
                  }
                }}
              >
                <span className="notification-dot" />

                <div className="notification-content">
                  <strong>{notification.message}</strong>
                  <small>{formatDate(notification.createdAt)}</small>
                </div>

                <button
                  type="button"
                  className="notification-delete"
                  aria-label={`Supprimer la notification : ${notification.message}`}
                  title="Supprimer"
                  onClick={(event) => {
                    event.stopPropagation()
                    deleteNotification(notification.id)
                  }}
                >
                  <CloseIcon size={12} />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <span className="empty-icon-wrap">
            <BellIcon size={28} />
          </span>
          <strong>Aucune notification</strong>
          <p>Les mises à jour de vos commandes apparaîtront ici.</p>
        </div>
      )}
    </aside>
  )
}
