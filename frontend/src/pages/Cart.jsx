import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { IconArrowRight, IconTrash } from '../components/Icons.jsx'
import { formatPrice, imageUrl, plural } from '../utils/format.js'

export default function Cart() {
  const { items, remove, setQuantity, total, count, clear } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="section container">
        <div className="breadcrumbs">
          <Link to="/">Главная</Link>
          <span>/</span>
          <span>Корзина</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>Корзина</h1>
        <EmptyState
          emoji="🧺"
          title="Корзина пока пустая"
          text="Добавьте игрушку — она будет ждать вас здесь."
          actionLabel="Перейти в каталог"
          actionTo="/catalog"
        />
      </div>
    )
  }

  const delivery = total >= 5000 ? 0 : 350

  return (
    <div className="section">
      <div className="container">
        <div className="breadcrumbs">
          <Link to="/">Главная</Link>
          <span>/</span>
          <span>Корзина</span>
        </div>

        <div className="section-head">
          <div>
            <span className="eyebrow">Корзина</span>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
              {plural(count, 'игрушка', 'игрушки', 'игрушек')} ждут оформления
            </h1>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
            <IconTrash size={16} /> Очистить корзину
          </button>
        </div>

        <div className="cart-layout">
          <div>
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <Link to={`/product/${item.slug}`}>
                  <img src={imageUrl(item.image)} alt={item.name} />
                </Link>

                <div>
                  <Link to={`/product/${item.slug}`} className="product-card-title">
                    {item.name}
                  </Link>
                  <div className="muted small mt-1">
                    {formatPrice(item.price)} · в наличии {item.stock} шт.
                  </div>
                  <div className="cart-item-actions mt-2">
                    <div className="qty">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Уменьшить количество"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.stock}
                        value={item.quantity}
                        onChange={(event) => setQuantity(item.id, event.target.value)}
                        aria-label="Количество"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        aria-label="Увеличить количество"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => remove(item.id)}
                    >
                      <IconTrash size={15} /> Удалить
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="price">{formatPrice(item.price * item.quantity)}</div>
                  <div className="muted small">{formatPrice(item.price)} / шт.</div>
                </div>
              </div>
            ))}
          </div>

          <aside className="summary">
            <h3>Итого</h3>
            <div className="summary-row">
              <span>Товары ({count})</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="summary-row">
              <span>Доставка</span>
              <span>{delivery === 0 ? 'бесплатно' : formatPrice(delivery)}</span>
            </div>
            <div className="summary-row">
              <span>Бесплатная доставка от</span>
              <span>5 000 ₽</span>
            </div>
            <div className="summary-total">
              <span>К оплате</span>
              <span>{formatPrice(total + delivery)}</span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-lg btn-block mt-2"
              onClick={() => navigate('/checkout')}
            >
              Оформить заказ <IconArrowRight />
            </button>
            <Link to="/catalog" className="btn btn-ghost btn-sm btn-block mt-2">
              Продолжить покупки
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}
