import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'

export default function NotFound() {
  return (
    <div className="section container">
      <EmptyState
        emoji="🧸"
        title="Страница потерялась"
        text="Мы обыскали всю мастерскую, но такой страницы нет."
        actionLabel="На главную"
        actionTo="/"
      />
      <p className="center mt-2 small muted">
        Или загляните в <Link to="/catalog">каталог игрушек</Link>.
      </p>
    </div>
  )
}
