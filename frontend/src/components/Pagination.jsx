import { IconChevronLeft, IconChevronRight } from './Icons.jsx'

export default function Pagination({ page, lastPage, onChange }) {
  if (!lastPage || lastPage <= 1) return null

  const pages = []
  const push = (value) => {
    if (!pages.includes(value)) pages.push(value)
  }
  push(1)
  for (let i = page - 1; i <= page + 1; i += 1) {
    if (i > 1 && i < lastPage) push(i)
  }
  if (lastPage > 1) push(lastPage)

  const ordered = pages.sort((a, b) => a - b)

  return (
    <nav className="pagination" aria-label="Постраничная навигация">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <IconChevronLeft size={16} />
      </button>
      {ordered.map((item, index) => {
        const previous = ordered[index - 1]
        return (
          <span key={item} className="row" style={{ gap: 7 }}>
            {previous && item - previous > 1 && <span className="muted">…</span>}
            <button
              type="button"
              className={item === page ? 'active' : ''}
              onClick={() => onChange(item)}
            >
              {item}
            </button>
          </span>
        )
      })}
      <button type="button" disabled={page >= lastPage} onClick={() => onChange(page + 1)}>
        <IconChevronRight size={16} />
      </button>
    </nav>
  )
}
