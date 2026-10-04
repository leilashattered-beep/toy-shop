import { Link } from 'react-router-dom'

export default function EmptyState({ emoji = '🧸', title, text, actionLabel, actionTo, onAction }) {
  return (
    <div className="empty reveal">
      <div className="empty-emoji">{emoji}</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {actionLabel && actionTo && (
        <Link className="btn btn-primary mt-2" to={actionTo}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && !actionTo && onAction && (
        <button type="button" className="btn btn-primary mt-2" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
