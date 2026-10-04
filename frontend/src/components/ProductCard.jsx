import { Link } from 'react-router-dom'
import Rating from './Rating.jsx'
import { IconCart } from './Icons.jsx'
import { formatPrice, imageUrl, ratingCount, ratingValue } from '../utils/format.js'
import { useCart } from '../context/CartContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function ProductCard({ product }) {
  const { add } = useCart()
  const toast = useToast()
  const outOfStock = Number(product.stock) <= 0
  const discount =
    product.old_price && Number(product.old_price) > Number(product.price)
      ? Math.round((1 - Number(product.price) / Number(product.old_price)) * 100)
      : 0

  const handleAdd = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (outOfStock) return
    add(product, 1)
    toast.success(`«${product.name}» добавлен в корзину`)
  }

  return (
    <Link to={`/product/${product.slug}`} className="product-card">
      <div className="product-card-media">
        <img src={imageUrl(product.image)} alt={product.name} loading="lazy" />
        {product.category?.name && <span className="tag">{product.category.name}</span>}
        {discount > 0 && <span className="tag tag-right tag-sale">−{discount}%</span>}
        {outOfStock && (
          <span className="tag tag-right tag-out" style={{ top: discount > 0 ? 52 : 14 }}>
            Нет в наличии
          </span>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-title">{product.name}</div>
        <Rating value={ratingValue(product)} count={ratingCount(product)} />
        <div className="product-card-meta">
          <span className="price">
            {formatPrice(product.price)}
            {product.old_price ? (
              <span className="price-old">{formatPrice(product.old_price)}</span>
            ) : null}
          </span>
          <button
            type="button"
            className="btn btn-soft btn-icon"
            onClick={handleAdd}
            disabled={outOfStock}
            title={outOfStock ? 'Товар закончился' : 'В корзину'}
            aria-label="Добавить в корзину"
          >
            <IconCart />
          </button>
        </div>
      </div>
    </Link>
  )
}
