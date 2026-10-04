import { IconStar } from './Icons.jsx'

export default function Rating({ value = 0, count = 0, showCount = true, size }) {
  const rounded = Math.round(Number(value) * 2) / 2
  return (
    <span className="rating-row">
      <span className="stars" aria-label={`Рейтинг ${Number(value).toFixed(1)} из 5`}>
        {[1, 2, 3, 4, 5].map((index) => (
          <IconStar
            key={index}
            size={size}
            className={index <= rounded ? 'filled' : ''}
            style={index <= rounded ? { color: '#f0b429', fill: '#f7cd6b' } : undefined}
          />
        ))}
      </span>
      {showCount && (
        <span>
          {Number(value || 0).toFixed(1)}
          {count ? ` · ${count}` : ''}
        </span>
      )}
    </span>
  )
}

export function RatingInput({ value, onChange }) {
  return (
    <span className="rating-input">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= value ? 'on' : ''}
          onClick={() => onChange(star)}
          aria-label={`${star} из 5`}
        >
          <IconStar style={star <= value ? { fill: '#f7cd6b' } : undefined} />
        </button>
      ))}
    </span>
  )
}
