export const ORDER_STATUSES = [
  { value: 'new', label: 'Новый', className: 'status-new' },
  { value: 'processing', label: 'В обработке', className: 'status-processing' },
  { value: 'shipped', label: 'Отправлен', className: 'status-shipped' },
  { value: 'completed', label: 'Выполнен', className: 'status-completed' },
  { value: 'cancelled', label: 'Отменён', className: 'status-cancelled' }
]

export function statusInfo(status) {
  return (
    ORDER_STATUSES.find((item) => item.value === status) || {
      value: status,
      label: status,
      className: 'status-new'
    }
  )
}

export function formatPrice(value) {
  const number = Number(value || 0)
  const formatted = number.toLocaleString('ru-RU', { maximumFractionDigits: 0 })
  // Неразрывный пробел, чтобы «₽» не переносился на новую строку.
  return `${formatted.replace(/\s/g, '\u00a0')}\u00a0₽`
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function plural(count, one, few, many) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} ${one}`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${count} ${few}`
  return `${count} ${many}`
}

export function initials(name) {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
}

export function imageUrl(image) {
  if (!image) return '/images/products/placeholder.svg'
  if (/^https?:\/\//i.test(image)) return image
  return image.startsWith('/') ? image : `/${image}`
}

export function ratingValue(product) {
  if (product?.rating !== undefined && product?.rating !== null) return Number(product.rating)
  if (product?.reviews_avg_rating !== undefined && product?.reviews_avg_rating !== null) {
    return Number(product.reviews_avg_rating)
  }
  return 0
}

export function ratingCount(product) {
  return Number(product?.reviews_count ?? product?.reviews?.length ?? 0)
}
